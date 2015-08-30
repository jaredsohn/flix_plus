// keyboard_shortcuts userscript for Netflix
// Script originally written by Dustin Luck (https://github.com/DustinLuck) and found at http://userscripts.org:8080/scripts/show/124120 as version 1.10.2012.418
// Heavily rewritten by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, extlib.js, fplib.js
//
// Changes include:
// * Supporting changes to the Netflix site and generally supports more pages
// * Letting a user custom define keys
// * A lot of new commands (especially in the player and some Flix Plus-specific ones)
// * Updating for Netflix June 2015 redesign

"use strict";

// Since exclude support is disabled in compiler, do it manually here
if (window.location.pathname.indexOf("/KidsCharacter") === 0)
  return;

var smallTitleCard_ = null;

var keyboardCommandsShown_ = false;
var alreadyHasShiftChars_ = ["~", "!", "@", "#", "$", "%", "^", "&", "*",
                             "(", ")", "_", "+", "{", "}", "|", ":", "\"",
                             "<", ">", "?"];
var preventDefaultKeys_ = ["Home", "End", "Ctrl-Home", "Ctrl-End", "Space"];
var speed_ = 1;
var keyboardShortcutToIdDict_ = {};
var keyboardIdToShortcutDict_ = {};

var profilesMode_ = false;
var selectedProfile_ = null;

var rowOrBillboardSelector_ = ".lolomoRow, .billboard-row, .billboard-motion";
var rowOrBillboardOrTitleSelector_ = ".lolomoRow, .billboard-row, .billboard-motion, .jawBoneContainer";

var statusClearer_ = null;

/////////////////////////////////////////////////////////////////////////////
// Utilities
/////////////////////////////////////////////////////////////////////////////

var getElemContainer = function() {
  if (isBillboard(smallTitleCard_))
    return smallTitleCard_; // billboard rows are their own container

  var containers = nextInDOM(".jawBone, .billboard-row, .billboard-motion", $(smallTitleCard_));
  return (containers.length) ? containers[0] : null;
};

var isBillboard = function(elem) {
  return ((elem.classList.contains("billboard-row")) ||
          (elem.classList.contains("billboard-motion")));
}

/////////////////////////////////////////////////////////////////////////////
// Open a link based on selection
/////////////////////////////////////////////////////////////////////////////

var getMovieIdFromSelection = function(element) {
  if (element === null)
    return "0";
  else if (isBillboard(element)) {
    var $ptrackContent = $(".info .ptrack-content", $(element));
    if ($ptrackContent.length === 0)
      return "0";
    var id = "";
    var parts = $ptrackContent[0].getAttribute("data-ui-tracking-context").split(",");
    parts.forEach(function(part) {
      var parts2 = part.split(":");
      if (parts2[0] === "%22video_id%22") {
        var parts3 = parts2[1].split("%");
        id = parts3[0];
      }
    });
    return id;
  } else {
    var jawBoneContainer = null;
    if (element.classList.contains("jawBoneContainer"))
      jawBoneContainer = element;
    else {
      var $jawBoneContainers = nextInDOM(".jawBoneContainer", $(smallTitleCard_));
      if ($jawBoneContainers.length)
        jawBoneContainer = $jawBoneContainers[0];
    }
    return (jawBoneContainer !== null) ? jawBoneContainer.id : "0";
  }
};

var playOrZoomMovie = function(command) {
  var movieId = getMovieIdFromSelection(smallTitleCard_);
  var isBillboardEpisode = $(".billboard-pane-episodes", $(smallTitleCard_)).length;

  if ((movieId !== "0") || isBillboardEpisode) {
    switch (command) {
      case "play":
        var elemContainer = getElemContainer();
        var $episodesSelected = $(".episodeLockup.current .episodePlay", elemContainer);
        if ($episodesSelected.length)
          $episodesSelected[0].click();
        else
          window.location = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movieId;
        break;
      case "zoom_into_details":
        if (isBillboardEpisode)
          return;
        if (window.location.pathname.indexOf("/Kids") === 0) // this also matches other Kids pages, but changing the URL for that is okay
          window.location = window.location.protocol + "//www.netflix.com/KidsMovie/" + movieId;
        else
          window.location = window.location.protocol + "//www.netflix.com/title/" + movieId;
        break;
    }
  }
};

var clickSelectorForLolomorow = function(selector) {
  var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
  if ($lolomoRows.length) {
    var selected = $(selector, $($lolomoRows[0]));
    if (selected.length)
      selected[0].click();
  }
};

var openSectionLink = function() {
  var $lolomowRow = $(smallTitleCard_).closest(rowOrBillboardSelector_);
  if ($lolomowRow.length) {
    var rowTitles = $lolomowRow[0].getElementsByClassName("rowTitle");
    if (rowTitles.length)
      rowTitles[0].click();
  }
};

/////////////////////////////////////////////////////////////////////////////
// Add/remove from queue, assign rating
/////////////////////////////////////////////////////////////////////////////

var removeFromQueue = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    var buttons = elemContainer.getElementsByClassName("icon-button-mylist-added");
    if (buttons.length)
      buttons[0].click();
  }
};

var addToQueue = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    var buttons = elemContainer.getElementsByClassName("icon-button-mylist-add");
    if (buttons.length)
      buttons[0].click();
  }
};

var rateMovie = function(rating) {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    var actualRating = rating.substring(5);

    var elems = $("[data-rating=\"" + actualRating + "\"]", $(elemContainer));
    if (elems.length)
      elems[0].click();
  }
};

