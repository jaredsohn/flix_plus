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
// 1) update for today's (August 2014) Netflix, 2) possibly support more pages (might have just been broken due to Netflix changes), and 3) integrate with other Flix Plus features
//
// Now requires jquery, arrive.js, extlib.js, fplib.js
var _elemsListContainers;
var _currListContainer = -1;
var _elemsNPList;
var _currListItem = -1;
var _currElem = null;
var _keyboard_commands_shown = false;
var _already_has_shift_chars = [ "~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?"];

var _keyboard_shortcut_to_id_dict = {};
var _keyboard_id_to_shortcut_dict = {};

////////////////////////////////////////////////////////////////////////////////////////////////
// Scrolling to element with keyboard focus
//////////////////////////////////////////////////////////////////////////////////////////////////////

Element.prototype.documentOffsetTop = function () {
    return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
};

// jaredsohn-lifehacker Adapted from http://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment.  Using instead of just scrollIntoView
function scrollMiddle(elem)
{
    if (elem === null)
        return;
    elem.scrollIntoView(true);
    var pos = elem.documentOffsetTop() - (window.innerHeight / 2 );
    window.scrollTo( 0, pos );
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Open a link based on selection
////////////////////////////////////////////////////////////////////////////////////////////////

function WatchOrZoomMovie(command)
{
    if (_currElem === null)
        return;

    var selectors = fplib.getSelectorsForPath();
    if (selectors === null)
        return;

    var attr_elem = null;
    if (selectors["movieInfoSelector"] !== null)
    {
        attr_elem = $(selectors["movieInfoSelector"], _currElem);
    } else
    {
        attr_elem = $(_currElem);
    }

    var full_str = attr_elem.attr(selectors["movieIdAttribute"]);
    var movie_id = fplib.getMovieIdFromField(full_str);

    switch (command) {
        case "play":
            this.location = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movie_id;
            break;
        case "zoom_into_details":
            this.location = window.location.protocol + "www.netflix.com/WiMovie/" + movie_id;
            break;
    }
}

function OpenSectionLink()
{
    console.log("OpenSectionLink");
    console.log(_elemsListContainers);
    console.log(_currListContainer);
    console.log(_elemsListContainers[_currListContainer]);

    var container = $("h3 a", _elemsListContainers[_currListContainer]);
    console.log(container[container.length - 1]);
    var url = container[container.length - 1].href;
    console.log(url);
    if (url !== "")
        window.location = url;
    
    return;
}

function OpenCurrentLink()
{
    if (!ListHasItems(_elemsNPList)) {
        return;
    }
    
    var elemsLinks = _elemsNPList[_currListItem].getElementsByTagName("a");
    if (elemsLinks.length > 0) {
        for (var i = 0; i < elemsLinks.length; i++) {
        var link = elemsLinks[i];
            if (link.href.match(/netflix\.com\/(Wi)?(Movie|RoleDisplay)/)) {
                window.location = link.href;
                break;
            }
        }
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////
// Add/remove from queue, assign rating
////////////////////////////////////////////////////////////////////////////////////////////////

function RemoveFromQueue()
{
    var selectors = fplib.getSelectorsForPath();

    if (selectors["elemContainerId"] === "[selected]")
        elemContainer = _elemsNPList[_currListItem];
    else if (selectors["elemContainerId"] === "[document")
        elemContainer = document;
    else
        elemContainer = document.getElementById(selectors["elemContainerId"]);

    if (elemContainer !== null)
    {
        if (selectors["queueMouseOver"] !== null)
        {
            var mouseOverContainer = $(selectors["queueMouseOver"], elemContainer);
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
        }

        if (selectors["queueRemove"] !== null)
        {
            var elemButton = $(selectors["queueRemove"], elemContainer);

            //console.log(elemButton);
            if (elemButton && (elemButton.length > 0)) {
                if ((elemButton[0].innerText.indexOf("Remove") !== -1) || (selectors["queueRemove"] === ".delbtn"))
                {
                    extlib.simulateClick(elemButton[0]);
                    if ((typeof(_elemsNPList) !== "undefined") && (_elemsNPList !== null) && (_elemsNPList.length > _currListItem))    
                        UpdateKeyboardSelection(_elemsNPList[_currListItem], true);
                }
            }
        }
    }
}


function AddToQueue()
{
    var selectors = fplib.getSelectorsForPath();

    if (selectors["elemContainerId"] === "[selected]")
        elemContainer = _elemsNPList[_currListItem];
    else if (selectors["elemContainerId"] === "[document")
        elemContainer = document;
    else
        elemContainer = document.getElementById(selectors["elemContainerId"]);

    if (elemContainer !== null)
    {
        if (selectors["queueMouseOver"] !== null)
        {
            var mouseOverContainer = $(selectors["queueMouseOver"], elemContainer);
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
        }

        if (selectors["queueAdd"] !== null)
        {
            var elemButton = $(selectors["queueAdd"], elemContainer);

            if (elemButton && (elemButton.length > 0)) {
                if ((elemButton[0].innerText.indexOf("In My List") === -1) && (elemButton[0].innerText.indexOf("My List") !== -1))
                    extlib.simulateClick(elemButton[0]);
                else
                {
                    var anode = elemButton[0].parentNode;
                    if ((typeof(anode) !== "undefined") && (anode.href.indexOf("AddToQueue") !== -1)) // Make sure link actually is 'add'
                        extlib.simulateClick(elemButton[0]);
                }
            }
        }
    }
}

function RateMovie(rating)
{
    var selectors = fplib.getSelectorsForPath();

    if (selectors["elemContainerId"] === "[selected]")
        elemContainer = _elemsNPList[_currListItem];
    else if (selectors["elemContainerId"] === "[document")
        elemContainer = document;
    else
        elemContainer = document.getElementById(selectors["elemContainerId"]);

    if (elemContainer !== null)
    {        
        if (selectors["ratingMouseOver"] !== null)
        {
            var mouseOverContainer = $(selectors["ratingMouseOver"], elemContainer);
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
        }

        var rating_class = fplib.getRatingClass(rating);
        var elemRating = elemContainer.getElementsByClassName(rating_class);
        if (elemRating && (elemRating.length > 0)) {
            extlib.simulateClick(elemRating[0]);
        }        
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////
// Highlight in UI location of keyboard selection
////////////////////////////////////////////////////////////////////////////////////////////////

var UpdateKeyboardSelection = function(elem, selected)
{
    var selectors = fplib.getSelectorsForPath();

    var border_elem = elem;
    if (selectors["borderedElement"] !== null)
        border_elem = $(selectors["borderedElement"], elem)[0];

/*
    if (selected)
        extLib.addClass(border_elem, "fp_keyboard_selected");
    else
        extLib.removeClass(border_elem, "fp_keyboard_selected");

// TODO: use code below to define what the fp_keyboard_selected class looks like (and load it only once)
*/

    if (fplib.isOldMyList()) // separated out because width is different
    {
        if (selected)
            border_elem.setAttribute('style', 'border-style: solid !important; border-color: #b9090b !important; border-width: 5px !important');
        else
            border_elem.setAttribute('style', 'border-style: none;');
    }
    else if (
            (location.pathname.indexOf("/Search") === 0) || (location.pathname.indexOf("/WiSearch") === 0)
        ) 
    {
        if (selected)
            border_elem.setAttribute('style', 'border-style: solid !important; border-color: #b9090b !important; top: 10px !important; border-width: 10px !important')
        else
            border_elem.setAttribute('style', 'border-style: none !important; top: 0px !important; border-width: 0px !important')                
    }    
    else
    {        
        if (selected)
            border_elem.setAttribute('style', 'outline: 10px solid #b9090b !important; outline-offset: 0px !important;');
        else
            border_elem.setAttribute('style', 'outline: 0px !important');            
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Cycle through selections
////////////////////////////////////////////////////////////////////////////////////////////////

function NextPreviousListPage(direction)
{
    var strBtnClass;
    switch (direction) {
    case 1:
        strBtnClass = "next";
        break;
    case -1:
        strBtnClass = "prev";
        break;
    default:
        return;
        break;
    }
    extlib.simulateClick(document.getElementsByClassName(strBtnClass)[0]);
}

function NextPreviousListContainer(direction)
{
    if (!ListHasItems(_elemsListContainers)) {
        NextPreviousListPage(direction);
        return;
    }

    try
    {
        if (((typeof(_elemsListContainers) !== "undefined")) && (_elemsListContainers != null))
        {
            if ((_elemsListContainers.length - 1 >= _currListContainer) && (_currListContainer !== -1))
            {
                _elemsListContainers[_currListContainer].style["border-style"] = "none";   
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
        _currListContainer += direction;
        if (_currListContainer < 0) {
            _currListContainer = 0;
        } else if (_currListContainer >= _elemsListContainers.length - 1) {
            _currListContainer = _elemsListContainers.length - 1;
            break;
        }

        if (!extlib.isHidden(_elemsListContainers[_currListContainer]))
            break;
    }

    NextPreviousListItem(0);
    _currElem = _elemsListContainers[_currListContainer];
    scrollMiddle(_currElem);
    _elemsNPList = _currElem.getElementsByClassName("agMovie"); // TODO: should use fplib to find selector for active page
    _currListItem = -1;
    NextPreviousListItem(1);

    try
    {
        if (((typeof(_elemsListContainers) !== "undefined")) && (_elemsListContainers != null))
        {
            if (_elemsListContainers.length - 1 >= _currListContainer)
            {
                _elemsListContainers[_currListContainer].style["border-style"] = "solid";   
            }
        }
    } catch (ex)
    {
        console.log(ex);
    }
}


function NextPreviousListItem(direction)
{
    if (!ListHasItems(_elemsNPList)) {
        return;
    }
    _currElem = null;
    var lastIndex = _elemsNPList.length - 1;
    try {
        _currElem = _elemsNPList[_currListItem];
        UpdateKeyboardSelection(_currElem, false);
    } catch(err) {
        //ignore error
    }
    if (direction == 0) {
        return;
    }
    var old_listitem = _currListItem;
    while (true)
    {
        _currListItem += direction;

        if (_currListItem < 0)
        {
            _currListItem = old_listitem;
            break;
        }
        if (_currListItem > lastIndex)
        {
            _currListItem = old_listitem;
            break;
        }

        if (!extlib.isHidden(_elemsNPList[_currListItem]))
            break;
    }

    if (_currListItem < 0) {
        _currListItem = 0;
        NextPreviousListPage(-1);
    } else if (_currListItem > lastIndex) {
        _currListItem = lastIndex;
        NextPreviousListPage(1);
    } else {
        _currElem = _elemsNPList[_currListItem];

        try {
            if ((typeof(_elemsListContainers) === 'undefined') || (_elemsListContainers.length === 0) || !(extlib.isHidden($("#" + _elemsListContainers[_currListContainer].id + " .bd"))))
            {
                extlib.simulateEvent(_currElem, "mouseover");
                scrollMiddle(_currElem);
            } else
            {
                scrollMiddle(_elemsListContainers[_currListContainer]);            
            }
        } catch (ex)
        {

        }

        UpdateKeyboardSelection(_currElem, true);

        var elemsLinks = _currElem.getElementsByTagName("a");
        if (elemsLinks.length == 0) {
            switch (_currListItem) {
            case 0:
                NextPreviousListItem(1);
                break;
            case lastIndex:
                NextPreviousListItem(-1);
                break;
            default:
                NextPreviousListItem(direction);
                break;
            }
            //NextPreviousListItem(-direction);
        }        
    }
}

function ListHasItems(list)
{
    if (list) {
        for (i = 0; i < list.length; i++)
        {
            if (!extlib.isHidden(list[i])) // Updated jaredsohn-Lifehacker to ignore hidden elements
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
    html += "<h1 style='text-align: center;'>Flix Plus keyboard commands</h2><br><br>";
    html += "<div style='font-size: 125%'; }>";
    console.log(_keyboard_id_to_shortcut_dict);
    html += keyboard_shortcuts_info.get_help_text(_keyboard_id_to_shortcut_dict, false);
    html += "</div>";

    return html;
}

var toggle_keyboard_commands = function()
{
    if (!_keyboard_commands_shown)
    {
        var commands_div = document.createElement("div");
        commands_div.id = "flix_plus_keyboard_commands";
        commands_div.innerHTML = getKeyboardCommandsHtml();

        var help_css_main = "#flix_plus_keyboard_commands { align: center; width: 500px; top: 50%; left: 50%; z-index: 9999; position: fixed; margin-left: -250px; margin-top: -325px; padding: 20px; height: 650px; opacity: 0.9; border-width: 5px; border-style: solid; "
        if ((enabled_scripts === null) || (enabled_scripts["id_darker_netflix"]))
            extlib.addGlobalStyle(help_css_main + " background-color: black; foreground-color: white; border-color: white; }");
        else
            extlib.addGlobalStyle(help_css_main + " background-color: white; foreground-color: black; border-color: black; }");

        document.body.appendChild(commands_div);

        $(document.body).click(function(e){
            if (_keyboard_commands_shown == true)
            {
                console.log("clicked");
                toggle_keyboard_commands();
                $(document.body).unbind("click");
            }
        });
    }
    else
    {
        $("#flix_plus_keyboard_commands").remove();
    }

    _keyboard_commands_shown = !_keyboard_commands_shown;
}

var handle_key_down = function(e)
{
    var keyCombo = "";

    // TODO: use full list of keys here instead
    switch (e.keyCode)
    {
        case 13: keyCombo = "Enter"; break;
        case 27: keyCombo = "Escape"; break;
        case 32: keyCombo = "Space"; break;
        case 37: keyCombo = "Left"; break;
        case 39: keyCombo = "Right"; break;
        case 38: keyCombo = "Up"; break;
        case 40: keyCombo = "Down"; break;
        case 36: keyCombo = "Home"; break;
        case 37: keyCombo = "End"; break;
    }
    if (keyCombo === "")
        return;

    // hack
    if ((location.pathname.indexOf("/ProfilesGate") === 0) && ((keyCombo === "Space") || (keyCombo === "Enter")))
    {
        console.log("running hack");
        extlib.simulateClick($("img", _elemsNPList[_currListItem])[0]);
        return;
    }

    var ignoreShift = (_already_has_shift_chars.indexOf(keyCombo) !== -1);

    if ((e.altKey)) keyCombo = "Alt-" + keyCombo;
    if ((e.ctrlKey)) keyCombo = "Ctrl-" + keyCombo;
    if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift-" + keyCombo;

    var command = key_lookup(keyCombo);
    if ((command !== null) && (command !== ""))
    {
        run_command(command);
        e.preventDefault();   
    }
}

var key_lookup = function(keyCombo)
{
    var command = "";

    //console.log("looking up: " + keyCombo);
    if (typeof(_keyboard_shortcut_to_id_dict[keyCombo]) !== "undefined")
        command = _keyboard_shortcut_to_id_dict[keyCombo];

    //console.log("command found: " + command);

    return command;
}

var handle_key_press = function(e)
{
    if (e.target.nodeName.match(/^(textarea|input)$/i)) {
        return;
    }
    var override = true;
    var keyCombo = String.fromCharCode(e.charCode||e.which).toLowerCase();
    //console.log("keycombo is");
    //console.log(keyCombo);

    var ignoreShift = (_already_has_shift_chars.indexOf(keyCombo) !== -1);

    if (e.altKey || e.ctrlKey || (!ignoreShift && (e.shiftKey)))
        keyCombo = keyCombo.toUpperCase();

    if (e.altKey) keyCombo = "Alt+" + keyCombo;
    if (e.ctrlKey) keyCombo = "Ctrl+" + keyCombo;
    if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift+" + keyCombo;

    var command = key_lookup(keyCombo);
    if ((command !== null) && (command !== ""))
    {
        run_command(command);
        e.preventDefault();   
    }
}

var run_command = function(command)
{
    try
    {
        var elem = null;

        if ((_keyboard_commands_shown) && (command !== "help"))
            return;

        switch(command)
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
                RateMovie(command); break;
            case "move_right": NextPreviousListItem(1); break;
            case "move_left": NextPreviousListItem(-1); break;
            case "move_home": UpdateKeyboardSelection(_elemsNPList[_currListItem], false); _currListItem = -1; NextPreviousListItem(1); break;
            case "move_end": UpdateKeyboardSelection(_elemsNPList[_currListItem], false); _currListItem = _elemsNPList.length; NextPreviousListItem(-1); break;
            case "play": WatchOrZoomMovie(command); break;
            case "to_my_list": AddToQueue(); break;
            case "remove_from_my_list": RemoveFromQueue(); break;
            case "zoom_into_details": WatchOrZoomMovie(command); break;
            case "open_link": OpenCurrentLink(); break;
            case "next_section": NextPreviousListContainer(1);  break;
            case "prev_section": NextPreviousListContainer(-1);  break;
            case "section_home":
                UpdateKeyboardSelection(_elemsNPList[_currListItem], false);
                _currListContainer = -1;
                NextPreviousListContainer(1);

                UpdateKeyboardSelection(_elemsNPList[_currListItem], false);
                _currListItem = -1;
                NextPreviousListItem(1);
                break;
            case "section_end":
                UpdateKeyboardSelection(_elemsNPList[_currListItem], false);
                _currListContainer = _elemsListContainers.length - 1;
                NextPreviousListContainer(-1);

                UpdateKeyboardSelection(_elemsNPList[_currListItem], false);
                _currListItem = _elemsNPList.length;
                NextPreviousListItem(-1);
                break;
            case "open_section_link": OpenSectionLink(); break;
            case "toggle_scrollbars": elem = document.getElementById(_elemsListContainers[_currListContainer].id + "_scrollshowall"); if (elem !== null) { elem.click(); } break;
            case "toggle_hiding": elem = document.getElementById(_elemsListContainers[_currListContainer].id + "_showhide"); if (elem !== null) { elem.click(); } break;
            case "jump_instant_home": window.location = "http://www.netflix.com/WiHome";  break;
            case "jump_my_list": window.location = "http://www.netflix.com/MyList"; break;
            case "jump_new_arrivals": window.location = "http://www.netflix.com/WiRecentAdditions"; break;
            case "jump_kids": window.location = "http://www.netflix.com/Kids"; break;
            case "jump_viewing_activity": window.location = "http://www.netflix.com/WiViewingActivity";  break;
            case "jump_your_ratings": window.location = "https://www.netflix.com/MoviesYouveSeen"; break;
            case "search": elem = document.getElementById("searchTab").click(); document.getElementById("searchField"); elem.focus(); elem.select(); break;
            case "your_account": window.location = "https://www.netflix.com/YourAccount"; break;
            case "help": toggle_keyboard_commands(); break;
            case "close_window": _keyboard_commands_shown = true; toggle_keyboard_commands(); $.each($("#layerModalPanes .close"), function(index, value) { this.click()  }); break;
        }
    } catch (ex)
    {

    }
};

////////////////////////////////////////////////////////////////////////////////////////////////
// Startup
////////////////////////////////////////////////////////////////////////////////////////////////

keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + fplib.getProfileName() + " keyboard_shortcuts", function(keyboard_shortcut_to_id_dict, keyboard_id_to_shortcut_dict)
{
    //console.log(keyboard_shortcut_to_id_dict);
    //console.log(keyboard_id_to_shortcut_dict);
    _keyboard_shortcut_to_id_dict = keyboard_shortcut_to_id_dict;
    _keyboard_id_to_shortcut_dict = keyboard_id_to_shortcut_dict;

    fplib.addEmptyVideoAnnotations(); // clean up DOM
    fplib.idMrows();

    var selectors = fplib.getSelectorsForPath();
    console.log(selectors);
    if (selectors["elementsList"] === ".mrow")
    {
        _elemsListContainers = document.getElementsByClassName("mrow");
        if ((_elemsListContainers.length > 0) && (extlib.hasClass(_elemsListContainers[0], 'characterRow')))
        {
            newList = []
            for (i = 1; i < _elemsListContainers.length; i++)
            {
                newList.push(_elemsListContainers[i]);
            }
            _elemsListContainers = newList;  // now an array instead of htmlcollection
        }

        if ($(".emptyYourListRow").length)
        {
            NextPreviousListContainer(1);
        }

        document.body.arrive(selectors["elementsList"], function()
        {
            //console.log(".");
            _elemsListContainers.push(this);
        });

        if (_elemsListContainers.length >= 2)
            extlib.simulateEvent($("#mrow_id_1")[0], "mouseover"); // We do this because otherwise it for some reason shows movie info on first movie of this row within remove_dupes code

    } else
    {
        _elemsNPList = $(selectors["elements"]).get();
        console.log(_elemsNPList);

        document.body.arrive(selectors["elements"], function()
        {
            //console.log(".");
            _elemsNPList.push(this);
        });
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if (_elemsNPList) {
        NextPreviousListItem(1);
    }
    if (_elemsListContainers) { 
        NextPreviousListContainer(1);
    }

    if (location.pathname.indexOf("/WiSearch") === 0)
    {
        var elems = document.getElementsByClassName("searchResultsPrimary");
        for (i = 0; i < elems.length; i++) { 
            elems[i].style.width = "1000px"; // add room for borders
        }
    }

    document.addEventListener('keypress', handle_key_press, false);
    document.addEventListener('keydown', handle_key_down, false);

    // Make borders more visible on many pages
    extlib.addGlobalStyle(".agMovieGallery {position: relative; top: 10px; left:10px}");
});