flixplus
=======

###About

Flix Plus is a Chrome extension built by Jared Sohn for Lifehacker that helps you customize Netflix.  Read more here: http://lifehacker.com/preview/flix-plus-customizes-netflix-to-your-hearts-desire-1640968001

The source code uses a couple of frameworks:

* It uses [OpenForge](https://github.com/trigger-corp/browser-extensions) to make it easier to build cross-browser extensions.  However, at this time it only works for Chrome and more work would be necessary to support other browsers.

* It uses [openforge-greasemonkey-multi-script-compiler](https://www.github.com/jaredsohn/openforge-greasemonkey-multi-script-compiler), which is a new framework built for this extension to make it easier to build browser extensions from userscripts.  (Since this framework has only been used once, more work would be needed to adapt it to other extensions.)


###Setup

1. Check out [OpenForge](https://github.com/trigger-corp/browser-extensions) as your flix_plus folder and follow OpenForge's setup instructions.

2. Clone the openforge-greasemonkey-multi-script-compiler folder as your openforge-greasemonkey-multi-script folder and follow the instructions for setting it up.

3. Clone this project as openforge-greasemonkey-multi-script/_inputs/flix_plus and continue following the compiler instructions.



###Building
   See the openforge-greasemonkey-multi-script compiler documentation for build instructions.


###Licensing
   The configuration files in this repository (except for some images) are licensed GPL.  Each userscript has its own license (the ones produced by Lifehacker are cross-licensed GPL and MIT).

### Questions?
   Ask.  The source code is being published hastily and should get cleaned up over time.