var nextSeason = function() {
  if (switchToEpisodeViewIfBillboard())
    return;

  var elemContainer = getElemContainer();
  if (elemContainer) {
    var $dropDowns = $(".nfDropDown .label", $(elemContainer));
    if ($dropDowns.length) {
      var currentSeasonTitle = $(".nfDropDown .sub-menu-link", $(elemContainer))[0].innerHTML;
      $dropDowns[0].click();

      var $nextElems = $('.sub-menu a', $(elemContainer)).filter(function() { return ($(this).text() === currentSeasonTitle); }).parent().next("li");
      if ($nextElems.length) {
        $($nextElems[0]).children()[0].click();
      } else {
        $dropDowns[0].click();
      }
    }
  }
};
var prevSeason = function() {
  if (switchToEpisodeViewIfBillboard())
    return;

  var elemContainer = getElemContainer();
  if (elemContainer) {
    var $dropDowns = $(".nfDropDown .label", $(elemContainer));
    if ($dropDowns.length) {
      var currentSeasonTitle = $(".nfDropDown .sub-menu-link", $(elemContainer))[0].innerHTML;
      $dropDowns[0].click();

      var $prevElems = $('.sub-menu a', $(elemContainer)).filter(function() { return ($(this).text() === currentSeasonTitle); }).parent().prev("li");
      if ($prevElems.length) {
        $($prevElems[0]).children()[0].click();
      } else {
        $dropDowns[0].click();
      }
    }
  }
};

var switchToEpisodeViewIfBillboard = function() {
  var elemContainer = getElemContainer();
  if (isBillboard(elemContainer)) {
    var $iconButtonEpisodes = $(".icon-button-episodes");
    if ($iconButtonEpisodes.length)
      $iconButtonEpisodes[0].click();
  }

  return false;
}

var nextPreviousEpisode = function(direction) {
  if (switchToEpisodeViewIfBillboard())
    return;
  var container = getElemContainer();
  var $curEpisodes = $(".episodeLockup.current", container);
  if ($curEpisodes.length) {
    if (direction === 1) {
      var $nextEpisodes = nextInDOM(".episodeLockup", $curEpisodes);
      if ($nextEpisodes.length) {
        if ($nextEpisodes[0].parentNode.parentNode == $curEpisodes[0].parentNode.parentNode) {
          $nextEpisodes[0].classList.add("current");
          $curEpisodes[0].classList.remove("current");
        }
      }
    } else if (direction === -1) {
      var $prevEpisodes = prevInDOM(".episodeLockup", $curEpisodes);
      if ($prevEpisodes.length) {
        if ($prevEpisodes[0].parentNode.parentNode == $curEpisodes[0].parentNode.parentNode) {
          $prevEpisodes[0].classList.add("current");
          $curEpisodes[0].classList.remove("current");
        }
      }
    }
  }

  $curEpisodes = $(".episodeLockup.current", container);

  // If episode isn't visible, we scroll left/right a screen, wait for the episode
  // to reload and then select it
  if (($curEpisodes.length) && (!extlib.isElementInViewport($($curEpisodes)[0]))) {
    var $episodeNumbers = $(".episodeNumber", $($curEpisodes)[0]);
    if ($episodeNumbers.length) {
      var episodeNumber = $episodeNumbers[0].innerHTML;
      var iterSelector = (direction == 1) ? ".handleRight" : ".handleLeft";
      var iterSelectorElems = container.querySelectorAll(iterSelector);

      if (iterSelectorElems.length) {
        fplib.addMutation("keyboard_shortcuts scrollEpisodes", {element: ".episodeLockup"}, function(summaries) {
          summaries.added.forEach(function(summary) {
            var $episodeNumbers = $(".episodeNumber", $(summary));
            if ($episodeNumbers.length) {
              if ($episodeNumbers[0].innerHTML === episodeNumber) {
                console.log("cancelling mutation event since element found");
                fplib.removeMutation("keyboard_shortcuts scrollEpisodes");

                $curEpisodes = $(".episodeLockup.current", container);
                if ($curEpisodes.length)
                  $curEpisodes[0].classList.remove("current");

                summary.classList.add("current");
              }
            }
          });
        });
        iterSelectorElems[0].click();
        console.log("clicking to make animation happen!!!");
      }
    }
  }
}

var nextTab = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    var $nextTabs = $(".menu .current", $(elemContainer)).next();
    if ($nextTabs.length)
      $nextTabs[0].click();
  }
};
var prevTab = function() {
  var elemContainer = getElemContainer();
  if (elemContainer)
    $(".menu .current", $(elemContainer)).prev()[0].click();
};


/////////////////////////////////////////////////////////////////////////////
// Logic for counting posters and highlighting by index
/////////////////////////////////////////////////////////////////////////////
var getPosterPageNo = function() {
  var index = -1;
  var container = getElemContainer();
  var $activePaginationIndicators = $(".pagination-indicator .active", $(container));
  if ($activePaginationIndicators.length)
    index = paginationIndicators.index();

  return index;
};

var getPostersPerPage = function() {
  var postersPerPage = 0;
  if ($(".smallTitleCard").length > 0)
    postersPerPage = Math.floor(window.innerWidth / $(".smallTitleCard")[0].offsetWidth);

  return postersPerPage;
};

// This is approximate since it assumes the last page is full of posters
var getApproxPosterCount = function() {
  console.log("getapproxcount");
  var pageCount = 0;
  var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
  if ($lolomoRows.length) {
    var $activePaginationIndicators = $(".pagination-indicator li", $($lolomoRows[0]));
    pageCount = $activePaginationIndicators.length;
    if (pageCount === 0)
      return $(".smallTitleCard", $($lolomoRows[0])).length;
  }
  return pageCount * getPostersPerPage();
};

