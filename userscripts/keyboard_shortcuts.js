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
//
// Still in progress:
// * Updating for Netflix June 2015 redesign

"use strict";

// Since exclude support is disabled in compiler, do it manually here
if (window.location.pathname.indexOf("/KidsCharacter") === 0)
  return;

var smallTitleCard_ = null;

var keyboardCommandsShown_ = false;
var alreadyHasShiftChars_ = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?"];
var preventDefaultKeys_ = ["Home", "End", "Ctrl-Home", "Ctrl-End", "Space"];
var speed_ = 1;
var keyboardShortcutToIdDict_ = {};
var keyboardIdToShortcutDict_ = {};

var selectors_ = {};

var profilesMode_ = false;
var selectedProfile_ = null;

var statusClearer_ = null;

////////////////////////////////////////////////////////////////////////////////////////////////
// Open a link based on selection
////////////////////////////////////////////////////////////////////////////////////////////////

var getMovieIdFromSelection = function(element) {
  console.log("getmovieidfromselection");
  console.log(element);
  console.log(getElemContainer());
  if (element === null)
    return "0";
  else if ((element.classList.contains("billboard-row")) || (element.classList.contains("billboard-motion"))) {
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
  console.log("playOrZoomMovie smalltitlecard");
  console.log(smallTitleCard_);
  var movieId = getMovieIdFromSelection(smallTitleCard_);
  console.log("movieId is " + movieId);
  var isBillboardEpisode = $(".billboard-pane-episodes", $(smallTitleCard_)).length; // Doesn't matter if id is zero

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
  var $lolomoRows = $(smallTitleCard_).closest(".lolomoRow, .billboard-row, .billboard-motion");
  if ($lolomoRows.length) {
    var selected = $(selector, $($lolomoRows[0]));
    if (selected.length)
      selected[0].click();
  }
};

var openSectionLink = function() {
  var $lolomowRow = $(smallTitleCard_).closest(".lolomoRow, .billboard-row, .billboard-motion");
  if ($lolomowRow.length) {
    var rowTitles = $lolomowRow[0].getElementsByClassName("rowTitle");
    if (rowTitles.length)
      rowTitles[0].click();
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Add/remove from queue, assign rating
////////////////////////////////////////////////////////////////////////////////////////////////

var mouseOverQueue = function(elemContainer) {
  if (selectors_["queueMouseOver"] !== null) {
    var mouseOverContainer = $(selectors_["queueMouseOver"], elemContainer);
    if (mouseOverContainer.length)
      extlib.simulateEvent(mouseOverContainer[0], "mouseover");
  }
};

var getElemContainer = function() {
  if ((smallTitleCard_.classList.contains("billboard-row")) || (smallTitleCard_.classList.contains("billboard-motion")))
    return smallTitleCard_; // billboard rows are their own container

//  console.log("getting elem container from");
//  console.log(smallTitleCard_);
  var containers = nextInDOM(".billboard-row, .jawBone, .billboard-motion", $(smallTitleCard_));
  console.log("elem container is ");
  console.log(containers);
  return (containers.length) ? containers[0] : null;
};

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
  console.log("container = ");
  console.log(elemContainer)
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
      console.log("current season title: " + currentSeasonTitle);
      $dropDowns[0].click();

      var $nextElems = $('.sub-menu a', $(elemContainer)).filter(function() { return ($(this).text() === currentSeasonTitle); }).parent().next("li");
      console.log("$nextElems");
      console.log($nextElems);
      if ($nextElems.length) {
        console.log("iflength");
        console.log($($nextElems[0]).children()[0]);
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
      console.log("current season title: " + currentSeasonTitle);
      $dropDowns[0].click();

      var $prevElems = $('.sub-menu a', $(elemContainer)).filter(function() { return ($(this).text() === currentSeasonTitle); }).parent().prev("li");
      console.log("$prevElems");
      console.log($prevElems);
      if ($prevElems.length) {
        console.log("iflength");
        console.log($($prevElems[0]).children()[0]);
        $($prevElems[0]).children()[0].click();
      } else {
        $dropDowns[0].click();
      }
    }
  }
};

var switchToEpisodeViewIfBillboard = function() {
  if ((smallTitleCard_ !== null) &&
      ((smallTitleCard_.classList.contains("billboard-row")) || (smallTitleCard_.classList.contains("billboard-motion")))) {
    var $iconButtonEpisodes = $(".icon-button-episodes");
    if ($iconButtonEpisodes.length) {
      $iconButtonEpisodes[0].click();
    }
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
          console.log("Matches!");
          $nextEpisodes[0].classList.add("current");
          $curEpisodes[0].classList.remove("current");
        }
      }
    } else if (direction === -1) {
      var $prevEpisodes = prevInDOM(".episodeLockup", $curEpisodes);
      if ($prevEpisodes.length) {
        if ($prevEpisodes[0].parentNode.parentNode == $curEpisodes[0].parentNode.parentNode) {
          console.log("Matches!");
          $prevEpisodes[0].classList.add("current");
          $curEpisodes[0].classList.remove("current");
        }
      }
    }
  }

  $curEpisodes = $(".episodeLockup.current", container);
  console.log("current episode is ");
  console.log($curEpisodes);

  // If episode isn't visible, we scroll left/right a screen, wait for the episode
  // to reload and then select it
  if (($curEpisodes.length) && (!extlib.isElementInViewport($($curEpisodes)[0]))) {
    var $episodeNumbers = $(".episodeNumber", $($curEpisodes)[0]);
    if ($episodeNumbers.length) {
      var episodeNumber = $episodeNumbers[0].innerHTML;
      console.log("no longer in viewport; episodeNumber is");
      console.log(episodeNumber);

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
  console.log("elemcontainer returned is");
  console.log(elemContainer);
  if (elemContainer) {
    console.log("found");
    console.log(elemContainer);
    console.log("curTab is");
    console.log($(".menu .current", $(elemContainer)));
    console.log("nextTab is");
    var $nextTabs = $(".menu .current", $(elemContainer)).next();
    console.log($nextTabs);
    if ($nextTabs.length)
      $nextTabs[0].click();
  }
};
var prevTab = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    $(".menu .current", $(elemContainer)).prev()[0].click();
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////
// Logic for counting posters and highlighting by index
////////////////////////////////////////////////////////////////////////////////////////////////

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
  var container = getElemContainer();
  var $activePaginationIndicators = $(".pagination-indicator", $(container));
  var pageCount = $activePaginationIndicators.length;

  return pageCount * getPostersPerPage();
};

