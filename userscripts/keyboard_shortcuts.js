////////////////////////////////////////////////////////////////////////////////

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

var elemsListContainers;
var currListContainer = -1;
var elemsNPList;
var currListItem = -1;
var currElem = null;
var _keyboard_commands_shown = false;

////////////////////////////////////////////////////////////////////////////////////////////////
// Scrolling to element with keyboard focus
//////////////////////////////////////////////////////////////////////////////////////////////////////

Element.prototype.documentOffsetTop = function () {
    return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
};

// jaredsohn-lifehacker Adapted from http://stackoverflow.com/questions/8922107/javascript-scrollintoview-middle-alignment.  Using instead of just scrollIntoView
function scrollMiddle(elem)
{
    elem.scrollIntoView(true);
    var pos = elem.documentOffsetTop() - (window.innerHeight / 2 );
    window.scrollTo( 0, pos );
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Open a link based on selection
////////////////////////////////////////////////////////////////////////////////////////////////

function WatchOrZoomMovie(action)
{
    if (currElem === null)
        return;

    var selectors = fplib.getSelectorsForPath();
    if (selectors === null)
        return;

    var attr_elem = null;
    if (selectors["movieInfoSelector"] !== null)
    {
        attr_elem = $(selectors["movieInfoSelector"], currElem);
    } else
    {
        attr_elem = $(currElem);
    }

    var full_str = attr_elem.attr(selectors["movieIdAttribute"]);
    var movie_id = fplib.getMovieIdFromField(full_str);

    switch (action) {
        case "p":
            this.location = "http://www.netflix.com/WiPlayer?movieid=" + movie_id;
            break;
        case "z":
            this.location = "http://www.netflix.com/WiMovie/" + movie_id;
            break;
    }
}

function OpenSectionLink()
{
    console.log("OpenSectionLink");
    console.log(elemsListContainers);
    console.log(currListContainer);
    console.log(elemsListContainers[currListContainer]);

    var container = $("h3 a", elemsListContainers[currListContainer]);
    console.log(container[container.length - 1]);
    var url = container[container.length - 1].href;
    console.log(url);
    if (url !== "")
        window.location = url;
    
    return;
}

function OpenCurrentLink()
{
    if (!ListHasItems(elemsNPList)) {
        return;
    }
    
    var elemsLinks = elemsNPList[currListItem].getElementsByTagName("a");
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
        elemContainer = elemsNPList[currListItem];
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
                    if ((typeof(elemsNPList) !== "undefined") && (elemsNPList !== null) && (elemsNPList.length > currListItem))    
                        UpdateKeyboardSelection(elemsNPList[currListItem], true);
                }
            }
        }
    }
}