var getVisiblePosterIndex = function() {
  console.log("getVisiblePosterIndex");
  var $highlightedPosters = $(".smallTitleCard.highlighted");
  if ($highlightedPosters.length === 0)
    return -1;
  var visibleIndex = 0;
  var $checkVisibleTitleCards = $highlightedPosters;
  while (true) {
    $checkVisibleTitleCards = prevInDOM(".smallTitleCard", $($checkVisibleTitleCards[0]));
    if ($checkVisibleTitleCards.length === 0)
      break;
    if (!extlib.isElementInViewport($checkVisibleTitleCards[0]))
      break;
    visibleIndex++;
  }
  return visibleIndex;
};

var getSelectedPosterIndex = function() {
  var activePageNo = getActivePageNo();
  var visibleIndex = getVisiblePosterIndex();
  console.log(visibleIndex);
  if (visibleIndex < 0)
    visibleIndex = 0;

  return (getPostersPerPage() * activePageNo) + visibleIndex;
};

var getActivePageNo = function() {
  var pageNo = 0;
  var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
  if ($lolomoRows.length) {
    var $activePaginationIndicators = $(".pagination-indicator .active", $($lolomoRows[0]));
    if ($activePaginationIndicators.length)
      pageNo = $activePaginationIndicators.index();
  }
  console.log("pageNo = ");
  console.log(pageNo);

  return pageNo;
}

// Returns an array containing the visible posters
var findVisiblePosters = function($posters) {
  console.log("findvisibleposters");
  console.log($posters);
  var startIndex = 0;
  var endIndex = $posters.length - 1;

  var visiblePosters = [];
  var postersLen = $posters.length;
  for (var i = 0; i < postersLen; i++) {
    if (extlib.isElementInViewport($posters[i])) {
      visiblePosters.push($posters[i]);
    } else {
      if (visiblePosters.length)
        break;
    }
  }

  return visiblePosters;
};

var selectPosterOfIndex = function(desiredIndex, callback) {
  console.log("getting selected poster index");
  var selectedPosterIndex = getSelectedPosterIndex();
  console.log("selected poster index = " + selectedPosterIndex);
  var activePageNo = getActivePageNo();
  var postersPerPage = getPostersPerPage();
  var startIndex = activePageNo * postersPerPage;
  var endIndex = startIndex + postersPerPage - 1;
  console.log("start/end range is " + startIndex + " " + endIndex);
  console.log("desired index is " + desiredIndex);

  var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
  if ($lolomoRows.length) {
    var $smallTitleCardsInRow = $(".smallTitleCard", $($lolomoRows[0]));
    console.log("smalltitlecardsinrow");
    console.log($smallTitleCardsInRow);
    var visiblePosters = findVisiblePosters($smallTitleCardsInRow);
    console.log("visiblePosters.length");
    console.log(visiblePosters.length);
    var scrollPosters = function($targetPoster, $button) {
      console.log("scrollPosters");
      console.log($targetPoster);
      console.log($button);
      var id = $targetPoster[0].id;
      console.log("id is");
      console.log(id);
      fplib.addMutation("keyboard_shortcuts scrollPosters - selectPosterOfIndex", {element: "#" + id}, function(summaries) {
        summaries.added.forEach(function(summary) {
          var posterElems = $lolomoRows[0].querySelectorAll("#" + id);
          if (posterElems.length) {
            fplib.removeMutation("keyboard_shortcuts scrollPosters - selectPosterOfIndex");
            smallTitleCard_ = posterElems[0];
            updateKeyboardSelection(smallTitleCard_, true);
          }
          selectPosterOfIndex(desiredIndex, callback);
        });
      });
      if ($button.length) {
        updateKeyboardSelection(smallTitleCard_, false);
        $button[0].click();
        console.log("clicking to make animation happen!!!");
      }
    }

    if (desiredIndex < startIndex) {
      var $targetPoster = $(visiblePosters[0]);
      $targetPoster = prevInDOM(".smallTitleCard", $targetPoster);
      var $button = $(".handleLeft", $($lolomoRows[0]));
      scrollPosters($targetPoster, $button);
    } else if (desiredIndex > endIndex) {
      var $targetPoster = $(visiblePosters[endIndex - startIndex]);
      $targetPoster = nextInDOM(".smallTitleCard", $targetPoster);

      var $button = $(".handleRight", $($lolomoRows[0]));
      scrollPosters($targetPoster, $button);
    } else {
      console.log("desiredIndex = " + desiredIndex.toString());
      var indexExists = true;
      if (desiredIndex - startIndex > visiblePosters.length) {
        indexExists = false;
      } else {
        visiblePosters[desiredIndex - startIndex].click();
      }
      if (callback !== null) {
        callback(indexExists);
      }
    }
  } else {
    console.error("expected to have entries in lolomorow");
  }
};

function selectFirstPosterInRow() {
  console.log("selectFirstPersonInRow");
  console.log(smallTitleCard_);
  selectPosterOfIndex(0, null);
}

function selectLastPosterInRow() {
  var approxPosterCount = getApproxPosterCount();
  console.log("approximate poster count is: " + approxPosterCount);
  selectPosterOfIndex(approxPosterCount - 1, function(indexExists) {
    if (!indexExists) {
      var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
      if ($lolomoRows.length) {
        var $smallTitleCardsInRow = $(".smallTitleCard", $($lolomoRows[0]));
        if ($smallTitleCardsInRow.length)
          $smallTitleCardsInRow[$smallTitleCardsInRow.length - 1].click();
      }
    }
  });
}

