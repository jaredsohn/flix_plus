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
var searchIsFocused_ = false;

var selectors_ = {};

var searchMode_ = false;
var profilesMode_ = false;
var statusClearer_ = null;
var autoShowDetails_ = true;

////////////////////////////////////////////////////////////////////////////////////////////////
// Scrolling to element with keyboard focus
//////////////////////////////////////////////////////////////////////////////////////////////////////

Element.prototype.documentOffsetTop = function() {
  return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
};

// Adapted from http://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment.  Using instead of just scrollIntoView
var scrollMiddle = function(elem) {
  console.log("scrollmiddle:");
  console.log(elem);
  if (elem || null === null)
    return;
  elem.scrollIntoView(true);
  var pos = elem.documentOffsetTop() - (window.innerHeight / 2);
  console.log("pos = ");
  console.log(pos);
  window.scrollTo(0, pos);
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Open a link based on selection
////////////////////////////////////////////////////////////////////////////////////////////////

var getMovieIdFromSelection = function(element) {
  var jawBoneContainers = nextInDOM(".jawBoneContainer", $(smallTitleCard_));
  return (jawBoneContainers.length) ? jawBoneContainers[0].id : "0";
};

var playOrZoomMovie = function(command) {
  var movieId = getMovieIdFromSelection(smallTitleCard_);
  if (movieId !== "0") {
    switch (command) {
      case "play":
        var elemContainer = getElemContainer();
        console.log("elemContainer");
        console.log(elemContainer);
        var $episodesSelected = $(".episodeLockup.current .episodePlay", elemContainer);
        console.log("$episodesSelected");
        console.log($episodesSelected);
        if ($episodesSelected.length) {
          $episodesSelected[0].click();
        } else {
          window.location = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movieId;
        }
        break;
      case "zoom_into_details":
        if (window.location.pathname.indexOf("/Kids") === 0) // this also matches other Kids pages, but changing the URL for that is okay
          window.location = window.location.protocol + "//www.netflix.com/KidsMovie/" + movieId;
        else
          window.location = window.location.protocol + "//www.netflix.com/title/" + movieId;
        break;
    }
  }
};

var clickSelectorForLolomorow = function(selector) {
  var $lolomoRows = $(smallTitleCard_).closest(".lolomoRow, .billboard-row");
  if ($lolomoRows.length) {
    var selected = $(selector, $($lolomoRows[0]));
    if (selected.length)
      selected[0].click();
  }
};

var openSectionLink = function() {
  var $lolomowRow = $(smallTitleCard_).closest(".lolomoRow, .billboard-row");
  if ($lolomowRow.length) {
    var rowTitles = $lolomowRow[0].getElementsByClassName("rowTitle");
    if (rowTitles.length)
      rowTitles[0].click();
  }
};

// Find random index of nonhidden element within a list.  Return -1 if there are none.
var findRandomNonhiddenInList = function(list) {
  console.log("findrandom");
  console.log(list);
  if (!listHasItems(list))
    return -1;

  var count = list.length;
  while (true) {
    rnd = Math.floor(Math.random() * count);

    if (!extlib.isHidden(list[rnd]))
      break;
  }

  return rnd;
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
//  console.log("getting elem container from");
//  console.log(smallTitleCard_);
  var containers = nextInDOM(".jawBone", $(smallTitleCard_));
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

var nextPreviousEpisode = function(direction) {
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
    var id = $($curEpisodes)[0].getAttribute("data-reactid");
    console.log("no longer in viewport; id is");
    console.log(id);

    var iterSelector = (direction == 1) ? ".handleRight" : ".handleLeft";
    var iterSelectorElems = container.querySelectorAll(iterSelector);

    if (iterSelectorElems.length) {
      fplib.addMutation("keyboard_shortcuts scrollEpisodes", {element: ".episodeLockup"}, function(summaries) {
        summaries.added.forEach(function(summary) {
          console.log("new data loaded!");
          var selector = "[data-reactid='" + id + "']";
          console.log(selector);
          var posterElems = $(selector, container);
          if (posterElems.length) {
            console.log("cancelling mutation event since element found");
            fplib.removeMutation("keyboard_shortcuts scrollEpisodes");

            $curEpisodes = $(".episodeLockup.current", container);
            $curEpisodes[0].classList.remove("current");

            posterElems[0].classList.add("current");
          }
        });
      });
      iterSelectorElems[0].click();
      console.log("clicking to make animation happen!!!");
    }
  }
}

var nextTab = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {
    $(".menu .current", $(elemContainer)).next().click()
  }
};
var prevTab = function() {
  var elemContainer = getElemContainer();
  if (elemContainer) {

    $(".menu .current", $(elemContainer)).prev().click()
  }
};


