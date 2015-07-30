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
// TODO: various issues if style is 'hidden' (including offset when zooming, black spots (use rolloverImages), not showing all posters that it should)
// TODO: need to apply style again after zooming in
//
// Tests (Note: easiest to notice it is working if style is not hidden)
// -- verify that no posters have style applied within My List and Continue Watching
// -- toggle left/right and verify that dupes have style updated
// -- switch sections and back and verify that styles are applied

var keyPrefix = "flix_plus " + fplib.getProfileName() + " ";
var alreadyShown_ = {};

// Set CSS for duplicates
var keysDict = {};
keysDict[keyPrefix + "fp_duplicates_style"] = "hide";
fplib.syncGet(keysDict, function(items) {
  console.log(items);
  fplib.definePosterCss("fp_duplicate", items[keyPrefix + "fp_duplicates_style"]);
});

var updateCard = function(smallTitleCard, uniquesForRow, alwaysShowRow) {
  var movieId = fplib.getMovieIdFromField(smallTitleCard.id);
  if (alwaysShowRow || (uniquesForRow.hasOwnProperty(movieId)) || (!alreadyShown_.hasOwnProperty(movieId))) {
    uniquesForRow[movieId] = true;
    alreadyShown_[movieId] = true;
  } else {
    smallTitleCard.classList.add("fp_duplicate");
    smallTitleCard.parentNode.classList.add("fp_duplicate_p");
  }
};

var clearDupes = function() {
  fplib.addMutationAndNow("remove_dupes lolomoRow", {element: ".lolomoRow"}, function(summary) {
    var uniquesForRow = {};
    var alwaysShowRow;

    summary.added.forEach(function(lolomoRow) {
      var rowTitleElems = lolomoRow.getElementsByClassName("rowTitle");
      if (rowTitleElems.length) {
        var attrType = rowTitleElems[0].getAttribute("type") || "";
        alwaysShowRow = ((attrType === "queue") || (attrType === "continueWatching"));
        if (alwaysShowRow)
          console.log("always show row!");
        var smallTitleCards = lolomoRow.getElementsByClassName("smallTitleCard");
        [].slice.call(smallTitleCards).forEach(function(smallTitleCard) {
          updateCard(smallTitleCard, uniquesForRow, alwaysShowRow);
        });
      } else {
        console.error("No rowTitle");
        console.error(lolomoRow);
      }

      var sliderContents = lolomoRow.getElementsByClassName("sliderContent");
      if (sliderContents.length) {
        var sliderContentObserver = new MutationObserver(function(mutationRecords) {
          [].slice.call(mutationRecords).forEach(function(mutationRecord) {
            if (mutationRecord.addedNodes !== null) {
              [].slice.call(mutationRecord.addedNodes).forEach(function(node) {
                if (node.className === "slider-item") {
                  var smallTitleCards = node.getElementsByClassName("smallTitleCard");
                  if (smallTitleCards.length) {
                    updateCard(smallTitleCards[0], uniquesForRow, alwaysShowRow);
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
          attributes: false,
        });
      }
    });
  });
};

fplib.addMutationAndNow("remove_dupes for clear history", {element: ".lolomo"}, function(summary) {
  alreadyShown_ = {};
  console.log("clearing history");
  clearDupes();
});
