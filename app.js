// Just a basic server setup for this site
var Connect = require('connect');

var port = process.env.PORT || 3000;

module.exports = Connect.createServer(
  Connect.logger(),
  Connect.conditionalGet(),
  Connect.favicon(),
  Connect.cache(),
  Connect.gzip(),
  require('./wheat/')(__dirname)
).listen(port);