////////////////////////////////////////////////////////////////////////////////////////////////
// Highlight in UI location of keyboard selection
////////////////////////////////////////////////////////////////////////////////////////////////

var updateKeyboardSelection = function(elem, selected) {
  if (((elem || null) === null) || (!supportsNavigationKeys()))
    return;

  var ptrackContentElem = elem.getElementsByClassName("ptrack-content")[0];
  if (selected) {
    updateKeyboardSelection(elem, false); // Unselect what was selected first
    smallTitleCard_ = elem;

    console.log("elem is");
    console.log(elem);
    if (autoShowDetails_)
      ptrackContentElem.click();
    else
      ptrackContentElem.classList.add("fp_keyboard_selected");
  } else {
      ptrackContentElem.classList.remove("fp_keyboard_selected");
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle through selections
////////////////////////////////////////////////////////////////////////////////////////////////

// from: http://stackoverflow.com/questions/11560028/get-the-next-element-with-a-specific-class-after-a-specific-element
function nextInDOM(_selector, _subject) {
//  console.log("nextindom");
//  console.log(_selector);
//  console.log(_subject);
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
  if(_subject.next().length > 0) return _subject.next();
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
    var $elems = $(elem).next(selector);
    if ($elems.length === 0)
      return null;
    if (isVisible($elems[0]) === isVisible)
      return $elems[0];
  }
}

function scrollToBeginningofRow() {
//  findElemForVisibility()

  // TODO: find first visible poster and set it as current.
  // go left one more and then click on teh scroll button
  // wait for new data to load and then repeat.
}

function scrollToEndofRow() {
  // opposite of other method
}

function nextPreviousListContainer(direction) {
  updateKeyboardSelection(smallTitleCard_, false);

  var $lolomoRow = $(smallTitleCard_).closest(".lolomoRow, .billboard-row"); //, .billboard-row
  var newLolomoRow = null;

  if (direction === 1) {
    newLolomoRow = nextInDOM(".lolomoRow, .billboard-row", $lolomoRow)[0];
  } else if (direction === -1) {
    newLolomoRow = prevInDOM(".lolomoRow, .billboard-row", $lolomoRow)[0];
  }

  console.log("newLolomoRow");
  console.log(newLolomoRow);

  if (newLolomoRow !== null) {
    var smallTitleCards = newLolomoRow.getElementsByClassName("smallTitleCard");
    if (smallTitleCards.length)
      smallTitleCard_ = smallTitleCards[0];
    else
      smallTitleCard_ = newLolomoRow;

    console.log("smalltitlecard_");
    console.log(smallTitleCard_);

    updateKeyboardSelection(smallTitleCard_, true);
  }
}

function nextPreviousListItem(direction) {
  if ((direction !== -1) && (direction !== 1))
    return;

  updateKeyboardSelection(smallTitleCard_, false);

  console.log("nextPreviousListItem");
  console.log(direction);
  if ((smallTitleCard_ || null) !== null)
    console.log(smallTitleCard_[0]);

  var iteratorFunc = (direction == 1) ? nextInDOM : prevInDOM;
  var iterSelector = (direction == 1) ? ".handleRight" : ".handleLeft";

  updateKeyboardSelection(iteratorFunc(".smallTitleCard", $(smallTitleCard_))[0], true);

  var $lolomoRows = $(smallTitleCard_).closest(".lolomoRow, .billboard-row");
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
  if ((window.location.pathname.indexOf("/WiPlayer") === 0) || (window.location.pathname.indexOf("/watch") === 0))
    context = "player";
  else if ((window.location.pathname.indexOf("/WiMovie") === 0) || (window.location.pathname.indexOf("/KidsMovie") === 0))
    context = "show_details";
  html += keyboardShortcutsInfo.getHelpText(keyboardIdToShortcutDict_, context);
  html += "</div>";

  return html;
};

var supportsNavigationKeys = function() {
  return (!keyboardShortcutsInfo.DISABLE_NAV_KEYBOARD &&
          ((keyboardIdToShortcutDict_.hasOwnProperty("move_left")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_right")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_home")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("move_end")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("next_section")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("prev_section")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("section_home")) ||
          (keyboardIdToShortcutDict_.hasOwnProperty("section_end"))
        ));
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


// While this code supports ctrl, alt, and shift modifiers, most use is restricted by the shortcuts editor. (But a user could maybe get such support by modifying their shortcuts JSON in localstorage.)
var handleKeydown = function(e) {
//  console.log("handleKeydown");

  var keyCombo = determineKeydown(e);

  // hack; keys aren't user-definable.
  if (profilesMode_ && ((keyCombo === "Space") || (keyCombo === "Enter"))) {
    console.log("profile space!");
    extlib.simulateClick($(".profileIcon", elemsInfo_.elemsNPList[elemsInfo_.currListItem])[0]);
    return;
  }

  if (keyCombo !== "") {
    var command = keyLookup(keyCombo);
    if ((command !== null) && (command !== "")) {
      runCommand(command);

      // don't do this for player; but this code is hacky and won't work for new Netflix layout TODO
      if ((window.location.pathname.indexOf("/WiPlayer") !== 0) && (window.location.pathname.indexOf("/watch") !== 0)) {
        if (preventDefaultKeys_.indexOf(keyCombo) !== -1)
          e.preventDefault();
      }
    }
  }

  if ((window.location.pathname.indexOf("/WiPlayer") === 0) || (window.location.pathname.indexOf("/watch") === 0)) {
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
    if ((profilesMode_) && (command !== "move_left") && (command !== "move_right") && (command !== "move_home") && (command !== "move_end") && (command !== "close_window"))
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
      case "move_home": scrollToBeginningOfRow(); break;
      case "move_end": scrollToEndOfRow(); break;
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
      case "section_home": var $smallTitleCards = $(".smallTitleCard"); if ($smallTitleCards.length) { updateKeyboardSelection($smallTitleCards[0], true); scrollToBeginningOfRow(); } break;
      case "section_end": var $smallTitleCards = $(".smallTitleCard"); if ($smallTitleCards.length) { updateKeyboardSelection($smallTitleCards[$smallTitleCards.length - 1], true); scrollToEndOfRow();  } break;
      case "section_show_random": // Note: if page dynamically adds posters (or things that look like posters), this occasionally will select nothing
        if (window.location.pathname.indexOf("/WiMovie") === 0) {
          if ($("#random_button").length)
            $("#random_button")[0].click();
        } else {
          rnd = findRandomNonhiddenInList(elemsInfo_.elemsNPList);
          console.log("random = " + rnd);
          if (rnd >= 0) {
            try {
              updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
            } catch (ex) {
              console.log(ex);
            }
            elemsInfo_.currListItem = rnd;
            updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], true);
            extlib.simulateEvent(elemsInfo_.elemsNPList[elemsInfo_.currListItem], "mouseover");
            scrollMiddle(elemsInfo_.elemsNPList[elemsInfo_.currListItem]);
          }
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

// TODO
/*          if ($(".searchTab .label").length) {
            var elem = $(".searchTab .label")[0];
            if (elem === document.activeElement)
              elem.blur();
          }*/

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

  // Highlight the first title
  fplib.addMutationAndNow("keyboard shortcuts - lolomo or galleryLockups loaded", {element: ".lolomo, .galleryLockups" }, function(summary) {
    if (summary.added.length) {
      console.log("lolomo or gallerylockups loaded");
      updateKeyboardSelection(smallTitleCard_, false);

      // TODO: only do so if any of the relevant keys are defined
      var $smallTitleCards = $(".smallTitleCard");
      if ($smallTitleCards.length) {
        updateKeyboardSelection($smallTitleCards[0], true);
      }
    }
  });


  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

  document.addEventListener('keypress', handleKeypress, false);
  document.addEventListener('keydown', handleKeydown, false);
});