function AddToQueue()
{
    var selectors = fplib.getSelectorsForPath();

    if (selectors["elemContainerId"] === "[selected]")
        elemContainer = elemsNPList[currListItem];
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
        elemContainer = elemsNPList[currListItem];
    else if (selectors["elemContainerId"] === "[document")
        elemContainer = document;
    else
        elemContainer = document.getElementById(selectors["elemContainerId"]);

    //console.log("elemRatingContainer = ");
    //console.log(elemRatingContainer);
    //console.log(selectors);

    if (elemContainer !== null)
    {        
        if (selectors["ratingMouseOver"] !== null)
        {
            var mouseOverContainer = $(selectors["ratingMouseOver"], elemContainer);
            extlib.simulateEvent(mouseOverContainer[0], "mouseover");
        }

        var rating_class = fplib.getRatingClass(rating);
        //console.log("ratingclass = ");
        //console.log(rating_class);
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

    if (location.pathname.indexOf("/MyList") === 0) // separated out because width is different
    {
        if (selected)
            border_elem.setAttribute('style', 'border-style: solid !important; border-color: #b9090b !important; border-width: 5px !important');
        else
            border_elem.setAttribute('style', 'border-style: none;');
    }
    else if ((location.pathname.indexOf("/WiHome") === 0) || ((location.pathname.indexOf("/WiRecentAdditions") === 0) || (location.pathname.indexOf("/NewReleases") === 0))) // separated out because width is different
    {
        if (selected)
            border_elem.setAttribute('style', 'border-style: solid !important; border-color: #b9090b !important; top: -10px !important; border-width: 10px !important');
        else
            border_elem.setAttribute('style', 'border-style: none !important; border-color: #b9090b !important; top: 0px !important; border-width: 0px !important');
    }
    else if (
            (location.pathname.indexOf("/Search") === 0) || (location.pathname.indexOf("/WiAltGenre") === 0) || (location.pathname.indexOf("/WiSearch") === 0) || 
            (location.pathname.indexOf("/WiGenre") === 0) || (location.pathname.indexOf("/KidsAltGenre") === 0) || (location.pathname.indexOf("/Kids") === 0) ||
            (location.pathname.indexOf("/WiAltGenre") === 0) || (location.pathname.indexOf("/WiSimilarsByViewType") === 0) || (location.pathname.indexOf("/WiAgain") === 0) 
        ) 
    {
        if (selected)
            border_elem.setAttribute('style', 'border-style: solid !important; border-color: #b9090b !important; top: 10px !important; border-width: 10px !important')
        else
            border_elem.setAttribute('style', 'border-style: none !important; border-color: #b9090b !important; top: 0px !important; border-width: 0px !important')                
    } else
    {
        border_elem.style.backgroundColor = selected ? "rgb(185,9,11)" : ""; // netflix red
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
    if (!ListHasItems(elemsListContainers)) {
        NextPreviousListPage(direction);
        return;
    }

    try
    {
        if (((typeof(elemsListContainers) !== "undefined")) && (elemsListContainers != null))
        {
            if ((elemsListContainers.length - 1 >= currListContainer) && (currListContainer !== -1))
            {
                elemsListContainers[currListContainer].style["border-style"] = "none";   
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
        currListContainer += direction;
        if (currListContainer < 0) {
            currListContainer = 0;
        } else if (currListContainer >= elemsListContainers.length - 1) {
            currListContainer = elemsListContainers.length - 1;
            break;
        }

        if (elemsListContainers[currListContainer].style.display !== "none")
            break;
    }

    NextPreviousListItem(0);
    currElem = elemsListContainers[currListContainer];
    scrollMiddle(currElem);
    elemsNPList = currElem.getElementsByClassName("agMovie"); // TODO: should use fplib to find selector for active page
    currListItem = -1;
    NextPreviousListItem(1);

    try
    {
        if (((typeof(elemsListContainers) !== "undefined")) && (elemsListContainers != null))
        {
            if (elemsListContainers.length - 1 >= currListContainer)
            {
                elemsListContainers[currListContainer].style["border-style"] = "solid";   
            }
        }
    } catch (ex)
    {
        console.log(ex);
    }
}


function NextPreviousListItem(direction)
{
    if (!ListHasItems(elemsNPList)) {
        return;
    }
    currElem = null;
    var lastIndex = elemsNPList.length - 1;
    try {
        currElem = elemsNPList[currListItem];
        UpdateKeyboardSelection(currElem, false);
    } catch(err) {
        //ignore error
    }
    if (direction == 0) {
        return;
    }
    var old_listitem = currListItem;
    while (true)
    {
        currListItem += direction;

        if (currListItem < 0)
        {
            currListItem = old_listitem;
            break;
        }
        if (currListItem > lastIndex)
        {
            currListItem = old_listitem;
            break;
        }

        if (elemsNPList[currListItem].style.display !== "none")
            break;
    }

    if (currListItem < 0) {
        currListItem = 0;
        NextPreviousListPage(-1);
    } else if (currListItem > lastIndex) {
        currListItem = lastIndex;
        NextPreviousListPage(1);
    } else {
        currElem = elemsNPList[currListItem];

        try {
            if ((typeof(elemsListContainers) === 'undefined') || (elemsListContainers.length === 0) || ($("#" + elemsListContainers[currListContainer].id + " .bd").css("display") !== "none"))
            {
                extlib.simulateEvent(currElem, "mouseover");
                scrollMiddle(currElem);
            } else
            {
                scrollMiddle(elemsListContainers[currListContainer]);            
            }
        } catch (ex)
        {

        }

        UpdateKeyboardSelection(currElem, true);

        var elemsLinks = currElem.getElementsByTagName("a");
        if (elemsLinks.length == 0) {
            switch (currListItem) {
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
            if (list[i].style.display !== "none") // Updated jaredsohn-Lifehacker to ignore hidden elements
                return true;
        }
    }
    return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Initiate keyboard commands
////////////////////////////////////////////////////////////////////////////////////////////////

function handleKeyUp(e)
{
    if (e.keyCode == 27) // ESC
    {
        _keyboard_commands_shown = true;
        toggle_keyboard_commands();
        $.each($("#layerModalPanes .close"), function(index, value) { this.click()  })
    }
}

var getKeyboardCommandsHtml = function()
{
    var html = "<div style='{ background-color: rgba(1, 1, 1, 0.7); bottom: 0; left: 0; position: fixed; right: 0; top: 0; }'>"; // capture mouse clicks
    html += "<h1 style='text-align: center;'>Flix Plus keyboard commands</h2><br><br>";
    html += "<div style='font-size: 125%'; }>";
    html += "Cursor and section is highlighted by a red border.<br><br>Move around items: j, k<BR>&nbsp;&nbsp;&nbsp;Play: p<BR>&nbsp;&nbsp;&nbsp;To My List: +<BR>&nbsp;&nbsp;&nbsp;Remove from My List: -<BR>&nbsp;&nbsp;&nbsp;Zoom into details: z<BR>&nbsp;&nbsp;&nbsp;Rate: ` to clear, 0-5, 6=1.5, 7=2.5, 8=3.5, 9=4.5<BR>&nbsp;&nbsp;&nbsp;Open link: o<br><br>Move around sections: shift-j,  shift-k<BR>&nbsp;&nbsp;&nbsp;Open section link: shift-o<br>&nbsp;&nbsp;&nbsp;Toggle scrollbars: s<br>&nbsp;&nbsp;&nbsp;Toggle hiding: h<br><br>Jump to page<br>&nbsp;&nbsp;&nbsp;open link: o<br>&nbsp;&nbsp;&nbsp;Home: i <BR>&nbsp;&nbsp;&nbsp;My List : q(ueue) <BR>&nbsp;&nbsp;&nbsp;New arrivals: r<br>&nbsp;&nbsp;&nbsp;Kids: d<BR>&nbsp;&nbsp;&nbsp;Viewing activity: a<br>&nbsp;&nbsp;&nbsp;Your Ratings: t<BR><br>Search: /<BR>Your Account: y<BR>Help: ?<BR>";
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

function handleKeyPress(e)
{
    if (e.target.nodeName.match(/^(textarea|input)$/i)) {
        return;
    }
    var override = true;
    var keyCombo = String.fromCharCode(e.charCode||e.which).toLowerCase();

    if (e.altKey) { 
        keyCombo = "Alt+" + keyCombo;
    }
    if (e.ctrlKey) { 
        keyCombo = "Ctrl+" + keyCombo;
    }
    if (e.shiftKey) { 
        keyCombo = "Shift+" + keyCombo;
    }

    if ((_keyboard_commands_shown) && (keyCombo !== "Shift+?"))
        return;

    try
    {
        switch(keyCombo) {
            case "p": case "z": WatchOrZoomMovie(keyCombo); break;
            case "`": case "0": case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":  RateMovie(keyCombo); break;
            case "-": RemoveFromQueue(); break;
            case "+": case "Shift++": case "=": AddToQueue(); break;
            case "/": var elem = document.getElementById("searchField"); elem.focus(); elem.select(); break;
            case "Shift+?": toggle_keyboard_commands(); break; // keycode string is weird here because it applies the shift to the character but shift is still there.
            case "a": window.location = "http://www.netflix.com/WiViewingActivity"; break;
            case "h": document.getElementById(elemsListContainers[currListContainer].id + "_showhide").click(); break; // for integration with hidesection in Flix Plus
            case "i": window.location = "http://www.netflix.com/WiHome"; break;
            case "j": NextPreviousListItem(-1); break;
            case "Shift+j": NextPreviousListContainer(-1); break;
            case "d": window.location = "http://www.netflix.com/Kids"; break;
            case "k": NextPreviousListItem(1); break;
            case "Shift+k": NextPreviousListContainer(1); break;
            case "o": OpenCurrentLink(); break;
            case "q": window.location = "http://www.netflix.com/MyList"; break;
            case "r": window.location = "http://www.netflix.com/WiRecentAdditions"; break;
            case "s": document.getElementById(elemsListContainers[currListContainer].id + "_scrollshowall").click(); break; // for integration with collapsescrollbars in Flix Plus
            case "t": window.location = "https://www.netflix.com/MoviesYouveSeen"; break;
            case "Shift+o": OpenSectionLink(); break;
            case "y": window.location = "https://www.netflix.com/YourAccount"; break;
            default: return;
        }
        if (override) {
            e.preventDefault();
        }
    } catch (ex)
    {
        console.log("Exception: ");
        console.log(ex);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////
// Startup
////////////////////////////////////////////////////////////////////////////////////////////////


fplib.addEmptyVideoAnnotations(); // clean up DOM
fplib.idMrows();

var selectors = fplib.getSelectorsForPath();
if (selectors["elementsList"] === ".mrow")
{
    elemsListContainers = document.getElementsByClassName("mrow");
    if ((elemsListContainers.length > 0) && (extlib.hasClass(elemsListContainers[0], 'characterRow')))
    {
        newList = []
        for (i = 1; i < elemsListContainers.length; i++)
        {
            newList.push(elemsListContainers[i]);
        }
        elemsListContainers = newList;  // now an array instead of htmlcollection
    }

    console.log(elemsListContainers);
    if ($(".emptyYourListRow").length)
    {
        NextPreviousListContainer(1);
    }

    document.body.arrive(selectors["elementsList"], function()
    {
        console.log(".");
        elemsListContainers.push(this);
    });

    if (elemsListContainers.length >= 2)
        extlib.simulateEvent($("#mrow_id_1")[0], "mouseover"); // We do this because otherwise it for some reason shows movie info on first movie of this row within remove_dupes code

} else
{
    elemsNPList = $(selectors["elements"]).get();
    console.log(elemsNPList);

    document.body.arrive(selectors["elements"], function()
    {
        console.log(".");
        elemsNPList.push(this);
    });
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

if (elemsNPList) {
    NextPreviousListItem(1);
}
if (elemsListContainers) { 
    NextPreviousListContainer(1);
}

if (location.pathname.indexOf("/WiSearch") === 0)
{
    var elems = document.getElementsByClassName("searchResultsPrimary");
    for (i = 0; i < elems.length; i++) { 
        elems[i].style.width = "1000px"; // add room for borders
    }
}

document.addEventListener('keypress', handleKeyPress, false);
document.addEventListener('keyup', handleKeyUp, false);