var getVisiblePosterIndex = function() {
  // TODO
  // 1. find the selected poster
  // 2. if not visible, return -1
  // 3. if is visible, then go backwards until we find something not visible
};

var getSelectedPosterIndex = function() {
  var index = 0;
  var container = getElemContainer();
  var $activePaginationIndicators = $(".pagination-indicator .active", $(container));
  if ($activePaginationIndicators.length)
    index = $activePaginationIndicators.index();

  var visibleIndex = getVisiblePosterIndex();
  if (visibleIndex < 0)
    visibleIndex = 0;

  return (getPostersPerPage() * index) + visibleIndex;
};

var selectPosterOfIndex = function(desiredIndex) {
  // TODO ... return false if poster doesn't exist at that index
  // also look at current visible index and compare with desiredIndex and scroll left/right as needed

  return true;
};

function selectFirstPosterInRow() {
  selectPosterOfIndex(0);
}

function selectLastPosterInRow() {
  var approxPosterCount = getApproxPosterCount();
  selectPosterOfIndex(approxPosterCount - 1);
  var elemContainer = getElemContainer();
  var $smallTitleCards = $(".smallTitleCard", $(elemContainer));
  if ($smallTitleCards.length) {
    var lastPosterElem = $smallTitleCards[$smallTitleCards.length - 1];
    // TODO: get count of visible posters.  Calculate index of the last poster and call selectPostersOfIndex on it
  }
}

