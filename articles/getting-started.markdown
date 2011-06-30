Title: Getting Started with Cappuccino and Xcode
Author: Nate Martin
Date: Mon Jun 21 2011 23:25:00 GMT-0700 (PDT)
Categories: Getting Started

So you've heard about this new client-side web framework called Cappuccino, and you want to check it out! Maybe you're a Cocoa developer, and you've heard that your experience can transfer over. But how do you get started? What tools should you use? I hope this tutorial will show you the first steps to developing web applications with Cappuccino and Objective-J.

## Prerequisites

For this tutorial there are a few different things you will need to have installed. You can develop cappuccino without these, but this tutorial is specifically showing how to use Xcode.

-   A Mac
-   Xcode 4. Purchase on the [App Store][] or download from the [Apple Developer Center][] if you are a registered developer.
-   [Git][].
-   A text editor

You could develop Cappuccino applications on Windows or Linux, but using a Mac is the only way to visually edit your Cibs.

Xcode 4 is used to edit .cib files, the main way to design your UI. You can use Cappuccino without using .cib files, but it will be much harder. This tutorial is going to show development using Xcode 4.
At the very least, you need to have some version of Xcode installed on your mac in order to have GCC.

You can use XCode to edit text if you want, but feel free to use your text editor of choice!

##Downloading Cappuccino

You have two choices here. 

*   Download the latest stable release