var selectRandomPosterInRow = function() {
  var approxPosterCount = getApproxPosterCount();

  var selectPosterOfIndexCallback = function(indexExists) {
    if (!indexExists) {
      var randomIdx = Math.floor(Math.random() * approxPosterCount);
      console.log("randomidx = " + randomIdx.toString());
      selectPosterOfIndex(randomIdx, selectPosterOfIndexCallback);
    }
  };

  var randomIdx = Math.floor(Math.random() * approxPosterCount);
  selectPosterOfIndex(randomIdx, selectPosterOfIndexCallback);
};

/////////////////////////////////////////////////////////////////////////////
// Highlight in UI location of keyboard selection
/////////////////////////////////////////////////////////////////////////////
var updateKeyboardSelection = function(elem, selected) {
  if (((elem || null) === null) || (!supportsNavigationKeys()))
    return;
  if (selected) {
    updateKeyboardSelection(smallTitleCard_, false); // First, unselect what was selected
    smallTitleCard_ = elem;
  }

  var shouldScroll = selected;

  if (isBillboard(elem)) {
    if (selected)
      $(".billboard")[0].classList.add("fp_keyboard_selected");
    else
      $(".billboard")[0].classList.remove("fp_keyboard_selected");
  } else if (elem.classList.contains("jawBoneContainer")) {
    if (selected)
      elem.classList.add("fp_keyboard_selected");
    else
      elem.classList.remove("fp_keyboard_selected");
  } else {
    shouldScroll = false;
    var ptrackContentElem = elem.getElementsByClassName("ptrack-content")[0];
    if (selected) {
      ptrackContentElem.click();
    }
  }
  if (shouldScroll)
    elem.scrollIntoView(false);
};

/////////////////////////////////////////////////////////////////////////////
// Cycle through selections
/////////////////////////////////////////////////////////////////////////////

// from: http://stackoverflow.com/questions/11560028/get-the-next-element-with-a-specific-class-after-a-specific-element
function nextInDOM(_selector, _subject) {
  // Updated for Flix Plus by Lifehacker to also check children (needed for top /title jawBone)
  var $children = _subject.children(_selector);
  if ($children.length)
    return $children;

  var next = getNext(_subject);
  while(next.length != 0) {
    var found = searchFor(_selector, next);
    if(found != null) return found;
    next = getNext(next);
  }
  return [];
}
function prevInDOM(_selector, _subject) {
  var prev = getPrev(_subject);
  while(prev.length != 0) {
    var found = searchFor(_selector, prev);
    if(found != null) {
      return found;
    }
    prev = getPrev(prev);
  }
  return [];
}

function getNext(_subject) {
  if ((_subject === null) || (_subject.length === 0))
    return [];
  if(_subject.next().length > 0) return _subject.next();
  return getNext(_subject.parent());
}

function getPrev(_subject) {
  if ((_subject === null) || (_subject.length === 0))
    return [];

  if(_subject.prev().length > 0) return _subject.prev();
  return getPrev(_subject.parent());
}
function searchFor(_selector, _subject) {
  if(_subject.is(_selector)) {
    return _subject;
  } else {
    var found = null;
    _subject.children().each(function() {
      found = searchFor(_selector, $(this));
      if(found != null) return false;
    });
    return found;
  }
  return []; // will/should never get here
}

function nextPreviousListContainer(direction) {
  if ((direction !== -1) && (direction !== 1))
    return;

  updateKeyboardSelection(smallTitleCard_, false);

  var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardOrTitleSelector_);
  var newLolomoRow = (direction === 1) ?
      nextInDOM(".lolomoRow", $lolomoRows)[0] :
      prevInDOM(rowOrBillboardOrTitleSelector_, $lolomoRows)[0];

  var visiblePosters = findVisiblePosters($(".smallTitleCard", $(newLolomoRow)));
  smallTitleCard_ = (visiblePosters.length) ? visiblePosters[0] : newLolomoRow;

  // Collapse the previous jawBone (normally it gets collapsed when we open up another)
  if (isBillboard(smallTitleCard_) || (smallTitleCard_.classList.contains("jawBoneContainer")))
    $.each($(".close-button"), function(index, value) { this.click() });

  updateKeyboardSelection(smallTitleCard_, true);
}

function nextPreviousListItem(direction) {
  if ((direction !== -1) && (direction !== 1))
    return;
  if ((!profilesMode_) && (smallTitleCard_ === null))
    return;

  var elemContainer = getElemContainer();

  if (profilesMode_) {
    if (supportsNavigationKeys()) {
      oldSelectedProfile = selectedProfile_;
      selectedProfile_ = (direction === 1) ?
                         nextInDOM(".choose-profile .profile-icon", $(selectedProfile_)).first() :
                         prevInDOM(".choose-profile .profile-icon", $(selectedProfile_)).first();
      oldSelectedProfile.classList.remove("fp_keyboard_selected_profile");
      selectedProfile_.classList.add("fp_keyboard_selected_profile");
    }
  } else if (smallTitleCard_.classList.contains("jawBoneContainer")) {
    // do nothing if top row
  } else if (isBillboard(smallTitleCard_)) {
    var $navArrows = (direction === 1) ? $(".nav-arrow-right") : $(".nav-arrow-left");
    $navArrows.first().click();
  } else {
    updateKeyboardSelection(smallTitleCard_, false);

    console.log(smallTitleCard_[0]);

    var iteratorFunc = (direction == 1) ? nextInDOM : prevInDOM;
    var iterSelector = (direction == 1) ? ".handleRight" : ".handleLeft";

    updateKeyboardSelection(iteratorFunc(".smallTitleCard", $(smallTitleCard_))[0], true);

    var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
    if ($lolomoRows.length === 0)
      return;

    // If poster isn't visible, we scroll left/right a screen, wait for the poster
    // to reload and then select it
    if (!extlib.isElementInViewport($(smallTitleCard_)[0])) {
      var id = $(smallTitleCard_)[0].id;

      var iterSelectorElems = $lolomoRows[0].querySelectorAll(iterSelector);
      if (iterSelectorElems.length) {
        fplib.addMutation("keyboard_shortcuts scrollPosters", {element: "#" + id}, function(summaries) {
          summaries.added.forEach(function(summary) {
            var posterElems = $lolomoRows[0].querySelectorAll("#" + id);
            if (posterElems.length) {
              fplib.removeMutation("keyboard_shortcuts scrollPosters");

              updateKeyboardSelection(smallTitleCard_, false);
              smallTitleCard_ = posterElems[0];
              updateKeyboardSelection(smallTitleCard_, true);
            }
          });
        });
        iterSelectorElems[0].click();
      }
    }
  }
}

