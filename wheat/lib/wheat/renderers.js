var Git = require('git-fs'),
    Data = require('./data'),
    Tools = require('./tools'),
    Buffer = require('buffer').Buffer,
    Prettify = require('./prettify'),
    MD5 = require('./md5'),
    ChildProcess = require('child_process'),
    getMime = require('simple-mime')('application/octet-string'),
    Step = require('step');

// Execute a child process, feed it a buffer and get a new buffer filtered.
function execPipe(command, args, data, callback) {
  var child = ChildProcess.spawn(command, args);
  var stdout = [], stderr = [], size = 0;
  child.stdout.on('data', function onStdout(buffer) {
    size += buffer.length;
    stdout[stdout.length] = buffer;
  });
  child.stderr.on('data', function onStderr(buffer) {
    stderr[stderr.length] = buffer;
  });
  child.on('error', function onExit(err) {
    callback(err);
  });
  child.on('exit', function onExit(code) {
    if (code > 0) {
      callback(new Error(stderr.join("")));
    } else {
      var buffer = new Buffer(size);
      var start = 0;
      for (var i = 0, l = stdout.length; i < l; i++) {
        var chunk = stdout[i];
        chunk.copy(buffer, start);
        start += chunk.length;
      }
      callback(null, buffer);
    }
  });
  if (typeof data === 'string') {
    child.stdin.write(data, "binary");
  } else {
    child.stdin.write(data);
  }
  child.stdin.end();
}

// This writes proper headers for caching and conditional gets
// Also gzips content if it's text based and stable.
function postProcess(headers, buffer, version, path, callback) {
  Step(
    function buildHeaders() {
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "text/html; charset=utf-8";
      }
      var date = new Date().toUTCString();
      headers["Date"] = date;
      headers["Server"] = "Wheat (node.js)";
      if (version === 'fs') {
        delete headers["Cache-Control"];
      } else {
        headers["ETag"] = MD5.md5(version + ":" + path + ":" + date);
      }

      if (/html/.test(headers["Content-Type"])) {
        buffer = Tools.stringToBuffer((buffer+"").replace(/<pre><code>[^<]+<\/code><\/pre>/g,
          function applyHighlight(code) {
            var code = code.match(/<code>([\s\S]+)<\/code>/)[1];
            code = Prettify.prettyPrintOne(code)
            return "<pre><code>" + code + "</code></pre>";
          }
        ));
      }

      headers["Content-Length"] = buffer.length;

      return {
        headers: headers,
        buffer: buffer
      };
    },
    callback
  );
}

function insertSnippets(markdown, snippets, callback) {
  Step(
    function () {
      Tools.compileTemplate('snippet', this);
    },
    function (err, snippetTemplate) {
      if (err) { callback(err); return; }
      snippets.forEach(function (snippet) {
        var html = snippetTemplate({snippet: snippet});
        markdown = markdown.replace(snippet.original, html);
      });
      return markdown;
    },
    callback
  )
}

