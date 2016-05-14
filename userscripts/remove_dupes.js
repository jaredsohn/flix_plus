// remove_dupes userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, mutation-summary.js, fplib.js
//
// Hide duplicate posters (but never hide those in My List or Continue Watching)
//
// A challenge for this script with Netflix's June 2015 update is that Netflix does
// not load in all of the posters until the user clicks to the right.
//
// When the list of posters gets updated as the user scrolls to the left or right, it
// can be unclear as to which are unique compared to what was previously loaded.
// Thus, we store a list of unique poster ids per row and never mark those poster ids
// as duplicates when the poster list is updated.
//
// Tests (Note: easiest to notice it is working if style is not hidden)
// -- verify that no posters have style applied within My List and Continue Watching
// -- toggle left/right and verify that dupes have style updated
// -- switch sections and back and verify that styles are applied

var keyPrefix = "flix_plus " + fplib.getProfileName() + " ";
var alreadyShown_ = {};
var uniquesForRow_ = {};

// Set CSS for duplicates
var keysDict = {};
keysDict[keyPrefix + "fp_duplicates_style"] = "hide";
fplib.syncGet(keysDict, function(items) {
  console.log(items);
  fplib.definePosterCss("fp_duplicate", items[keyPrefix + "fp_duplicates_style"]);
});

var updateCard = function(smallTitleCard, uniquesForRow, alwaysShowRow) {
  var movieId = fplib.getMovieIdFromReactId(smallTitleCard.getAttribute("data-reactid"));

  if (alwaysShowRow || (uniquesForRow.hasOwnProperty(movieId)) || (!alreadyShown_.hasOwnProperty(movieId))) {
    uniquesForRow[movieId] = true;
    alreadyShown_[movieId] = true;
  } else {
    smallTitleCard.classList.add("fp_duplicate");
    smallTitleCard.parentNode.classList.add("fp_duplicate_p");
  }
};

var clearDupes = function() {
  console.log("clearing dupes lists");
  uniquesForRow_ = {};
  alreadyShown_ = {};
};

// Ensure posters remain faded/tinted when moused over
fplib.applyClassnameToPostersOnArrive([], "fp_duplicate");

fplib.addMutationAndNow("remove_dupes lolomoRow", {element: ".lolomoRow"}, function(summary) {
  // We check if the .lolomo is different than before.  If so, we clear our dupes history
  // We do this here rather than a separate mutation observer for .lolomo because that observer runs
  // after the rows are loaded.  (Another possible solution might be to set up observers with the lolomo
  // as a parent, but this requires not using our addMutationAndNow code since it doesn't allow scoping
  // to a parent node).
  var $lolomo = $(".lolomo");
  if (($lolomo.length) && (!$lolomo[0].classList.contains("fp_lolomo_visited"))) {
    $lolomo[0].classList.add("fp_lolomo_visited");
    clearDupes();
  }

  summary.added.forEach(function(lolomoRow) {
    var rowTitle = "";
    var alwaysShowRow = "";
    var rowTitleElems = lolomoRow.getElementsByClassName("rowTitle");
    if (rowTitleElems.length) {
      var attrType = rowTitleElems[0].getAttribute("type") || "";
      var rowTitleSpans = rowTitleElems[0].getElementsByTagName("span");
      rowTitle = (rowTitleSpans.length) ? rowTitleSpans[0].innerHTML : "";
      if (rowTitle !== "") {
        alwaysShowRow = ((attrType === "queue") || (attrType === "continueWatching"));
        var smallTitleCards = lolomoRow.getElementsByClassName("smallTitleCard");
        [].slice.call(smallTitleCards).forEach(function(smallTitleCard) {
          uniquesForRow_[rowTitle] = uniquesForRow_[rowTitle] || {};
          updateCard(smallTitleCard, uniquesForRow_[rowTitle], alwaysShowRow);
        });
      }
    }
    if (rowTitle === "") {
//      console.log("No rowTitle");
//      console.log(lolomoRow);
      return;
    }

    (function() {
      var rowTitleSaved = rowTitle;
      var alwaysShowRowSaved = alwaysShowRow;
      var sliderContents = lolomoRow.getElementsByClassName("sliderContent");
      if (sliderContents.length) {
        var sliderContentObserver = new MutationObserver(function(mutationRecords) {
          [].slice.call(mutationRecords).forEach(function(mutationRecord) {
            if (mutationRecord.addedNodes !== null) {
              [].slice.call(mutationRecord.addedNodes).forEach(function(node) {
                if (node.classList.contains("slider-item")) {
                  var smallTitleCards = node.getElementsByClassName("smallTitleCard");
                  if (smallTitleCards.length) {
                    uniquesForRow_[rowTitleSaved] = uniquesForRow_[rowTitleSaved] || {};
                    updateCard(smallTitleCards[0], uniquesForRow_[rowTitleSaved], alwaysShowRowSaved);
                  }
                }
              });
            }
          });
          // TODO: make this mutation observer sharable with other scripts such as fade rated/watched?
        });
        sliderContentObserver.observe(sliderContents[0], {
          subtree: false,
          childList: true,
          characterData: false,
          attributes: false
        });
      }
    })();
  });
});