/////////////////////////////////////////////////////////////////////////////
// Initiate keyboard commands
/////////////////////////////////////////////////////////////////////////////
var getKeyboardCommandsHtml = function() {
  console.log("getkeyboardcommandshtml");
  var html = "<div style='{ background-color: rgba(1, 1, 1, 0.7); bottom: 0; left: 0; position: fixed; right: 0; top: 0; }'>"; // capture mouse clicks
  html += "<h1 style='text-align: center;'>Flix Plus by Lifehacker keyboard commands</h2><br>";
  html += "<div style='font-size: 100%'; }>";
  console.log(keyboardIdToShortcutDict_);

  var context = "nonplayer";
  if (isPlayer())
    context = "player";
  else if (window.location.pathname.indexOf("/KidsMovie") === 0)
    context = "show_details";
  html += keyboardShortcutsInfo.getHelpText(keyboardIdToShortcutDict_, context);
  html += "</div>";

  return html;
};

var supportsNavigationKeys = function() {
  var supports = (!keyboardShortcutsInfo.DISABLE_NAV_KEYBOARD &&
                  (keyboardIdToShortcutDict_["move_left"] !== "None") ||
                  (keyboardIdToShortcutDict_["move_right"] !== "None") ||
                  (keyboardIdToShortcutDict_["move_home"] !== "None") ||
                  (keyboardIdToShortcutDict_["move_end"] !== "None") ||
                  (keyboardIdToShortcutDict_["next_section"] !== "None") ||
                  (keyboardIdToShortcutDict_["prev_section"] !== "None") ||
                  (keyboardIdToShortcutDict_["section_home"] !== "None") ||
                  (keyboardIdToShortcutDict_["section_end"] !== "None") ||
                  (keyboardIdToShortcutDict_["show_prev_set_posters"] !== "None") ||
                  (keyboardIdToSHortcutDict_["show_next_set_posters"] !== "None")
                );

  return supports;
};

var toggleKeyboardCommands = function() {
  if (!keyboardCommandsShown_) {
    var commandsDiv = document.createElement("div");
    commandsDiv.id = "flix_plus_keyboard_commands";
    commandsDiv.innerHTML = getKeyboardCommandsHtml();

    document.body.appendChild(commandsDiv);

    if ((__enabledScripts === null) || (__enabledScripts["id_darker_netflix"]))
      $("#flix_plus_keyboard_commands")[0].classList.add("fp_keyboard_commands_dark");
    else
      $("#flix_plus_keyboard_commands")[0].classList.add("fp_keyboard_commands_white");

    $(document.body).click(function(e) {
      if (keyboardCommandsShown_ == true) {
        console.log("clicked");
        toggleKeyboardCommands();
        $(document.body).unbind("click");
      }
    });
  } else {
    $("#flix_plus_keyboard_commands").remove();
  }

  keyboardCommandsShown_ = !keyboardCommandsShown_;
};

// We use this for 'normal' (a-z, 0-9, special characters) keys since we don't
// want to deal with repeating
var handleKeypress = function(e) {
//  console.log("handleKeypress");
//  console.log(e);

  if (e.target.nodeName.match(/^(textarea|input)$/i))
    return;
  var override = true;
  var keyCombo = String.fromCharCode(e.charCode || e.which).toLowerCase();

  var ignoreShift = (alreadyHasShiftChars_.indexOf(keyCombo) !== -1);

  if (e.altKey || e.ctrlKey || (!ignoreShift && (e.shiftKey)))
    keyCombo = keyCombo.toUpperCase();

  if (e.altKey) keyCombo = "Alt-" + keyCombo;
  if (e.ctrlKey) keyCombo = "Ctrl-" + keyCombo;
  if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift-" + keyCombo;

  if ((keyCombo || null) !== null) {
//    console.log("keypress: keycombo is " + keyCombo);

    var command = keyLookup(keyCombo);
    if ((command !== null) && (command !== "")) {
      runCommand(command);
      //console.log("preventdefault");
      e.preventDefault(); // Added back August 2015
    }
  }

  if (keyCombo || null !== null)
    undoBuiltinKey(keyCombo, e);
};


