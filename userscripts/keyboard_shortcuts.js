// ==UserScript==
// @name           Netflix Keyboard Shortcuts
// @namespace      http://userscripts.org/users/109864
// @description    Adds keyboard shortcuts to the Netflix web site
// @match          *://*.netflix.com/*
// @version        1.10.2012.418
// ==/UserScript==

// This script originally came from http://userscripts.org:8080/scripts/show/124120 (before userscripts.org disappeared.)
//
// Modified heavily by Jared Sohn (Lifehacker) for the Flix Plus Chrome extension to:
// 1) update for today's (August 2014) Netflix, 2) possibly support more pages (might have just been broken due to Netflix changes), 3) let user define the keys, and 4) integrate with other Flix Plus features
//
// Now requires jquery, arrive.js, extlib.js, fplib.js

// Since exclude support is disabled in compiler, do it manually here
if (location.pathname.indexOf("/KidsCharacter") === 0)
    return;

var elemsInfo_ = null;
var savedElemsInfo_ = null;
var savedSelectors_ = {};

var keyboardCommandsShown_ = false;
var alreadyHasShiftChars_ = ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?"];
var preventDefaultKeys_ = ["Home", "End", "Ctrl-Home", "Ctrl-End", "Space"];

var keyboardShortcutToIdDict_ = {};
var keyboardIdToShortcutDict_ = {};

var selectors_ = {};

var navigationDisabled_ = false;
var searchMode_ = false;
var profilesMode_ = false;
var spoilers_revealed_ = false;

////////////////////////////////////////////////////////////////////////////////////////////////
// Scrolling to element with keyboard focus
//////////////////////////////////////////////////////////////////////////////////////////////////////

Element.prototype.documentOffsetTop = function() {
    return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
};