<img src="/getting-started/downloads.png" style="float:right;margin-left: 3em; margin-right: 2em; width:500px;" />
Go to [github.com/280north/cappuccino](https://github.com/280north/cappuccino) and click the download link, and choose the latest version to install. As of the writing of this tutorial, the latest version is v0.9.0. Decompress the downloaded file.

or 

* Clone a development version from git

The Cappuccino development team is usually pretty good about keeping the master branch of code stable. If you want to live on the edge, and see the latest features as they are added, you can build a development version of the code.
Open your terminal, navigate to a directory where you keep source code, and enter `git clone https://github.com/280north/cappuccino.git`


## Installing

Now we have to install Cappuccino. The procedure is the same for stable or development copies. Open Terminal and navigate to the directory of files you just downloaded. Enter `./bootstrap.sh`. This will install some tools (narwhal, browserjs, jake, and shrinksafe) that cappuccino needs to build. Follow the directions during the install, and answer any prompts.

When this is done, we need to tell Cappuccino where to install the frameworks. Open whichever file you use to store environment variables (usually either `~/.bash_profile` or `~/.profile`) and add this line:  
 `export CAPP_BUILD="/path/to/wherever/you/want/build/products/to/go"`, replacing the end with the path to where you want the built products to go. Save this file.

Launch a new terminal window to make sure your new environment variable is loaded, and navigate back to the cappuccino directory. Enter `jake install` to install all the tools Cappuccino needs, and to build all the frameworks and install them in the directory you specified.

We need to install one final application: Xcodecapp-Cocoa

>Note: Very soon, this will be merged into the main Cappuccino install. But for now, this is a separate install

Xcodecapp-cocoa is an application that helps you to use Xcode to develop Cappuccino apps. Download it from [https://github.com/primalmotion/xcodecapp-cocoa](https://github.com/primalmotion/xcodecapp-cocoa). Open the downloaded Xcode project, build the application, and install it in your Applications folder.

## Let's build a webapp!

OK, enough installing, let's make something! Open your terminal again, navigate to your projects directory (you have a "Projects" directory, right?) and type: `capp gen -l -t NibApplication testApp`

You should see some output in your terminal. Let's go over what you just did. `capp` is a command line tool used to generate new Cappuccino projects. Type 'capp --help' to see some options when using this tool.

The `-l` flag told `capp` to symlink to the frameworks you installed earlier. This allows you to upgrade your frameworks at any time, and all your projects will immediately start using the new version.

The `-t` flag told `capp` to use a template called `NibApplication` to generate the project. This is a template that creates the shell of a project based around Cibs. (Maybe the template should be called CibApplication instead?)

Finally, we named the new project testApp.

If you open the newly created testApp directory, you should see a few different files and folders. We'll explain what all these are for in a moment, but first, let's see what was created. Drag the "index-debug.html" file to a web browser to load the page.

<img src="/getting-started/loading.png" style="float:right; margin: 10px; margin-left: 3em; margin-right: 2em;" />
You should see see something like the image to the right: 

What's going on? Why isn't the application loading? Cappuccino loads its UI from files called Cibs. If you look in the Resources directory, you see a file called "MainMenu.xib", but no file called "MainMenu.cib"! Xib (or Nib) files can be edited in XCode, but we need to turn them into Cibs before Cappuccino can use them. Thankfully, there are some great tools to help us with that!

Now it's time to launch "Xcodecapp-cocoa". When it launches, you should see a small cappuccino machine icon in your menubar: <img src="/getting-started/CappIcon.png" style="display:inline; margin-left: 5px; vertical-align: middle;"/>

Click on the menu, choose "Start Listening" and navigate to the project folder you just created in the open dialog that will open. You should see a series of Growl notifications appear. 

What is this program doing? It looks for changes to files in your project, and processes them to help your development. If it sees a .xib or .nib file change, it automatically converts them into a .cib file that Cappuccino can use. And, if a .j file changes, it creates a .h file in a hidden Xcode project, that allows Interface Builder to see outlets and actions.  

<img src="/getting-started/loadingProject.png" style="display:inline; margin-left: 5px; margin-top: 0.25em; margin-bottom: 0.25em;"/> <img src="/getting-started/loadingXib.png" style="display:inline; margin-left: 5px; margin-top: 0.25em; margin-bottom: 0.25em;"/> <img src="/getting-started/loadingAppController.png" style="display:inline; margin-left: 5px; margin-top: 0.25em; margin-bottom: 0.25em;"/><img src="/getting-started/projectLoaded.png" style="display:inline; margin-left: 5px; margin-top: 0.25em; margin-bottom: 0.25em;"/>

You might notice that the .xib file was processed. If you look in the resources directory now, you should have a "MainMenu.cib" file. Let's try loading the application again.

<img src="/getting-started/starterApp.png" style="margin-left: auto; margin-right: auto" />
Hey, it worked!

## Coding Time

Now let's make the application actually do something. As is traditional, let's make a small variant of a "Hello World" program. Click on the Cappuccino icon in the menubar, and choose "Open XCode".

Your project should open up in XCode. Click on "AppController.j" to edit the file, and change the contents to:


    /*
     * AppController.j
     * testApp
     *
     * Created by You on June 22, 2011.
     * Copyright 2011, Your Company All rights reserved.
     */

    @import <Foundation/CPObject.j>


    @implementation AppController : CPObject
    {
        CPWindow    theWindow; //this "outlet" is connected automatically by the Cib
        
            //Outlet to the text field
        @outlet CPTextField textField;

    }

    - (void)applicationDidFinishLaunching:(CPNotification)aNotification
    {
        // This is called when the application is done loading.
    }

    - (void)awakeFromCib
    {
        // This is called when the cib is done loading.
        // You can implement this method on any object instantiated from a Cib.
        // It's a useful hook for setting up current UI values, and other things.

        // In this case, we want the window from Cib to become our full browser window
        [theWindow setFullPlatformWindow:YES];
    }

    - (@action)buttonClicked:(id)sender
    {
        [textField setObjectValue:@"Hello Cappuccino!"];
    }

    @end

If you are a cocoa developer, this probably looks very familiar to you. If not, we will have some other tutorials on this site that can help introduce you to the language.

(By the way, when you saved the file, you probably saw a growl notification telling you that the .j file had been processed. Pretty cool, huh?)

Now, in XCode, click on "MainMenu.xib" to start editing the UI. Click on the small window icon <img src="/getting-started/windowIcon.png" style="display:inline; margin-left: 5px; margin-right: 5px; vertical-align: middle; margin-top: 0em; margin-bottom: 0em;"/> to show the window we're editing, and click on the "right panel" button <img src="/getting-started/viewbuttons.png" style="display:inline; margin-left: 5px; margin-right: 5px; vertical-align: middle; margin-top: 0em; margin-bottom: 0em;"/> to show the inspector. Your Xcode window should look something like this:

<img src="/getting-started/XCode-IB.png" style=" margin-left: auto; margin-right:auto; vertical-align: middle; width: 75%"/>

Delete the slider, and add a button from the library on the right. Center the button under the text field, and doubleclick on it to change the title. Change the title to "Say Hello" and then resize the button to be 90 pixels wide. <img src="/getting-started/UI1.png" style="display:inline; margin-left: 5px; margin-right: 5px; vertical-align: middle; margin-top: 0em; margin-bottom: 0em;"/>

With the button selected, click on the "ruler" icon in the inspector on the right.<img src="/getting-started/ruler.png" style="display:inline; margin-left: 5px; margin-right: 5px; vertical-align: middle; margin-top: 0em; margin-bottom: 0.5em;"/> Set the autoresizing behavior to stay centered by deselecting all the constraints. It should look like this: <img src="/getting-started/resizing.png" style="display:inline; margin-left: 5px; margin-right: 5px; vertical-align: middle; margin-top: 0em; margin-bottom: 0em;"/>

<img src="/getting-started/makeAction.png" style=" float: right; margin-left: 3em; margin-right: 2em; margin-bottom:2em;"/>
Hold the "control" key and drag from the "Say Hello" button. You should see a blue line following your mouse. Drag this over to the blue cube on the left labeled "App Controller" and release the drag.   A menu labeled "received actions" should pop up, with a method `buttonClicked:` listed below. Click on `buttonClicked:`. What did we just do there? We told the button to call the `buttonClicked:` method of your App Controller class whenever it is pressed. This method was displayed in the menu because it was declared with the keyword `@action`: 

    - (@action)buttonClicked:(id)sender

If you look at the `buttonClicked:` method in the code above, you can see that it is sending a message to a textField. How does it know what textfield to set? Scroll to the top of the code, and you will see that the "textField" instance variable was declared with the keyword `@outlet` before it:

    @outlet CPTextField textField;

<img src="/getting-started/makeOutlet.png" style=" float: right; margin-left: 3em; margin-right: 2em;"/> 
This will allow us to connect this variable to an object in the nib. Go back to XCode, hold control, and drag from the App Controller blue cube over to the text field. When you release the drag, you will see a menu. Click on `textField`. You now connected the `textField` instance variable to the CPTextField in the window.

Finally, double click on the text box and type "Hello World!" to set the default text, and resize the textfield to be 140 pixels wide. Center the text field, and you're done! 

<img src="/getting-started/UI-final.png" style=" clear: both; margin-top: 20px; margin-left: auto; margin-right:auto; vertical-align: middle; width: 55%"/>

Save the .xib file. (You should be rewarded by another growl notification that the nib was converted for you!)

Reload your app in your web browser. You should see the UI you just created. Click on the "Say Hello" button, and the text should change to say "Hello Cappuccino!"

Congratulations, you just made your first Cappuccino webapp with Xcode! Other tutorials on this site will explain some of what you just saw here. Nibs/Cibs are very powerful tools, but they aren't magic. Learning to use them well will make your future Cappuccino development much more efficient and fun.

<img src="/getting-started/done.png" style=" clear: both; margin-top: 20px; margin-left: auto; margin-right:auto; vertical-align: middle; width: 75%"/>

[App Store]: http://itunes.apple.com/us/app/xcode/id422352214?mt=12
[Apple Developer Center]: http://developer.apple.com/
[Git]: http://git-scm.com/download