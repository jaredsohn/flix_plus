// prevent_whos_watching userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js

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
// This works by keeping track of what relevant buttons that were recently clicked.
// If a button that would show the dialog was recently clicked, then we assume that the
// dialog should not be hidden.
//
// We write to localstorage for situations where the contentscripts have to be reloaded before showing
// the dialog (such as at login.)

var keyPrefix_ = "flix_plus ";
var lastNetflixVisit_ = 0;

var ALLOWABLE_DELAY = 10000 ; // 10 seconds

// TODO: evaluate this.
var MIN_WHOSWATCHING_TIME = 1000 * 60 * 1; // only allow a Who's Watching on first Netflix load if it has been at least this long.


// ___ TODO: consider editing cookie directly (first by hand) ___

function handleWhosWatchingDialog(profilesGateContainer) {
  var profileNameElems = Array.prototype.slice.call(profilesGateContainer.getElementsByClassName("profileName")) || [];
  console.log("profilenameelems = ");
  console.log(profileNameElems);
  if (profileNameElems.length) {
  	var obj = {};
  	obj[keyPrefix_ + "prevent_whos_watching_timestamp"] = 0;
  	chrome.storage.local.get(obj, function(items) {
	  	var timeStamp = items[keyPrefix_ + "prevent_whos_watching_timestamp"];
	  	console.log("read timestamp: " + timeStamp);
	  	//TODO delete localStorage[keyPrefix_ + "prevent_whos_watching_timestamp"];
	  	console.log("diff = " + (new Date().getTime() - timeStamp));
	  	console.log("diff2 = " + (new Date().getTime() - lastNetflixVisit_));
	    if (((new Date().getTime() - timeStamp) > ALLOWABLE_DELAY) &&
	    	   (new Date().getTime() - lastNetflixVisit_ > MIN_WHOSWATCHING_TIME)) {
			  var desiredProfileName = fplib.getProfileName();
			  console.log("desiredProfileName = " + desiredProfileName);

	      console.log ("*********** WE'RE STILL WATCHING! ************")
	      //alert ("Normally we would just log in as " + desiredProfileName + " here. This code is still being tested (and it is hard to replicate the situation.)");

			  profileNameElems.forEach(function(elem) {
			    if (elem.innerHTML === desiredProfileName) {
			      elem.click();
			    }
			  });
		  } else {
				console.log("who's watching dialog okay since delay was short enough.");
		  }
  	});
	}
}

var setExcludeClickEventListener = function(selector) {
	if (($(selector) || null) !== null) {
		$(selector).each(function(e) {
			console.log("registered event listener for " + selector);
			this.addEventListener("click", function() {
				console.log("exclude_click");
				var timestamp = new Date().getTime();
				console.log(timestamp);
				console.log(keyPrefix_ + "prevent_whos_watching_timestamp");
				var obj = {};
				obj[keyPrefix_ + "prevent_whos_watching_timestamp"] = timestamp;
				chrome.storage.local.set(obj, function(items) {
					console.log("wrote timestamp to storage.local");
				});
			});
		});
	}
};

// Create an event listener either now or when possible
var arriveAndNowExcludeClick = function(selector) {
	$(selector).each(function() {
		setExcludeClickEventListener(selector);
	});
	document.body.arrive(selector, {fireOnAttributesModification: true }, function() {
		setExcludeClickEventListener(selector);
	});
};

var main = function() {
	console.log("1");
	arriveAndNowExcludeClick(".btn-exitKids");
	arriveAndNowExcludeClick(".kidsHeaderAvatar");
	arriveAndNowExcludeClick(".icon-kids");
	arriveAndNowExcludeClick("#login-form-contBtn");
	arriveAndNowExcludeClick("#fbLoginBtn");
	arriveAndNowExcludeClick(".profilesGateContainer .profileName");
	arriveAndNowExcludeClick(".profilesGateContainer .profileIcon");

	console.log("2");

	document.body.arrive(".profilesGateContainer", {fireOnAttributesModification: true }, function() {
		console.log("handleWhosWatchingDialog arrive");
		handleWhosWatchingDialog(this);
	});
	console.log("3");

	var profilesGateContainerElems = document.getElementsByClassName("profilesGateContainer") || [];
	console.log(profilesGateContainerElems);
	console.log(profilesGateContainerElems.length);
	if (profilesGateContainerElems.length) {
		[].slice.call(profilesGateContainerElems).forEach(function(profileGateContainerElem) {
			console.log("handle");
			handleWhosWatchingDialog(profileGateContainerElem);
		});
	}
	console.log("end");
};

// Get and update timestamp for last Netflix visit
var obj = {};
obj[keyPrefix_ + "lastNetflixVisit"] = 0;
chrome.storage.local.get(obj, function(items) {
	lastNetflixVisit_ = items[keyPrefix_ + "lastNetflixVisit"];

	var obj = {};
	obj[keyPrefix_ + "lastNetflixVisit"] = new Date().getTime();

	chrome.storage.local.set(obj, function(items) {
		main();
	});
});