var selectRandomPosterInRow = function() {
  var approxPosterCount = getApproxPosterCount();
  while (true) {
    var randomIdx = Math.floor(Math.random() * approxPosterCount);
    if (selectPosterOfIndex(randomIdx)) {
      break;
    }
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Highlight in UI location of keyboard selection
////////////////////////////////////////////////////////////////////////////////////////////////

var updateKeyboardSelection = function(elem, selected) {
  if (((elem || null) === null) || (!supportsNavigationKeys()))
    return;
  if (selected) {
    updateKeyboardSelection(smallTitleCard_, false); // Unselect what was selected first
    smallTitleCard_ = elem;
  }

  var shouldScroll = selected;

  if ((elem.classList.contains("billboard-row")) || (elem.classList.contains("billboard-motion"))) {
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

////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle through selections
////////////////////////////////////////////////////////////////////////////////////////////////

// from: http://stackoverflow.com/questions/11560028/get-the-next-element-with-a-specific-class-after-a-specific-element
function nextInDOM(_selector, _subject) {
//  console.log("nextindom");
//  console.log(_selector);
//  console.log(_subject);

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
  return null;
}
function prevInDOM(_selector, _subject) {
//  console.log("prevInDOM");
//  console.log(_subject);
  var prev = getPrev(_subject);
  while(prev.length != 0) {
    var found = searchFor(_selector, prev);
    if(found != null) {
      console.log(found);
      return found;
    }
    prev = getPrev(prev);
  }
  return null;
}
function getNext(_subject) {
//  console.log("getnext1");
//  console.log(_subject);
  if(_subject.next().length > 0) return _subject.next();
//  console.log("getnext2");
  return getNext(_subject.parent());
}
function getPrev(_subject) {
  if(_subject.prev().length > 0) return _subject.prev();
  return getPrev(_subject.parent());
}
function searchFor(_selector, _subject) {
  if(_subject.is(_selector)) return _subject;
  else {
    var found = null;
    _subject.children().each(function() {
      found = searchFor(_selector, $(this));
      if(found != null) return false;
    });
    return found;
  }
  return null; // will/should never get here
}

function findElemForVisibility(firstElem, selector, isVisible) {
  var elem = firstElem;
  while (true) {
    // TODO: verify that old and new elem are in same row
    var $elems = $(elem).next(selector);
    if ($elems.length === 0)
      return null;
    if (isVisible($elems[0]) === isVisible)
      return $elems[0];
  }
}

function nextPreviousListContainer(direction) {
console.log("nextprevlistcontainer1");
  updateKeyboardSelection(smallTitleCard_, false);

  var $lolomoRows = $(smallTitleCard_).closest(".lolomoRow, .billboard-row, .billboard-motion, .jawBoneContainer");
  var newLolomoRow = null;

  console.log("$lolomorows = ");
  console.log($lolomoRows);
  console.log($lolomoRows.length);

  if (direction === 1) {
    if ($lolomoRows.length > 0) {
      if (($lolomoRows[0].classList.contains(".billboard-row")) ||
          ($lolomoRows[0].classList.contains(".billboard-motion")) ||
          ($lolomoRows[0].classList.contains(".jawBoneContainer"))) {
        $lolomoRows = $(".lolomoRow");
        if ($lolomoRows.length)
          newLolomoRow = $lolomoRows[0];
      } else {
        newLolomoRow = nextInDOM(".lolomoRow, .billboard-row, .billboard-motion", $lolomoRows)[0];
      }
    }
  } else if (direction === -1) {
    newLolomoRow = prevInDOM(".lolomoRow, .billboard-row, .billboard-motion, .billboard-motion, .jawBoneContainer", $lolomoRows)[0];
  }

  console.log("newLolomoRow");
  console.log(newLolomoRow);

  if (newLolomoRow !== null) {
    var smallTitleCards = newLolomoRow.getElementsByClassName("smallTitleCard");
    if (smallTitleCards.length)
      smallTitleCard_ = smallTitleCards[0];
    else
      smallTitleCard_ = newLolomoRow;

    // Collapse the previous jawBone (normally it gets collapsed when we open up another)
    if ((smallTitleCard_.classList.contains("billboard-row")) ||
        (smallTitleCard_.classList.contains("billboard-motion")) ||
        (smallTitleCard_.classList.contains("jawBoneContainer")))
      $.each($(".close-button"), function(index, value) { this.click() });

    console.log("smalltitlecard_");
    console.log(smallTitleCard_);

    updateKeyboardSelection(smallTitleCard_, true);
  }
}

function nextPreviousListItem(direction) {
  console.log("direction = ");
  console.log(direction);
  if ((direction !== -1) && (direction !== 1))
    return;


  if (profilesMode_) {
    oldSelectedProfile = selectedProfile_;
    if (direction === 1) {
      var $next = nextInDOM(".profile-icon", $(selectedProfile_));
      if ($next.length) {
        selectedProfile_ = $next[0];
      }
    } else if (direction === -1) {
      var $prev = prevInDOM(".profile-icon", $(selectedProfile_));
      if ($prev.length) {
        selectedProfile_ = $prev[0];
      }
    }
    if (supportsNavigationKeys()) {
      oldSelectedProfile.classList.remove("fp_keyboard_selected_profile");
      selectedProfile_.classList.add("fp_keyboard_selected_profile");
    }

    return;
  }

  var elemContainer = getElemContainer();

  if ((smallTitleCard_ !== null) && (smallTitleCard_.classList.contains("jawBoneContainer"))) {
    // do nothing if top row
    return;
  } else if ((elemContainer !== null) && (elemContainer.classList.contains("billboard-row")) || (elemContainer.classList.contains("billboard-motion"))) {
    if (direction === 1) {
      var $navArrowRights = $(".nav-arrow-right");
      if ($navArrowRights.length) {
        $navArrowRights[0].click();
      }
    } else if (direction === -1) {
      var $navArrowLefts = $(".nav-arrow-left");
      if ($navArrowLefts.length) {
        $navArrowLefts[0].click();
      }
    }

    return;
  }

  updateKeyboardSelection(smallTitleCard_, false);

  console.log("nextPreviousListItem");
  console.log(direction);
  if ((smallTitleCard_ || null) !== null)
    console.log(smallTitleCard_[0]);

  var iteratorFunc = (direction == 1) ? nextInDOM : prevInDOM;
  var iterSelector = (direction == 1) ? ".handleRight" : ".handleLeft";

  updateKeyboardSelection(iteratorFunc(".smallTitleCard", $(smallTitleCard_))[0], true);

  var $lolomoRows = $(smallTitleCard_).closest(".lolomoRow, .billboard-row, .billboard-motion");
  if ($lolomoRows.length === 0)
    return;

  // If poster isn't visible, we scroll left/right a screen, wait for the poster
  // to reload and then select it
  if (!extlib.isElementInViewport($(smallTitleCard_)[0])) {
    var id = $(smallTitleCard_)[0].id;
    console.log("no longer in viewport; id is");
    console.log(id);
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

            console.log("smalltitlecard after nextprevlistitem is ");
            console.log(smallTitleCard_);
          }
        });
      });
      iterSelectorElems[0].click();
      console.log("clicking to make animation happen!!!");
    }
  }
}

