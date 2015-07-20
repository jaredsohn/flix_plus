// prevent_whos_watching userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, mutation-summary.js, fplib.js

// Current knowledge of when the Who's Watching dialog gets shown:
// -- when first logging in (normal or Facebook)
// -- when clicking on Kids button or when leaving Kids mode
// -- when user has been away for awhile
//
// The intent of this script is to disable the last portion of this functionality.
// Note that users can also disable it if they remove all but one profile.
//
// Also, it is unknown if there is a Who's Watchng dialog shown on timeout when in older Netflix pages
// (i.e. /Kids, /MyList, or watched/rated history)
//
// The current approach will update a timestamp when a relevant button was pressed or when the page loaded.
//
// Note that the timestamp is set in the profilesNewSession cookie.  Just editing the cookie using a cookie
// editing Chrome extension didn't force it to time out earlier and if we tried something programmatically, it
// would require adding the cookie permission to the extension.  An unexplored approach would be to perform some
// minor action within the UI at some interval that would force the page to update the cookie for us.

var keyPrefix_ = "flix_plus ";
var userActionTimeStamp_ = 0;

var ALLOWABLE_DELAY = 10000 ; // 10 seconds

function handleWhosWatchingDialog(profilesGateContainer) {
  var profileNameElems = Array.prototype.slice.call(profilesGateContainer.getElementsByClassName("profile-name")) || [];
  console.log("profilenameelems = ");
  console.log(profileNameElems);
  if (profileNameElems.length) {
  	var now = new Date().getTime();
  	console.log("now: " + now);
  	console.log("userActionTimeStamp_: " + userActionTimeStamp_);
  	console.log("diff:");
  	console.log(now - userActionTimeStamp_);
  	if ((now - userActionTimeStamp_) > ALLOWABLE_DELAY) {
		  var desiredProfileName = fplib.getProfileName();
		  console.log("desiredProfileName = " + desiredProfileName);
      console.log ("*********** HIDING WHO'S WATCHING DIALOG ************")

		  profileNameElems.forEach(function(elem) {
		    if (elem.innerHTML === desiredProfileName) {
		      elem.click();
		    }
		  });
	  } else {
			console.log("who's watching dialog allowed to be shown since delay was short enough.");
	  }
	}
}

var setExcludeClickEventListener = function(elem) {
	if (elem !== null) {
		console.log("registered event listener for ");
		console.log(elem);
		elem.addEventListener("click", function() {
			userActionTimeStamp_ = new Date().getTime();
			console.log(elem);
			console.log("user clicked above at " + userActionTimeStamp_);
		});
	}
};

var main = function() {
	fplib.addMutationAndNow("preventWhosWatching add listener to kids", {"element": ".icon-kids"}, function(summary) {
		summary.added.forEach(function(elem) {
			setExcludeClickEventListener(elem);
		});
	});

	fplib.addMutation("preventWhosWatching mutationAndNowExcludeClick .profilesGateContainer", {"element": ".profilesGateContainer"}, function(summary) {
		summary.added.forEach(function(elem) {
			console.log("handleWhosWatchingDialog mutation");
			handleWhosWatchingDialog(elem);
		});
	});

	var profilesGateContainerElems = document.getElementsByClassName("profilesGateContainer") || [];
	[].slice.call(profilesGateContainerElems).forEach(function(profileGateContainerElem) {
		handleWhosWatchingDialog(profileGateContainerElem);
	});
};

userActionTimeStamp_ = new Date().getTime();
main();
