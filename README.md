flixplus
=======

###About

Flix Plus is a Chrome extension built by Jared Sohn for Lifehacker that helps you customize Netflix.  Read more here: http://lifehacker.com/preview/flix-plus-customizes-netflix-to-your-hearts-desire-1640968001

The source code uses a couple of frameworks:

* While this extension only works in Chrome, OpenForge would make it easier to also build it for other browsers.  (More work would be needed to make this happen.)

* The openforge-greasemonkey-multi-script-compiler is a new framework that helps build browser extensions from userscripts.  (Since this framework has only been used once, a little more work would be needed to use it for creating other extensions.)


###Setup

1. Check out OpenForge as your flix_plus folder (See https://github.com/trigger-corp/browser-extensions.git) and follow the instructions for setting it up.

2. Clone this project as openforge-greasemonkey-multi-script/_inputs/flix_plus

3. Clone the openforge-greasemonkey-multi-script-compiler folder as your openforge-greasemonkey-multi-script folder and follow the instructions for setting it up.


###Building
   You can build an extension by running ./z from the flix_plus folder.  You can point Chrome to look at flix_plus/development/chrome to run the extension.
   

###Licensing
   The input files for the extension are licensed GPL.  Each userscript has its own license (the ones produced by Lifehacker are cross-licensed GPL and MIT).

### Questions?
   Ask.  The source code is being published hastily and should get cleaned up over time.