function listHasItems(list) {
  if (list) {
    for (var i = 0; i < list.length; i++) {
      if (!extlib.isHidden(list[i]))
        return true;
    }
  }
  return false;
}


////////////////////////////////////////////////////////////////////////////////////////////////
// Initiate keyboard commands
////////////////////////////////////////////////////////////////////////////////////////////////

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
          ((keyboardIdToShortcutDict_.hasOwnProperty("move_left")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_right")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_home")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_end")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("next_section")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("prev_section")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("section_home")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("section_end"))
        ));
  console.log(keyboardIdToShortcutDict_);
  console.log("supports = " + supports);
  return supports;
};

var toggleKeyboardCommands = function() {
  console.log("in toggle");
  console.log(keyboardCommandsShown_);
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
  } else
    $("#flix_plus_keyboard_commands").remove();

  keyboardCommandsShown_ = !keyboardCommandsShown_;
};

// We use this for 'normal' (a-z, 0-9, special characters) keys since we don't want to deal with repeating
var handleKeypress = function(e) {
//  console.log("handleKeypress");
//  console.log(e);

  if (e.target.nodeName.match(/^(textarea|input)$/i)) {
    return;
  }
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

  //if ((e.keyCode >= 48) && (e.keyCode <= 57))
  //    keyCombo = String.fromCharCode(e.keyCode);

  //if ((e.keyCode >= 65) && (e.keyCode <= 90))
  //    keyCombo = String.fromCharCode(e.keyCode).toLowerCase();

  // using http://www.javascripter.net/faq/keycodes.htm
  switch (e.keyCode)
  {
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

  return keyCombo;
};


var isPlayer = function() {
  return ($("#playerWrapper").length !== 0);
}

// While this code supports ctrl, alt, and shift modifiers, most use is restricted by the shortcuts editor. (But a user could maybe get such support by modifying their shortcuts JSON in localstorage.)
var handleKeydown = function(e) {
//  console.log("handleKeydown");

  var keyCombo = determineKeydown(e);

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

      // don't do this for player
      if (!isPlayer()) {
        if (preventDefaultKeys_.indexOf(keyCombo) !== -1)
          e.preventDefault();
      }
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
        // There are three modes for this key:
        // * random episode in player
        // * random episode current season button if shown in poster details
        // * random show within a section otherwise
        var elemContainer = getElemContainer();
        var $fpRandomSeasonButton = $("fp_random_sameseason_button", $(elemContainer));

        if (isPlayer()) {
          if ($("#random_button").length)
            $("#random_button")[0].click();
        } else if ($fpRandomSeasonButton.length) {
          $fpRandomSeasonButton[0].click();
        } else {
          selectRandomPosterInRow();
        }
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
        if ($(".searchTab .label").length) {
          var elem = $(".searchTab .label")[0];

          if (elem !== null) {
            elem.click();
            var $inputs = $("input");
            if ($inputs.length)
              $inputs[0].value = "";
          }
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

////////////////////////////////////////////////////////////////////////////////////////////////
// Startup
////////////////////////////////////////////////////////////////////////////////////////////////

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
    selectedProfile_ = $(".profile-icon")[0];
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
        updateKeyboardSelection($(".billboard-row")[0]);
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
        console.log("~~~");
        console.log($smallTitleCards[i]);
        console.log($smallTitleCards[i].style.display);
        if ($smallTitleCards[i].style.display !== "none") {
          firstSmallTitleCard = $smallTitleCards[i];
          break;
        }
      }
      if (firstSmallTitleCard !== null)
        updateKeyboardSelection(firstSmallTitleCard, true);
    }
  });


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  document.addEventListener('keypress', handleKeypress, false);
  document.addEventListener('keydown', handleKeydown, false);
});
