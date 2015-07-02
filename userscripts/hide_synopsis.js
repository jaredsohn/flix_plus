// hide_synopsis userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js
//
// TODO: Be more careful about how we use arrive to improve performance

var hideSpoilersDisabled_ = false;


////////////////////////////////////////////////////////////////////////////////////////////////
// Utilities
////////////////////////////////////////////////////////////////////////////////////////////////

var arriveAndNow = function(parentElem, selector, options, callback) {
  try {
    if ($(selector).length) {
      for (var i = 0; i < $(selector).length; i++) {
        callback.call($(selector)[i]);
      }
    }
  } catch (ex) {
    console.error(ex);
  }
//  console.log("will arrive on");
//  console.log(parentElem);
  document.body.arrive(selector, options, callback); //TODO: use parentelem here
};

// Add fp_spoiler and fp_spoiler_disabled classes now and for future instances
var addSpoilerClassToSelector = function(parentElem, selector) {
  arriveAndNow(parentElem, selector, { fireOnAttributesModification: true }, function() {
    this.classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");
  });
};
// Add fp_spoiler and fp_spoiler_disabled classes now and for future instances
var addSpoilerBlackClassToSelector = function(parentElem, selector) {
  arriveAndNow(parentElem, selector, { fireOnAttributesModification: true }, function() {
    this.classList.add(hideSpoilersDisabled_ ? "fp_spoilerblack_disabled" : "fp_spoilerblack");
  });
};

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
// Create a div that can be clicked to toggle spoilers (used by Flix Plus keyboard code)
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

// Replacing rotating image with show image (or black)
// TODO: resolution is low; doesn't show for posters before they come big or for the top movie/show
arriveAndNow(document.body, ".image-rotator-image, .jawBoneBackground", null, function() {
//  console.log("updating rotating image for ");
//  console.log(this);

  if (!hideSpoilersDisabled_) {
    this.classList.remove("image-rotator-image");
    this.classList.add("fp-image-rotator-image-spoiler");
    this.style.backgroundImage = ""; // just hide the image
  //  this.classList.remove("image-rotator");
/*
    var ancestors = $(this).parents(".smallTitleCard");
//    console.log("!@#");
//    console.log(ancestors);
//    console.log(ancestors.length);

    if (ancestors.length) {

//      console.log('there is an ancestor');
//      console.log(ancestors[0]);
//      console.log(ancestors[0].getElementsByClassName("video-artwork"));
//      console.log(ancestors[0].getElementsByClassName("video-artwork")[0].style.backgroundImage);

      this.style.backgroundImage = ancestors[0].getElementsByClassName("video-artwork")[0].style.backgroundImage;
    }
    else {
      if ($(".smallTitleCard.highlighted .video-artwork").length) {
        this.style.backgroundImage = $(".smallTitleCard.highlighted .video-artwork")[0].style.backgroundImage;
      }
    }
    this.style.backgroundSize = "100% 100%"; */
  }
});

var selectors = [".episodeArt", ".episodeSynopsis", ".synopsis", ".episodeLockup .episodeTitle", ".simsSynopsis", ".watched-title", ".hero"];
selectors.forEach(function(selector) {
  try {
    addSpoilerClassToSelector(document.body, selector);
  } catch (ex) {
    console.error(ex);
  }
});

var selectors = [".hero"];
selectors.forEach(function(selector) {
  try {
    addSpoilerBlackClassToSelector(document.body, selector);
  } catch (ex) {
    console.error(ex);
  }
});

// TODO: try to also add a div with the title in a spoiler afterward
arriveAndNow(document.body, ".jawbone-overview-info .watched .episodeTitle", { fireOnAttributesModification: true }, function() {
  var origText = getCachedText(this) || "";
  this.innerText = (hideSpoilersDisabled_) ? origText : origText.split("\"")[0];
});


////////////////////////////////////////////////////////////////////////////////////////////////
// Player (HTML5)
////////////////////////////////////////////////////////////////////////////////////////////////
arriveAndNow(document.body, "#playerWrapper .player-loading-background", { fireOnAttributesModification: true }, function() {
  this.style.opacity = hideSpoilersDisabled_ ? 100 : 0;
});

arriveAndNow(document.body, "#playerWrapper .description h2", { fireOnAttributesModification: true }, function() {
  var origText = getCachedText(this) || "";
  this.innerText = (hideSpoilersDisabled_) ? origText : origText.split("“")[0];
});

document.body.arrive("#playerWrapper .playback-longpause-container", { fireOnAttributesModification: true }, function() {
  var paragraphs = $(".playback-longpause-container .content p");
  paragraphs[paragraphs.length - 1].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");

  var h3s = this.getElementsByTagName("h3");
  h3s[h3s.length - 1].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");
});

document.body.arrive("#playerWrapper .player-status", { fireOnAttributesModification: true }, function() {
  var spans = this.getElementsByTagName("span");
  if (spans.length >= 3)
    spans[2].classList.add(hideSpoilersDisabled_ ? "fp_spoiler_disabled" : "fp_spoiler");
});

document.body.arrive("#playerWrapper .description h2", { fireOnAttributesModification: true }, function() {
  var origText = getCachedText(this) || "";
  this.innerText = (hideSpoilersDisabled_) ? origText : origText.split("“")[0];
});

var selectors = ["#playerWrapper .episode-list-image", "#playerWrapper .episode-list-synopsis", "#playerWrapper .next-episode-image",
                "#playerWrapper .episode-list-title", "#playerWrapper .player-next-episode-description",
                "#playerWrapper .player-postplay-episode-synopsis", "#playerWrapper .player-postplay-episode-title",
                "#playerWrapper .player-postplay-autoplay-still"];
selectors.forEach(function(selector) {
  addSpoilerClassToSelector(document.body, selector);
});

