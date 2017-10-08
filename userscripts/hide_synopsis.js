// hide_synopsis userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, fplib.js, mutation-summary.js

"use strict";

var hideSpoilersDisabled_ = false;

////////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////////////////////

// Retrieves cached text (and caches if it wasn't already)
var getCachedText = function(obj) {
  var origText = obj.innerText;
  if ((obj.getAttribute("fp_orig_text") || null) === null)
    obj.setAttribute("fp_orig_text", obj.innerText);
  else
    origText = obj.getAttribute("fp_orig_text");

  return origText;
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Create a div that can be clicked to toggle spoilers (used by Flix Plus keyboard script)
////////////////////////////////////////////////////////////////////////////////////////////////
var elem = document.createElement('div');
elem.id = "fp_spoilers_toggle_button";
document.body.appendChild(elem);
$(elem).on('click', function() {
  if (hideSpoilersDisabled_) {
    $.each($(".fp_spoiler_disabled"), function(index, value) { this.classList.add('fp_spoiler'); this.classList.remove('fp_spoiler_disabled'); });
    $.each($(".image-rotator-image"), function(index, value) { this.classList.add('fp-image-rotator-image-spoiler'); this.classList.remove('image-rotator-image'); });
    $.each($(".fp_spoilerblack_disabled"), function(index, value) { this.classList.add('fp_spoilerblack'); this.classList.remove('fp_spoilerblack_disabled'); });

  }
  else {
    $.each($(".fp_spoiler"), function(index, value) { this.classList.add('fp_spoiler_disabled'); this.classList.remove('fp_spoiler'); });
    $.each($(".fp_spoilerblack"), function(index, value) { this.classList.add('fp_spoilerblack_disabled'); this.classList.remove('fp_spoilerblack'); });
    $.each($(".fp-image-rotator-image-spoiler"), function(index, value) { this.classList.add('image-rotator-image'); this.classList.remove('fp_image-rotator-image-spoiler'); });
  }

  hideSpoilersDisabled_ = !hideSpoilersDisabled_;
  console.log("spoilers disabled = " + hideSpoilersDisabled_);
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Selection pages
////////////////////////////////////////////////////////////////////////////////////////////////

// Replacing rotating image (big and small) with black.  (Attempted replacing it with show image but the one I found is too low res)
// Also, if this is the small popup, then hide the other content there.
fplib.addMutationAndNow("synopsis imagerotatorimage", {element: ".image-rotator-image"}, function(summary) {
  summary.added.forEach(function(elem) {
    if (!hideSpoilersDisabled_) {
      elem.classList.remove("image-rotator-image");
      elem.classList.add("fp-image-rotator-image-spoiler");
      elem.style.backgroundImage = ""; // just hide the image
    }

    // Hide other popup spoilers here
    var className = hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler";
    var $bobCards = $(elem).closest(".bob-card");
    if ($bobCards.length) {
      var synopses = $bobCards[0].getElementsByClassName("synopsis");
      if (synopses.length)
        synopses[0].classList.add(className);
      var episodeTitles = $bobCards[0].getElementsByClassName("watched-title");
      if (episodeTitles.length)
        episodeTitles[0].classList.add(className);
    }
  });
});

// Episode summaries
fplib.addMutation("episodeLockup", {element: ".episodeLockup"}, function(summary) {
  var className = hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler";
  summary.added.forEach(function(elem) {
    try {
      elem.getElementsByClassName("episodeArt")[0].classList.add(className);
      elem.getElementsByClassName("episodeSynopsis")[0].classList.add(className);
      elem.getElementsByClassName("episodeTitle")[0].classList.add(className);
    } catch (ex) {
      console.error(ex);
    }
  });
});

fplib.addMutationAndNow("jawbone-overview-info - hidesynopsis", {element: ".jawbone-overview-info"}, function(summary) {
  var className = hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler";

  function moreLikeThisClick() {
    var count = 0;

    var moreLikeThisInterval = setInterval(function() {
      count++;
      var className = hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler";
      // This applies the class to all .simsSynopsis, which should be fast and is not incorrect
      [].slice.call(document.getElementsByClassName("simsSynopsis")).forEach(function(elem) {
        elem.classList.add(className);
      });
      if (count > 20)
        clearInterval(moreLikeThisInterval);
    }, 50);
  }
  function showDetailsClick() {
    var count = 0;
    var detailsInterval = setInterval(function() {
      count++;
      var className = hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler";
      // This applies the class to all .simsSynopsis, which should be fast and is not incorrect
      [].slice.call(document.getElementsByClassName("reviewText")).forEach(function(elem) {
        elem.classList.add(className);
      });
      if (count > 20)
        clearInterval(detailsInterval);
    }, 50);
  }

  summary.added.forEach(function(elem) {
    try {
      var synopses = elem.getElementsByClassName("synopsis");
      if (synopses.length)
        synopses[0].classList.add(className);
      var episodeTitles = elem.getElementsByClassName("episodeTitle");
      if (episodeTitles.length) {
        // TODO: split off text into a div and some static text
        var origText = getCachedText(episodeTitles[0]) || "";
        episodeTitles[0].innerText = (hideSpoilersDisabled_) ? origText : origText.split("\"")[0];
      }

      var $moreLikeThisClasses = $(elem).closest(".jawBone")[0].getElementsByClassName("MoreLikeThis");
      if ($moreLikeThisClasses.length) {
        $moreLikeThisClasses[0].removeEventListener("click", moreLikeThisClick);
        $moreLikeThisClasses[0].addEventListener("click", moreLikeThisClick);
      }

      var $showDetailsClasses = $(elem).closest(".jawBone")[0].getElementsByClassName("ShowDetails");
      if ($showDetailsClasses.length) {
        $showDetailsClasses[0].removeEventListener("click", showDetailsClick);
        $showDetailsClasses[0].addEventListener("click", showDetailsClick);
      }

    } catch (ex) {
      console.error(ex);
    }
  });
});

// billboard
fplib.addMutationAndNow("hide_synopsis - billboard", {element: ".hero"}, function(summary) {
  summary.added.forEach(function(elem) {
    elem.classList.add(hideSpoilersDisabled_ ? "fp_spoilerblack_disabled" : "fp_spoilerblack");
  });
});

////////////////////////////////////////////////////////////////////////////////////////////////
// Player (HTML5)
////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: all of this should only run when the player is active

fplib.addMutationAndNow("hide_synopsis player - loading background", {element: ".player-loading-background-image"}, function(summary) {
  summary.added.forEach(function(elem) {
    elem.style.opacity = hideSpoilersDisabled_ ? 100 : 0;
  });
});

fplib.addMutationAndNow("hide_synopsis player - playable-title on start", {element: ".playable-title"}, function(summary) {
  summary.added.forEach(function(elem) {
    var origText = getCachedText(elem) || "";
    elem.innerText = (hideSpoilersDisabled_) ? origText : origText.split("“")[0];
  });
});

// shown when paused for awhile
fplib.addMutation("hide_synopsis player - evidence-overlay", {element: ".evidence-overlay"}, function(summary) {
  var $paragraphs = $(".evidence-overlay p");
  if ($paragraphs.length)
    $paragraphs[0].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");

  summary.added.forEach(function(elem) {
    var h3s = elem.getElementsByTagName("h3");
    h3s[h3s.length - 1].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");
  });
});

fplib.addMutation("hide_synopsis player - player status", {element: ".PlayerControls--control-element"}, function(summary) {
  summary.added.forEach(function(elem) {
    var spans = elem.getElementsByTagName("span");
    if (spans.length >= 2)
      spans[1].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");
  });
});

// TODO was .episode-row
fplib.addMutation("hide_synopsis player - episode list", {element: ".nfp-episode-expander"}, function(summary) {
  if (summary.added.length) {
    $.each($(".title"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".thumbnail-image"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".synopsis"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
  }
});

fplib.addMutation("hide_synopsis player - next episode", {element: ".nfp-episode-preview"}, function(summary) {
  if (summary.added.length) {
    $.each($(".nfp-episode-preview .title-and-synopsis"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".nfp-episode-preview .thumbnail-image"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".nfp-episode-preview .synopsis"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
  }
});

fplib.addMutation("hide_synopsis player - Watch Next episode info", {element: ".WatchNext"}, function(summary) {
  if (summary.added.length) {
    $.each($(".WatchNext-background"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoilerblack_disabled" : "fp_spoilerblack") });
    $.each($(".WatchNext-episode-synopsis"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".WatchNext-still"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
    $.each($(".WatchNext-episode-title"), function(index, value) { this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler") });
  }
});