var Renderers = module.exports = {
  index: Git.safe(function index(version, callback) {
    var articles,
        description,
        categories,
        contribute,
        index_categories;
    Step(
      function getHead() {
        Git.getHead(this);
      },
      function loadData(err, head) {
        if (err) { callback(err); return; }
        Data.articles(version, this.parallel());
        Git.readFile(head, "description.markdown", this.parallel());
				Data.categories(version, this.parallel());
        Git.readFile(head, "contribute.markdown", this.parallel());
      },
      function renderPartials(err, _articles, _description, _categories, _contribute) {
        articles = _articles;
        description = _description;
        categories = _categories;
        contribute = _contribute;
        index_categories = [ "Getting Started", "Testing"];
        var group = this.group();
        index_categories.forEach(function (category_name) {
          Tools.render("category_summary", {category: categories[category_name]}, group(), true);
        });
        
      },
      function applyTemplate(err, categories_list) {
        if (err) { callback(err); return; }
        Tools.render("index", {
          articles: articles,
          description: description,
					categories: categories,
          categories_list: categories_list,
          index_categories: index_categories,
          contribute: contribute,
        }, this);
      },
      function callPostProcess(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, "index", this);
      },
      callback
    );
  }),

  feed: Git.safe(function feed(version, callback) {
    var articles;
    Step(
      function loadData() {
        Data.fullArticles(version, this);
      },
      function (err, data) {
        if (err) { callback(err); return; }
        articles = data;
        var group = this.group();
        articles.forEach(function (article) {
          insertSnippets(article.markdown, article.snippets, group());
        });
      },
      function applyTemplate(err, markdowns) {
        if (err) { callback(err); return; }
        markdowns.forEach(function (markdown, i) {
          articles[i].markdown = markdown;
        });
        Tools.render("feed.xml", {
          articles: articles
        }, this, true);
      },
      function finish(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Content-Type":"application/rss+xml",
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, "feed.xml", this);
      },
      callback
    );
  }),

  article: Git.safe(function renderArticle(version, name, callback) {
    var article, description,  articles;
    Step(
      function loadData() {
        Git.getHead(this.parallel());
        Data.fullArticle(version, name, this.parallel());
        Data.articles(version, this.parallel());
      },
      function (err, head, props, _articles) {

        if (err) { callback(err); return; }
        articles = _articles;
        article = props;
        insertSnippets(article.markdown, article.snippets, this.parallel());
        categories_list = [ "Getting Started", "Frameworks", "Debugging", "Deployment", "Advanced"];
        Git.readFile(head, "description.markdown", this.parallel());
        Git.readFile(head, "contribute.markdown", this.parallel());


      },
      function applyTemplate(err, markdown, description, contribute) {

        if (err) { callback(err); return; }
        article.markdown = markdown;
        Tools.render("article", {
          title: article.title,
          article: article,
          author: article.author,
          description: description,
          articles: articles,
          categories_list: categories_list,
          contribute: contribute,
        }, this);
      },
      function finish(err, buffer) {

        if (err) { callback(err); return; }
        postProcess({
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, name, this);
      },
      callback
    );
  }),

  categoryIndex: Git.safe(function index(version, category, callback) {
    Step(
      function getHead() {
        Git.getHead(this);
      },
      function loadData(err, head) {
        if (err) { callback(err); return; }
        Data.articles(version, this.parallel());
        Git.readFile(head, "description.markdown", this.parallel());
				Data.categories(version, this.parallel());
      },
      function applyTemplate(err, articles, description, categories) {
        if (err) { callback(err); return; }
				
        var articlesForCategory = articles.reduce(function (start, element){
          return element.categories && element.categories.indexOf(category) >= 0 ? start.concat(element) : start;
        }, []);
								
        Tools.render("index", {
          articles: articlesForCategory,
          description: description,
					categories: categories
        }, this);
      },
      function callPostProcess(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Cache-Control": "public, max-age=3600"
        }, buffer, version, "index", this);
      },
      callback
    );
  }),

  staticFile: Git.safe(function staticFile(version, path, callback) {
    Step(
      function loadPublicFiles() {
        Git.readFile(version, "skin/public/" + path, this);
      },
      function loadArticleFiles(err, data) {
        if (err) {
          Git.readFile(version, "articles/" + path, this);
        }
        return data;
      },
      function processFile(err, string) {
        if (err) { callback(err); return; }
        var headers = {
          "Content-Type": getMime(path),
          "Cache-Control": "public, max-age=32000000"
        };
        var buffer = new Buffer(string.length);
        buffer.write(string, 'binary');
        postProcess(headers, buffer, version, path, this);
      },
      callback
    );
  }),

  dotFile: Git.safe(function dotFile(version, path, callback) {
    Step(
      function loadPublicFiles() {
        Git.readFile(version, "skin/public/" + path, this);
      },
      function loadArticleFiles(err, data) {
        if (err) {
          Git.readFile(version, "articles/" + path, this);
        }
        return data;
      },
      function processFile(err, data) {
        if (err) { callback(err); return; }
        execPipe("dot", ["-Tpng"], data, this);
      },
      function finish(err, buffer) {
        if (err) { callback(err); return; }
        postProcess({
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=32000000"
        }, buffer, version, path, this);
      },
      callback
    );
  })
}