// We ignore 'normal' characters here and have handleKeypress do it for us
var determineKeydown = function(e) {
  var keyCombo = "";

  // using http://www.javascripter.net/faq/keycodes.htm
  switch (e.keyCode) {
    case 13: keyCombo = "Enter"; break;
    case 27: keyCombo = "Escape"; break;
    case 32: keyCombo = "Space"; break;
    case 33: keyCombo = "PgUp"; break;
    case 34: keyCombo = "PgDn"; break;
    case 35: keyCombo = "End"; break;
    case 36: keyCombo = "Home"; break;
    case 37: keyCombo = "Left"; break;
    case 39: keyCombo = "Right"; break;
    case 38: keyCombo = "Up"; break;
    case 40: keyCombo = "Down"; break;
    case 45: keyCombo = "Insert"; break;
    case 46: keyCombo = "Delete"; break;
    case 79:
        if ((e.ctrlKey) && (e.altKey === false) && (e.metaKey === false))
            keyCombo = "O";
        break;

    //case 188: keyCombo = ","; break;
    //case 190: keyCombo = "."; break;
    //case 191: keyCombo = "/"; break;
    //case 192: keyCombo = "`"; break;
    //case 219: keyCombo = "["; break;
    //case 220: keyCombo = "\\"; break;
    //case 221: keyCombo = "]"; break;
    //case 222: keyCombo = "'"; break;
  }
  if (keyCombo === "")
    return "";

  var ignoreShift = (alreadyHasShiftChars_.indexOf(keyCombo) !== -1);

  if ((e.altKey)) keyCombo = "Alt-" + keyCombo;
  if ((e.ctrlKey)) keyCombo = "Ctrl-" + keyCombo;
  if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift-" + keyCombo;

  e.preventDefault();

  return keyCombo;
};


var isPlayer = function() {
  return ($("#playerWrapper").length !== 0);
}

// While this code supports ctrl, alt, and shift modifiers, most use is
// restricted by the shortcuts editor. (But a user could maybe get such
// support by modifying their shortcuts JSON in localstorage.)
var handleKeydown = function(e) {
//  console.log("handleKeydown");

  var keyCombo = determineKeydown(e);
  console.log("handleKeyDown - ");
  console.log(keyCombo);
  // hack; keys aren't user-definable.
  if (profilesMode_ && ((keyCombo === "Space") || (keyCombo === "Enter"))) {
    console.log("profiles - space/enter!");
    extlib.simulateClick(selectedProfile_);
    return;
  }

  if (keyCombo !== "") {
    var command = keyLookup(keyCombo);
    if ((command !== null) && (command !== "")) {
      runCommand(command);

      if ((!isPlayer()) && (preventDefaultKeys_.indexOf(keyCombo) !== -1))
        e.preventDefault();
    }
  }

  if (isPlayer()) {
    // This undoes what the keys normally do
    if (keyCombo || null !== null)
      undoBuiltinKey(keyCombo, e);
  }
};

var keyLookup = function(keyCombo) {
  var command = "";
//  console.log("looking up: " + keyCombo);
  if ((keyboardShortcutToIdDict_[keyCombo] || null) !== null)
    command = keyboardShortcutToIdDict_[keyCombo];

//  console.log(keyboardShortcutToIdDict_);
//  console.log("command found: " + command);

  return command;
};

var undoBuiltinKey = function(keyCombo, e) {
  if (window.location.pathname.indexOf("/watch") === 0) {
    var playerOverrideDict = {
                               'enter': 'player_playpause',
                               'space': 'player_playpause',
                               'up': 'player_volume_down',
                               'down': 'player_volume_up'
                             };

    if (playerOverrideDict[keyCombo.toLowerCase()] || null !== null) {
      console.log("override command - " + playerOverrideDict[keyCombo.toLowerCase()]);
      runCommand(playerOverrideDict[keyCombo.toLowerCase()]);
    }
  }
};