// jaredsohn-lifehacker Adapted from http://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment.  Using instead of just scrollIntoView
var scrollMiddle = function(elem)
{
    console.log("scrollmiddle:");
    console.log(elem);
    if ((typeof(elem) === "undefined") || (elem === null))
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

var getMovieIdFromSelection = function(element)
{
    console.log("getMovieIdFromSelection");
    console.log("element1 is ");
    console.log(element);

//    console.log("id_info is");
//    console.log(selectors_["id_info"]);

    var fullStr = null;
    var infos = selectors_["id_info"];
    if (infos === null)
        return;

    for (infoIndex = 0; infoIndex < infos.length; infoIndex++)
    {
        var attrElem = element;
        if (infos[infoIndex]["selector"] !== null)
            attrElem = $(infos[infoIndex]["selector"], element);

        fullStr = ($(attrElem)).attr(infos[infoIndex]["attrib"]);
        if (typeof(fullStr) !== "undefined")
            break;
    }

    return fplib.getMovieIdFromField(fullStr);
};

var playOrZoomMovie = function(command)
{
    if (selectors_ === null)
        return;

    if (((location.pathname.indexOf("/WiMovie") === 0) || (location.pathname.indexOf("/KidsMovie") === 0)) && (command === "play"))
    {
        if ($(".playButton").length)
            $(".playButton")[0].click();
        else
        {
            var movieId = getMovieIdFromSelection(document);

            if (movieId !== "0")
                this.location = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movieId;
        }
    } else
    {
        if (elemsInfo_.currElem === null)
            return;

        var movieId = getMovieIdFromSelection(elemsInfo_.currElem);
        if (movieId !== "0")
        {
            switch (command) {
                case "play":
                    this.location = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movieId;
                    break;
                case "zoom_into_details":
                    if (location.pathname.indexOf("/Kids") === 0) // this also matches other Kids pages, but changing the URL for that is okay
                        this.location = window.location.protocol + "//www.netflix.com/KidsMovie/" + movieId;
                    else
                        this.location = window.location.protocol + "//www.netflix.com/WiMovie/" + movieId;
                    break;
            }
        }
    }
};

var openSectionLink = function()
{
    console.log("openSectionLink");
    console.log(elemsInfo_.elemsListContainers);
    console.log(elemsInfo_.currListContainer);
    console.log(elemsInfo_.elemsListContainers[elemsInfo_.currListContainer]);

    var container = $("h3 a", elemsInfo_.elemsListContainers[elemsInfo_.currListContainer]);
    console.log(container[container.length - 1]);
    var url = container[container.length - 1].href;
    console.log(url);
    if (url !== "")
        window.location = url;

    return;
};

// Find random index of nonhidden element within a list.  Return -1 if there are none.
var findRandomNonhiddenInList = function(list)
{
    console.log("findrandom");
    console.log(list);
    if (!listHasItems(list)) {
        return -1;
    }
    var count = list.length;
    while (true)
    {
        rnd = Math.floor(Math.random() * count);

        if (!extlib.isHidden(list[rnd]))
            break;
    }

    return rnd;
};

var openCurrentLink = function()
{
    if (!listHasItems(elemsInfo_.elemsNPList)) {
        return;
    }

    var elemsLinks = elemsInfo_.elemsNPList[elemsInfo_.currListItem].getElementsByTagName("a");
    if (elemsLinks.length > 0) {
        for (var i = 0; i < elemsLinks.length; i++) {
        var link = elemsLinks[i];
            if (link.href.match(/netflix\.com\/(Wi)?(Movie|RoleDisplay)/)) {
                window.location = link.href;
                break;
            }
        }
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////
// Add/remove from queue, assign rating
////////////////////////////////////////////////////////////////////////////////////////////////

var mouseOverQueue = function(elemContainer)
{
    if (selectors_["queueMouseOver"] !== null)
    {
        var mouseOverContainer = $(selectors_["queueMouseOver"], elemContainer);
        if (mouseOverContainer.length)
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
    }
};

var getElemContainer = function()
{
    var elemContainer;

    if (selectors_["elemContainer"] === "[selected]")
        elemContainer = elemsInfo_.elemsNPList[elemsInfo_.currListItem];
    else
    {
        temp = $(selectors_["elemContainer"]);
        elemContainer = (temp.length) ? temp[0] : null;
    }

    return elemContainer;
};

var removeFromQueue = function()
{
    if (location.pathname.indexOf("/search") === 0)
        return; // don't support for /search since it isn't working right yet and is awkward to hit shortcut and type

    var elemContainer = getElemContainer();

    if (elemContainer !== null)
    {
        mouseOverQueue(elemContainer);

        if (selectors_["queueRemove"] !== null)
        {
            var elemButton = $(selectors_["queueRemove"], elemContainer);

            //console.log(elemButton);
            if (elemButton && (elemButton.length > 0)) {
                if ((elemButton[0].innerText.indexOf("Remove") !== -1) || (selectors_["queueRemove"] === ".delbtn"))
                {
                    extlib.simulateClick(elemButton[0]);
                    if ((typeof(elemsInfo_.elemsNPList) !== "undefined") && (elemsInfo_.elemsNPList !== null) && (elemsInfo_.elemsNPList.length > elemsInfo_.currListItem))
                        updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], true);
                }
            }
        }
    }
};

var addToQueue = function()
{
    if (location.pathname.indexOf("/search") === 0)
        return; // don't support for /search since it isn't working right yet and is awkward to hit shortcut and type

    var elemContainer = getElemContainer();

    if (elemContainer !== null)
    {
        mouseOverQueue(elemContainer);

        if (selectors_["queueAdd"] !== null)
        {
            var elemButton = $(selectors_["queueAdd"], elemContainer);

            if (elemButton && (elemButton.length > 0)) {
                if ((elemButton[0].innerText.indexOf("In My List") === -1) && (elemButton[0].innerText.indexOf("My List") !== -1))
                    extlib.simulateClick(elemButton[0]);
                else
                {
                    var anode = elemButton[0].parentNode;
                    if ((typeof(anode) !== "undefined") && (anode.href.indexOf("addToQueue") !== -1)) // Make sure link actually is 'add'
                        extlib.simulateClick(elemButton[0]);
                }
            }
        }
    }
};

var rateMovie = function(rating)
{
    if (location.pathname.indexOf("/search") === 0)
        return; // don't support for /search since it isn't working right yet and is awkward to use keyboard shortcut and type

    var elemContainer = getElemContainer();

    if (elemContainer !== null)
    {
        if (selectors_["ratingMouseOver"] !== null)
        {
            var mouseOverContainer = $(selectors_["ratingMouseOver"], elemContainer);
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
            console.log("just moused over");
            console.log(selectors_["ratingMouseOver"]);
        }

        var ratingClass = fplib.getRatingClass(rating);
        var elemRating = elemContainer.getElementsByClassName(ratingClass);
        if (elemRating && (elemRating.length > 0)) {
            extlib.simulateClick(elemRating[0]);
        }
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////
// Highlight in UI location of keyboard selection
////////////////////////////////////////////////////////////////////////////////////////////////

var updateKeyboardSelection = function(elem, selected)
{
    if ((profilesMode_ === false) && (((location.pathname.indexOf("/WiMovie") === 0) || (location.pathname.indexOf("/KidsMovie") === 0))))
        return;

    if ((keyboardIdToShortcutDict_["move_right"] === "None") &&
        (keyboardIdToShortcutDict_["move_left"] === "None") &&
        (keyboardIdToShortcutDict_["move_home"] === "None") &&
        (keyboardIdToShortcutDict_["move_end"] === "None"))
    {
        // Don't show border if associated keys aren't set.
        return;
    }

    var borderElem = elem;
    if (selectors_["borderedElement"] !== null)
        borderElem = $(selectors_["borderedElement"], elem)[0];

    if (fplib.isOldMyList()) // separated out because width is different
    {
        if (selected)
            borderElem.classList.add("fp_keyboard_mylist_selected");
        else
            borderElem.classList.remove("fp_keyboard_mylist_selected");
    }
    else if (
            (location.pathname.indexOf("/Search") === 0) || (location.pathname.indexOf("/WiSearch") === 0)
        )
    {
        if (selected)
            borderElem.classList.add("fp_keyboard_search_selected");
        else
            borderElem.classList.remove("fp_keyboard_search_selected");
    }
    else
    {
        if (selected)
            borderElem.classList.add("fp_keyboard_selected");
        else
            borderElem.classList.remove("fp_keyboard_selected");
    }
};


////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle through selections
////////////////////////////////////////////////////////////////////////////////////////////////

function nextPreviousListContainer(direction)
{
    if (!listHasItems(elemsInfo_.elemsListContainers)) {
        return;
    }

    try
    {
        if (((typeof(elemsInfo_.elemsListContainers) !== "undefined")) && (elemsInfo_.elemsListContainers != null))
        {
            if ((elemsInfo_.elemsListContainers.length - 1 >= elemsInfo_.currListContainer) && (elemsInfo_.currListContainer !== -1))
            {
                elemsInfo_.elemsListContainers[elemsInfo_.currListContainer].style["border-style"] = "none";
            }
        }
    } catch (ex)
    {
        console.log(ex);
    }

    if (direction == 0) {
        return;
    }

    while (true)
    {
        elemsInfo_.currListContainer += direction;
        if (elemsInfo_.currListContainer < 0) {
            elemsInfo_.currListContainer = 0;
        } else if (elemsInfo_.currListContainer >= elemsInfo_.elemsListContainers.length - 1) {
            elemsInfo_.currListContainer = elemsInfo_.elemsListContainers.length - 1;
            break;
        }

        if (!extlib.isHidden(elemsInfo_.elemsListContainers[elemsInfo_.currListContainer]))
            break;
    }

    nextPreviousListItem(0);
    elemsInfo_.currElem = elemsInfo_.elemsListContainers[elemsInfo_.currListContainer];
    scrollMiddle(elemsInfo_.currElem);
    elemsInfo_.elemsNPList = elemsInfo_.currElem.getElementsByClassName("agMovie"); // TODO: should use fplib to find selector for active page
    elemsInfo_.currListItem = -1;
    nextPreviousListItem(1);

    try
    {
        if (((typeof(elemsInfo_.elemsListContainers) !== "undefined")) && (elemsInfo_.elemsListContainers != null))
        {
            if (elemsInfo_.elemsListContainers.length - 1 >= elemsInfo_.currListContainer)
            {
                if ((keyboardIdToShortcutDict_["prev_section"] !== "None") ||
                    (keyboardIdToShortcutDict_["next_section"] !== "None") ||
                    (keyboardIdToShortcutDict_["section_home"] !== "None") ||
                    (keyboardIdToShortcutDict_["section_end"] !== "None"))
                {
                    // only draw border if a section navigation-related key was set
                    elemsInfo_.elemsListContainers[elemsInfo_.currListContainer].style["border-style"] = "solid";
                }
            }
        }
    } catch (ex)
    {
        console.log(ex);
    }
}

function nextPreviousListItem(direction)
{
    if (!listHasItems(elemsInfo_.elemsNPList)) {
        return;
    }
    elemsInfo_.currElem = null;
    var lastIndex = elemsInfo_.elemsNPList.length - 1;
    try {
        elemsInfo_.currElem = elemsInfo_.elemsNPList[elemsInfo_.currListItem];
        updateKeyboardSelection(elemsInfo_.currElem, false);
    } catch (err) {
        //ignore error
    }

    if (direction == 0) {
        return;
    }
    var oldListitem = elemsInfo_.currListItem;
    while (true)
    {
        elemsInfo_.currListItem += direction;

        if (elemsInfo_.currListItem < 0)
        {
            elemsInfo_.currListItem = oldListitem;
            break;
        }
        if (elemsInfo_.currListItem > lastIndex)
        {
            elemsInfo_.currListItem = oldListitem;
            break;
        }

        if (!extlib.isHidden(elemsInfo_.elemsNPList[elemsInfo_.currListItem]))
            break;
    }

    if (elemsInfo_.currListItem < 0) {
        elemsInfo_.currListItem = 0;
    } else if (elemsInfo_.currListItem > lastIndex) {
        elemsInfo_.currListItem = lastIndex;
    } else {
        elemsInfo_.currElem = elemsInfo_.elemsNPList[elemsInfo_.currListItem];
        try {
            if ((typeof(elemsInfo_.elemsListContainers) === 'undefined') || (elemsInfo_.elemsListContainers.length === 0) || !(extlib.isHidden($("#" + elemsInfo_.elemsListContainers[elemsInfo_.currListContainer].id + " .bd")[0])))
            {
                console.log("mouseover...");
                console.log(elemsInfo_.currElem);
                extlib.simulateEvent(elemsInfo_.currElem, "mouseover"); // done for /search since another element is also in the bobbable class
                extlib.simulateEvent($(".bobbable", $(elemsInfo_.currElem))[0], "mouseover");
                scrollMiddle(elemsInfo_.currElem);
            } else
                scrollMiddle(elemsInfo_.elemsListContainers[elemsInfo_.currListContainer]);
        } catch (ex)
        {
            console.log(ex);
        }

        updateKeyboardSelection(elemsInfo_.currElem, true);

        var elemsLinks = elemsInfo_.currElem.getElementsByTagName("a");
        if (elemsLinks.length == 0) {
            switch (elemsInfo_.currListItem) {
                case 0:
                    nextPreviousListItem(1);
                    break;
                case lastIndex:
                    nextPreviousListItem(-1);
                    break;
                default:
                    nextPreviousListItem(direction);
                    break;
            }
            //nextPreviousListItem(-direction);
        }
    }
}

function listHasItems(list)
{
    if (list) {
        for (i = 0; i < list.length; i++)
        {
            if (!extlib.isHidden(list[i]))// Updated jaredsohn-Lifehacker to ignore hidden elements
                return true;
        }
    }
    return false;
}


////////////////////////////////////////////////////////////////////////////////////////////////
// Initiate keyboard commands
////////////////////////////////////////////////////////////////////////////////////////////////

var getKeyboardCommandsHtml = function()
{
    console.log("getkeyboardcommandshtml");
    var html = "<div style='{ background-color: rgba(1, 1, 1, 0.7); bottom: 0; left: 0; position: fixed; right: 0; top: 0; }'>"; // capture mouse clicks
    html += "<h1 style='text-align: center;'>Flix Plus by Lifehacker keyboard commands</h2><br>";
    html += "<div style='font-size: 100%'; }>";
    console.log(keyboardIdToShortcutDict_);

    var context = "nonplayer";
    if (location.pathname.indexOf("/WiPlayer") === 0)
        context = "player";
    else if ((location.pathname.indexOf("/WiMovie") === 0) || (location.pathname.indexOf("/KidsMovie") === 0))
        context = "show_details";
    else if (navigationDisabled_)
        context = "nonplayer-no-navigation";
    html += keyboard_shortcuts_info.get_help_text(keyboardIdToShortcutDict_, context);
    html += "</div>";

    return html;
};

var toggleKeyboardCommands = function()
{
    console.log("in toggle");
    console.log(keyboardCommandsShown_);
    if (!keyboardCommandsShown_)
    {
        var commandsDiv = document.createElement("div");
        commandsDiv.id = "flix_plus_keyboard_commands";
        commandsDiv.innerHTML = getKeyboardCommandsHtml();

        document.body.appendChild(commandsDiv);

        if ((__enabledScripts === null) || (__enabledScripts["id_darker_netflix"]))
            $("#flix_plus_keyboard_commands")[0].classList.add("fp_keyboard_commands_dark");
        else
            $("#flix_plus_keyboard_commands")[0].classList.add("fp_keyboard_commands_white");

        $(document.body).click(function(e) {
            if (keyboardCommandsShown_ == true)
            {
                console.log("clicked");
                toggleKeyboardCommands();
                $(document.body).unbind("click");
            }
        });
    }
    else
    {
        $("#flix_plus_keyboard_commands").remove();
    }

    keyboardCommandsShown_ = !keyboardCommandsShown_;
};

// We use this for 'normal' (a-z, 0-9, special characters) keys since we don't want to deal with repeating
var handleKeypress = function(e)
{
    console.log("handleKeypress");
    console.log(e);

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

    if ((typeof(keyCombo) !== "undefined") && (keyCombo !== null))
    {
        console.log("keypress: keycombo is " + keyCombo);

        var command = keyLookup(keyCombo);
        if ((command !== null) && (command !== ""))
        {
            runCommand(command);
            //console.log("preventdefault");
            //e.preventDefault();
        }
    }

    if ((typeof(keyCombo) !== "undefined") && (keyCombo !== null))
        undoBuiltinKey(keyCombo, e);
};


// We ignore 'normal' characters here and have handleKeypress do it for us
var determineKeydown = function(e)
{
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
var handleKeydown = function(e)
{
    console.log("handleKeydown");

    var keyCombo = determineKeydown(e);

    // hack; keys aren't user-definable.  Also, ideally would have an observer check if profilegate div is shown and switch modes
    // to allow this support when page is interrupted.  For now, users can instead use script that automatically hides it instead.
    if ((profilesMode_ || (location.pathname.indexOf("/ProfilesGate") === 0)) && ((keyCombo === "Space") || (keyCombo === "Enter")))
    {
        extlib.simulateClick($("img", elemsInfo_.elemsNPList[elemsInfo_.currListItem])[0]);
        return;
    }

    if (keyCombo !== "")
    {
        var command = keyLookup(keyCombo);
        if ((command !== null) && (command !== ""))
        {
            runCommand(command);

            // don't do this for player; but code is hacky TODO
            if (location.pathname.indexOf("/WiPlayer") !== 0)
            {
                if (preventDefaultKeys_.indexOf(keyCombo) !== -1)
                    e.preventDefault();
            }
        }
    }

    if (location.pathname.indexOf("/WiPlayer") === 0)
    {
        // This undoes what the keys normally do
        if ((typeof(keyCombo) !== "undefined") && (keyCombo !== null))
            undoBuiltinKey(keyCombo, e);
    }
};

var keyLookup = function(keyCombo)
{
    var command = "";
    console.log("looking up: " + keyCombo);
    if (typeof(keyboardShortcutToIdDict_[keyCombo]) !== "undefined")
        command = keyboardShortcutToIdDict_[keyCombo];

    console.log("command found: " + command);

    return command;
};

var undoBuiltinKey = function(keyCombo, e)
{
    if (location.pathname.indexOf("/WiPlayer") === 0)
    {
        var playerOverrideDict = {
                                     'enter': 'player_playpause',
                                     'space': 'player_playpause',
                                     'up': 'player_volume_down',
                                     'down': 'player_volume_up'
                                 };

        if (typeof(playerOverrideDict[keyCombo.toLowerCase()]) !== "undefined")
        {
            console.log("override command - " + playerOverrideDict[keyCombo.toLowerCase()]);
            runCommand(playerOverrideDict[keyCombo.toLowerCase()]);
        }
    }
};

var runCommand = function(command)
{
    console.log("runcommand - " + command);
    try
    {
        var elem = null;

        if ((keyboardCommandsShown_) && (command !== "help") && (command !== "close_window"))
            return;
        if ((profilesMode_) && (command !== "move_left") && (command !== "move_right") && (command !== "move_home") && (command !== "move_end") && (command !== "close_window"))
            return;

        switch (command)
        {
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
            case "move_home": updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false); elemsInfo_.currListItem = -1; nextPreviousListItem(1); break;
            case "move_end": updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false); elemsInfo_.currListItem = elemsInfo_.elemsNPList.length; nextPreviousListItem(-1); break;
            case "play": playOrZoomMovie(command); break;
            case "to_my_list": addToQueue(); break;
            case "remove_from_my_list": removeFromQueue(); break;
            case "zoom_into_details": playOrZoomMovie(command); break;
            case "open_link": openCurrentLink(); break;
            case "next_section": nextPreviousListContainer(1); break;
            case "prev_section": nextPreviousListContainer(-1); break;
            case "section_home":
                updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
                elemsInfo_.currListContainer = -1;
                nextPreviousListContainer(1);

                updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
                elemsInfo_.currListItem = -1;
                nextPreviousListItem(1);
                break;
            case "section_end":
                updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
                elemsInfo_.currListContainer = elemsInfo_.elemsListContainers.length - 1;
                nextPreviousListContainer(-1);

                updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
                elemsInfo_.currListItem = elemsInfo_.elemsNPList.length;
                nextPreviousListItem(-1);
                break;
            case "section_show_random": // Note: if page dynamically adds posters (or things that look like posters), this occasionally will select nothing
                if (location.pathname.indexOf("/WiMovie") === 0)
                {
                    if ($("#random_button").length)
                        $("#random_button")[0].click();
                } else
                {
                     rnd = findRandomNonhiddenInList(elemsInfo_.elemsNPList);
                     console.log("random = " + rnd);
                     if (rnd >= 0)
                     {
                        try
                        {
                            updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], false);
                        } catch (ex)
                        {
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
            case "toggle_scrollbars": elem = document.getElementById(elemsInfo_.elemsListContainers[elemsInfo_.currListContainer].id + "_scrollshowall"); if (elem !== null) { elem.click(); } break;
            case "toggle_hiding": elem = document.getElementById(elemsInfo_.elemsListContainers[elemsInfo_.currListContainer].id + "_showhide"); if (elem !== null) { elem.click(); } break;
            case "jump_instant_home": window.location = "http://www.netflix.com/WiHome"; break;
            case "jump_my_list": window.location = "http://www.netflix.com/MyList"; break;
            case "jump_new_arrivals": window.location = "http://www.netflix.com/WiRecentAdditions"; break;
            case "jump_kids": window.location = "http://www.netflix.com/Kids"; break;
            case "jump_viewing_activity": window.location = "http://www.netflix.com/WiViewingActivity"; break;
            case "jump_your_ratings": window.location = "https://www.netflix.com/MoviesYouveSeen"; break;
            case "jump_whos_watching": window.location = "https://www.netflix.com/ProfilesGate"; break;
            case "reveal_spoilers": // actually toggles spoilers
                if (spoilers_revealed_)
                    $.each($(".fp_spoiler_disabled"), function(index, value) { this.classList.add('fp_spoiler'); this.classList.remove('fp_spoiler_disabled'); });
                else
                    $.each($(".fp_spoiler"), function(index, value) { this.classList.add('fp_spoiler_disabled'); this.classList.remove('fp_spoiler'); });
                spoilers_revealed_ = !spoilers_revealed_;
                break;
            case "search":
                elem = document.getElementById("searchTab");
                if (elem !== null)
                    elem.click();
                else
                    elem = document.getElementById("searchField");

                elem.focus();
                elem.select();
                break;
            case "your_account": window.location = "https://www.netflix.com/YourAccount"; break;
            case "help": toggleKeyboardCommands(); break;
            case "close_window":
                keyboardCommandsShown_ = true; toggleKeyboardCommands();
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
            case "player_back_to_browse":
                $.each($(".back-to-browsing"), function(index, value) { this.click() });
                $.each($(".player-back-to-browsing"), function(index, value) { this.click() });
                break;
            case "player_fullscreen": $(".player-fill-screen")[0].click(); break;
            case "player_toggle_cc":
                if ($(".player-timed-text-tracks li").length)
                {
                    var next = $(".player-timed-text-tracks .player-track-selected").next();
                    if (next.length !== 0)
                        next.click();
                    else
                        $(".player-timed-text-tracks li")[0].click();
                }
                break;
            case "player_toggle_audio":
                if ($(".player-audio-tracks li").length)
                {
                    var next = $(".player-audio-tracks .player-track-selected").next();
                    if (next.length !== 0)
                        next.click();
                    else
                        $(".player-audio-tracks li")[0].click();
                }
                break;
            case "player_nextepisode": {
                if ($("#player-menu-next-episode").length)
                    $("#player-menu-next-episode")[0].click();
                if ($(".postplay-still-container").length)
                    $(".postplay-still-container")[0].click();
                break;
            }
        }
    } catch (ex)
    {
        console.log(ex);
    }
};

var injectJs = function(js)
{
    var scriptNode = document.createElement("script");
    scriptNode.innerText = js; // "setTimeout(function() {" + js + "}, 2000);"
    document.body.appendChild(scriptNode);
};

var initForSelectors = function(selectors)
{
    console.log("our selectors =");
    console.log(selectors);

    elemsInfo_ = { elemsListContainers: [], currListContainer: -1, elemsNPList: [], currListItem: -1, currElem: null };

    if ((keyboardIdToShortcutDict_["prev_section"] === "None") &&
        (keyboardIdToShortcutDict_["next_section"] === "None") &&
        (keyboardIdToShortcutDict_["section_home"] === "None") &&
        (keyboardIdToShortcutDict_["section_end"] === "None") &&
        (keyboardIdToShortcutDict_["move_right"] === "None") &&
        (keyboardIdToShortcutDict_["move_left"] === "None") &&
        (keyboardIdToShortcutDict_["move_home"] === "None") &&
        (keyboardIdToShortcutDict_["move_end"] === "None"))
    {
        navigationDisabled_ = true;
        console.log("Data loading skipped since navigation keys not defined.");
        return;
    }

    if (selectors["elementsList"] === ".mrow")
    {
        elemsInfo_.elemsListContainers = document.getElementsByClassName("mrow");
        if ((elemsInfo_.elemsListContainers.length > 0) && (elemsInfo_.elemsListContainers[0].classList.contains("characterRow")))
        {
            newList = [];
            for (i = 1; i < elemsInfo_.elemsListContainers.length; i++)
            {
                newList.push(elemsInfo_.elemsListContainers[i]);
            }
            elemsInfo_.elemsListContainers = newList;  // now an array instead of htmlcollection
        }

        if ($(".emptyYourListRow").length)
        {
            nextPreviousListContainer(1);
        }

        document.body.arrive(selectors["elementsList"], function()
        {
            //console.log(".");
            elemsInfo_.elemsListContainers.push(this);
        });
    } else
    {
        elemsInfo_.elemsNPList = $(selectors["elements"]).get();
        console.log(elemsInfo_.elemsNPList);

        document.body.arrive(selectors["elements"], function()
        {
            //console.log(".");
            elemsInfo_.elemsNPList.push(this);
        });
    }
    if (elemsInfo_.elemsNPList) {
        nextPreviousListItem(1);
    }
    if (elemsInfo_.elemsListContainers) {
        nextPreviousListContainer(1);
    }
    console.log("elems info is ");
    console.log(elemsInfo_);
};

var addWhoWatchingInstructions = function()
{
    var profilesSelector = "#profiles-gate, .profilesGate";
    if ($(profilesSelector).length)
    {
        text = "You can disable this dialog by enabling 'Prevent Who's Watching interruptions' in Flix Plus preferences.";
        var elem = document.createElement("div"); elem.style.cssText = "text-align:center"; elem.innerText = text;
        $(profilesSelector)[0].appendChild(elem);
        var elem = document.createElement("br");
        $(profilesSelector)[0].appendChild(elem);
    }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Startup
////////////////////////////////////////////////////////////////////////////////////////////////

keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + fplib.getProfileName() + " keyboard_shortcuts", function(keyboardShortcutToIdDict, keyboardIdToShortcutDict)
{
    //console.log(keyboardShortcutToIdDict);
    //console.log(keyboardIdToShortcutDict);
    keyboardShortcutToIdDict_ = keyboardShortcutToIdDict;
    keyboardIdToShortcutDict_ = keyboardIdToShortcutDict;

    fplib.addEmptyVideoAnnotations(); // clean up DOM
    fplib.idMrows();

    selectors_ = fplib.getSelectorsForPath();
    initForSelectors(selectors_);

    // Show instructions on Who's Watching; we're assuming this is the only dialog with the show class for now
    addWhoWatchingInstructions();

    // Track when dialog is shown for most pages
    MutationObserver2 = window.MutationObserver || window.WebKitMutationObserver;
    var observer2 = new MutationObserver2(function(mutations) {
        if ((document.getElementById("profiles-gate")).style["display"] !== "none")
        {
            if (!profilesMode_)
            {
                console.log("who's watching arrive");
                profilesMode_ = true;
                savedElemsInfo_ = elemsInfo_;
                savedSelectors_ = selectors_;

                selectors_ = fplib.getSelectors("/ProfilesGate");
                selectors_["elements"] = "#profiles-gate .profiles li";
                initForSelectors(selectors_);
            }
        } else
        {
            if (profilesMode_)
            {
                profilesMode_ = false;
                elemsInfo_ = savedElemsInfo_;
                selectors_ = savedSelectors_;
                $(".fp_keyboard_selected").removeClass("fp_keyboard_selected");
                updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], true);
                scrollMiddle(elemsInfo_.elemsNPList[elemsInfo_.currListItem]);
            }
        }
    });
    var elem = document.getElementById("profiles-gate");
    if ((typeof(elem) !== "undefined") && (elem !== null))
        observer2.observe(elem, { attributes: true });

    // Track when dialog is shown for newer pages
    document.body.arrive("#profiles-gate, .profilesGate", function()
    {
        console.log("who's watching arrive");
        profilesMode_ = true;
        savedElemsInfo_ = elemsInfo_;
        savedSelectors_ = selectors_;

        selectors_ = fplib.getSelectors("/ProfilesGate");
        initForSelectors(selectors_);

        addWhoWatchingInstructions();
    });

    document.body.leave("#profiles-gate, .profilesGate", function()
    {
        elemsInfo_ = savedElemsInfo_;
        selectors_ = savedSelectors_;
        $(".fp_keyboard_selected").removeClass("fp_keyboard_selected");
        updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], true);
        profilesMode_ = false;
        scrollMiddle(elemsInfo_.elemsNPList[elemsInfo_.currListItem]);
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (location.pathname.indexOf("/WiSearch") === 0)
    {
        var elems = document.getElementsByClassName("searchResultsPrimary");
        for (i = 0; i < elems.length; i++) {
            elems[i].style.width = "1000px"; // add room for borders
        }
    }

    document.addEventListener('keypress', handleKeypress, false);
    document.addEventListener('keydown', handleKeydown, false);

    if ($("#searchField").length)
    {
        $("#searchField")[0].addEventListener("input", function(e) {
            if ($("#searchField")[0].value === "")
            {
                if (searchMode_)
                {
                    console.log("search mode done");
                    searchMode_ = false;
                    elemsInfo_ = savedElemsInfo_;
                    selectors_ = savedSelectors_;
                    $(".fp_keyboard_selected").removeClass("fp_keyboard_selected");
                    updateKeyboardSelection(elemsInfo_.elemsNPList[elemsInfo_.currListItem], true);
                    scrollMiddle(elemsInfo_.elemsNPList[elemsInfo_.currListItem]); // this doesn't work as I'd like, but if user presses arrow things are okay
                }
            } else
            {
                if (!searchMode_)
                {
                    console.log("search mode start");
                    searchMode_ = true;
                    savedElemsInfo_ = elemsInfo_;
                    savedSelectors_ = selectors_;

                    selectors_ = fplib.getSelectors("/search");
                    initForSelectors(selectors_);
                }
            }
        });
    }

    // Make borders more visible on many pages
    extlib.addGlobalStyle(".agMovieGallery {position: relative; top: 20px; left:10px}");
    extlib.addGlobalStyle(".instantSearchGallery .gallery {position: relative; top: 10px; left:10px}");
    if ((location.pathname.indexOf("/KidsAltGenre") === 0) || (location.pathname.indexOf("/Kids") === 0))
        extlib.addGlobalStyle(".agMovieSetSlider {padding: 0px 0px 10px 0px}");

    // Fix top border; changing CSS via above easily gets undone in some cases (such as doing a search from wiMovie)
    document.body.arrive(".agMovieGallery", function()
    {
        $(".agMovieGallery").before("<br>");
    });
    document.body.arrive(".instantSearchGallery .gallery", function()
    {
        $(".instantSearchGallery .gallery").before("<br>");
    });

    // Don't break keyboard shortcuts if user also has Netflix Enhancer installed (just rearrange the elements)
    if (!navigationDisabled_)
    {
        var tileRatingContainers = $(".tileRatingContainer");
        var len = tileRatingContainers.length;
        for (tileIndex = 0; tileIndex < len; tileIndex++)
        {
            var elem = tileRatingContainers[tileIndex];
            var parentNode = elem.parentNode;
            var temp = parentNode.removeChild(elem);
            parentNode.appendChild(temp);
        }
        document.body.arrive(".tileRatingContainer", function()
        {
            console.log("moving tileratingcontainer");
            var elem = this;
            var parentNode = elem.parentNode;
            var temp = parentNode.removeChild(elem);
            parentNode.appendChild(temp);
        });
    }
});