var runCommand = function(command) {
//  console.log("runcommand - " + command);
  try {
    var elem = null;

    if ((keyboardCommandsShown_) && (command !== "help") && (command !== "close_window"))
      return;
    if ((profilesMode_) && (command !== "move_left") && (command !== "move_right") && (command !== "close_window"))
      return;

    switch (command) {
      case "rate_0":
      case "rate_1":
      case "rate_2":
      case "rate_3":
      case "rate_4":
      case "rate_5":
      case "rate_1_5":
      case "rate_2_5":
      case "rate_3_5":
      case "rate_4_5":
      case "rate_clear":
        rateMovie(command); break;
      case "move_right": nextPreviousListItem(1); break;
      case "move_left": nextPreviousListItem(-1); break;
      case "move_home": selectFirstPosterInRow(); break;
      case "move_end": selectLastPosterInRow(); break;
      case "play": playOrZoomMovie(command); break;
      case "to_my_list": addToQueue(); break;
      case "remove_from_my_list": removeFromQueue(); break;
      case "zoom_into_details": playOrZoomMovie(command); break;
      case "open_link": break;
      case "next_section": nextPreviousListContainer(1); break;
      case "prev_section": nextPreviousListContainer(-1); break;
      case "next_season": nextSeason(); break;
      case "prev_season": prevSeason(); break;
      case "next_episode": nextPreviousEpisode(1); break;
      case "prev_episode": nextPreviousEpisode(-1); break;
      case "next_tab": nextTab(); break;
      case "prev_tab": prevTab(); break;
      case "section_home": var $smallTitleCards = $(".smallTitleCard"); if ($smallTitleCards.length) { updateKeyboardSelection($smallTitleCards[0], true); selectFirstPosterInRow(); } break;
      case "section_end": var $smallTitleCards = $(".smallTitleCard"); if ($smallTitleCards.length) { updateKeyboardSelection($smallTitleCards[$smallTitleCards.length - 1], true); selectLastPosterInRow();  } break;
      case "section_show_random":
        // This key works differently in three different modes
        var $fpRandomSeasonButton = $(".fp_random_sameseason_button", $(getElemContainer()));
        if (isPlayer())                         // random episode in player
          $("#random_button").first().click();
        else if ($fpRandomSeasonButton.length)  // random episode current season button if shown in poster details
          $fpRandomSeasonButton[0].click();
        else                                    // random show within a section otherwise
          selectRandomPosterInRow();
        break;
      case "player_random_episode": if ($("#fp_random_episode").length) { $("#fp_random_episode")[0].click(); } break; // div added by random episode script
      case "open_section_link": openSectionLink(); break;
      case "toggle_scrollbars": clickSelectorForLolomorow(".fp_scrollbuster_toggle"); break;
      case "toggle_hiding": clickSelectorForLolomorow(".fp_section_toggle"); break;
      case "jump_instant_home": window.location = window.location.protocol + "//www.netflix.com/browse"; break;
      case "jump_my_list": window.location = window.location.protocol + "//www.netflix.com/MyList"; break;
      case "jump_new_arrivals": window.location = window.location.protocol + "//www.netflix.com/browse/new-arrivals"; break;
      case "jump_kids": window.location = window.location.protocol + "//www.netflix.com/Kids"; break;
      case "jump_viewing_activity": window.location = window.location.protocol + "//www.netflix.com/WiViewingActivity"; break;
      case "jump_your_ratings": window.location = window.location.protocol + "//www.netflix.com/MoviesYouveSeen"; break;
      case "reveal_spoilers": // Tells spoilers script to toggle spoilers
        if ($("#fp_spoilers_toggle_button").length)
          $("#fp_spoilers_toggle_button")[0].click();
        break;
      case "search":
        var $elem = $(".searchTab .label");
        if ($elem.length) {
          $elem[0].click();
          var $inputs = $("input");
          if ($inputs.length)
            $inputs[0].value = "";
        }
        break;
      case "your_account": window.location = window.location.protocol + "/www.netflix.com/YourAccount"; break;
      case "help": toggleKeyboardCommands(); break;
      case "close_window":
        keyboardCommandsShown_ = true; toggleKeyboardCommands();
        $.each($(".close-button"), function(index, value) { this.click() });
        $.each($("#layerModalPanes .close"), function(index, value) { this.click() });
        $.each($("#profiles-gate .close"), function(index, value) { this.click(); });
        $.each($(".profiles-gate-container .nfdclose"), function(index, value) { this.click(); }); // saw this on /search
        if (($(".continue-playing span").length > 0) && ($(".continue-playing span")[0].innerText.indexOf("Continue Playing") !== -1))
         $(".continue-playing span")[0].click();
        break;
      case "update_rated_watched":
        delete localStorage["flix_plus " + fplib.getProfileName() + " ratingactivity_last_checked"];
        delete localStorage["flix_plus " + fplib.getProfileName() + " ratingactivity_notinterested_last_checked"];
        delete localStorage["flix_plus " + fplib.getProfileName() + " viewingactivity_last_checked"];
        console.log("flix_plus " + fplib.getProfileName() + " ratingactivity_last_checked");
        alert("Rated/watched lists will be updated at next page load.");
        break;
      case "player_mute": injectJs("netflix.cadmium.objects.videoPlayer().setMuted(true);"); break;
      case "player_unmute": injectJs("netflix.cadmium.objects.videoPlayer().setMuted(false);"); break;
      case "player_toggle_mute": injectJs("netflix.cadmium.objects.videoPlayer().setMuted(!netflix.cadmium.objects.videoPlayer().getMuted());"); break;
      case "player_volume_up": console.log("VOLUP"); injectJs("netflix.cadmium.objects.videoPlayer().setVolume(netflix.cadmium.objects.videoPlayer().getVolume() + 0.1);"); break;
      case "player_volume_down": console.log("VOLDOWN"); injectJs("netflix.cadmium.objects.videoPlayer().setVolume(netflix.cadmium.objects.videoPlayer().getVolume() - 0.1);"); break;
      case "player_fastforward": injectJs("netflix.cadmium.objects.videoPlayer().seek(netflix.cadmium.objects.videoPlayer().getCurrentTime() + 10000);"); break;
      case "player_rewind": injectJs("netflix.cadmium.objects.videoPlayer().seek(netflix.cadmium.objects.videoPlayer().getCurrentTime() - 10000);"); break;
      case "player_goto_beginning": injectJs("netflix.cadmium.objects.videoPlayer().seek(0);"); break;
      case "player_goto_ending": injectJs("netflix.cadmium.objects.videoPlayer().seek(netflix.cadmium.objects.videoPlayer().getDuration());"); break;
      case "player_playpause": console.log("player_playpause"); injectJs("setTimeout(function() {netflix.cadmium.objects.videoPlayer().getPaused() ? netflix.cadmium.objects.videoPlayer().play() : netflix.cadmium.objects.videoPlayer().pause();}, 10);"); break;
      case "player_play": injectJs("netflix.cadmium.objects.videoPlayer().play();"); break;
      case "player_pause": injectJs("netflix.cadmium.objects.videoPlayer().pause();"); break;
      case "player_faster": speed_ = document.getElementsByTagName('video')[0].playbackRate + 0.1; if (speed_ > 10) { speed_ = 10; } setSpeed(); break;
      case "player_slower": speed_ = document.getElementsByTagName('video')[0].playbackRate - 0.1; if (speed_ < 0.1) { speed_ = 0.1; } setSpeed(); break;
      case "player_back_to_browse":
        $.each($(".back-to-browsing"), function(index, value) { this.click() });
        $.each($(".player-back-to-browsing"), function(index, value) { this.click() });
        break;
      case "player_fullscreen": $(".player-fill-screen")[0].click(); break;
      case "player_toggle_cc":
        if ($(".player-timed-text-tracks li").length) {
          var next = $(".player-timed-text-tracks .player-track-selected").next();
          if (next.length !== 0)
            next.click();
          else
            $(".player-timed-text-tracks li")[0].click();
        }
        break;
      case "player_toggle_audio":
        if ($(".player-audio-tracks li").length) {
          var next = $(".player-audio-tracks .player-track-selected").next();
          if (next.length !== 0)
            next.click();
          else
            $(".player-audio-tracks li")[0].click();
        }
        break;
      case "player_nextepisode":
        if ($("#player-menu-next-episode").length)
          $("#player-menu-next-episode")[0].click();
        if ($(".postplay-still-container").length)
          $(".postplay-still-container")[0].click();
        break;
      case "show_prev_set_posters":
        console.log("showprevsetposters");
        var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
        if ($lolomoRows.length) {
          console.log("lolomorows found");
          var $handle = $(".handleRight", $($lolomoRows[0]));
          if ($handle.length)
            $handle[0].click();
        }
        break;
      case "show_next_set_posters":
        console.log("showprevsetposters");
        var $lolomoRows = $(smallTitleCard_).closest(rowOrBillboardSelector_);
        if ($lolomoRows.length) {
          console.log("lolomorows found");
          var $handle = $(".handleLeft", $($lolomoRows[0]));
          if ($handle.length)
            $handle[0].click();
        }
        break;
    }
  } catch (ex) {
    console.log(ex);
  }
};

var injectJs = function(js) {
  var scriptNode = document.createElement("script");
  scriptNode.innerText = js; // "setTimeout(function() {" + js + "}, 2000);"
  document.body.appendChild(scriptNode);
};

var setSpeed = function() {
  $(".fp_status_message").remove();
  clearTimeout(statusClearer_);

  var elem = document.createElement("div");
  elem.className = "fp_status_message";
  elem.style.cssText = "color:white; top:" + (document.body.clientHeight - 100).toString() + "px; left:30px; position: fixed; z-index:999999";
  elem.innerText = "Setting speed to " + parseFloat(Math.round(speed_ * 10) / 10).toFixed(1);

  document.body.appendChild(elem);
  statusClearer_ = setTimeout(function() {
    $(".fp_status_message").remove();
  }, 2000);

  document.getElementsByTagName('video')[0].playbackRate = speed_;
};

/////////////////////////////////////////////////////////////////////////////
// Startup
/////////////////////////////////////////////////////////////////////////////
// Update keyboard shortcuts based on the active page
fplib.addMutation("keyboard shortcuts - player loaded/unloaded", {element: "#playerWrapper, .mainView"}, function(summary) {
  if (summary.added.length) {
    keyboardShortcutsInfo.loadShortcutKeys("flix_plus " + fplib.getProfileName() + " keyboard_shortcuts", function(keyboardShortcutToIdDict, keyboardIdToShortcutDict) {
      console.log("changing out keyboard shortcuts");
      console.log(keyboardShortcutToIdDict_);
      keyboardShortcutToIdDict_ = keyboardShortcutToIdDict;
      keyboardIdToShortcutDict_ = keyboardIdToShortcutDict;
    });
  }
});

fplib.addMutationAndNow("keyboard shortcuts - who's watching", {"element": ".profilesGateContainer, .profiles-gate-container"}, function(summary) {
  if ((window.location.pathname.indexOf("/WiViewingActivity") === 0) ||
      (window.location.pathname.indexOf("/MoviesYouveSeen") === 0) || 
      fplib.isOldMyList()) {
    return;
  }

  if (summary.hasOwnProperty("added") && summary.added.length) {
    console.log("Profiles mode!");
    profilesMode_ = true;
    selectedProfile_ = $(".choose-profile .profile-icon")[0];
    if (supportsNavigationKeys())
      selectedProfile_.classList.add("fp_keyboard_selected_profile");
  }
  if (summary.hasOwnProperty("removed") && summary.removed.length) {
    console.log("Profiles mode done!");
    profilesMode_ = false;
  }
});

// Select a poster if its jawBone gets shown; does not handle if a user just zooms in on the rotating image
fplib.addMutation("keyboard shortcuts - jawbone", {element: ".jawBone" }, function(summary) {
  if (summary.added.length) {
    updateKeyboardSelection(smallTitleCard_, false);
    var $highlighted = $(".highlighted.smallTitleCard");
    smallTitleCard_ = $highlighted[$highlighted.length - 1];
    updateKeyboardSelection(smallTitleCard_, true);
  }
});

keyboardShortcutsInfo.loadShortcutKeys("flix_plus " + fplib.getProfileName() + " keyboard_shortcuts", function(keyboardShortcutToIdDict, keyboardIdToShortcutDict) {
  keyboardShortcutToIdDict_ = keyboardShortcutToIdDict;
  keyboardIdToShortcutDict_ = keyboardIdToShortcutDict;

  // Add borders to billboard whenever the billboard changes
  if (supportsNavigationKeys()) {
    fplib.addMutationAndNow("keyboard shortcuts - billboard border", {element: ".billboard" }, function(summary) {
      if (summary.added.length) {
        console.log(".billboard mutation!");
        updateKeyboardSelection($(".billboard-row")[0], true);
      }
    });
  }

  // Highlight the first title
  fplib.addMutationAndNow("keyboard shortcuts - lolomo or galleryLockups loaded", {element: ".lolomo, .galleryLockups" }, function(summary) {
    if (summary.added.length) {
      console.log("lolomo or gallerylockups loaded");
      updateKeyboardSelection(smallTitleCard_, false);

      var $smallTitleCards = $(".smallTitleCard, .billboard-row, .billboard-motion, .jawBoneContainer");
      var firstSmallTitleCard = null;
      for (var i = 0; i < $smallTitleCards.length; i++) {
        if ($smallTitleCards[i].style.display !== "none") {
          firstSmallTitleCard = $smallTitleCards[i];
          break;
        }
      }
      if (firstSmallTitleCard !== null)
        updateKeyboardSelection(firstSmallTitleCard, true);
    }
  });

  document.addEventListener('keypress', handleKeypress, false);
  document.addEventListener('keydown', handleKeydown, false);
});
