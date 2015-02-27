// ==UserScript==
// @name          Open Netflix Movies as Detail View
// @namespace     https://github.com/matthewpucc
// @version       1.3
// @updateURL     http://matthewpucc-db.s3.amazonaws.com/FTFY/NetflixFix/pwn.js
// @description   This will rewrite the image links in the default netflix views
//                to open the information page instead of forcing the movie/show
//                to start playing. The makes managing a queue much easier.
// @include       http://*netflix.com/search*
// @include       http://*netflix.com/*
// @exclude       http://movies.netflix.com/WiPlayer*
// @exclude       http://movies.netflix.com/WiMovie*
// @copyright     2012+, matthewpucc, Beerware
// ==/UserScript==

/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * matthewpucc wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return
 * ----------------------------------------------------------------------------
 */

// Changes made by jaredsohn-lifehacker for Flix Plus:
// -- Now requires extlib.js, fplib.js, and arrive.js.
// -- avoids updating certain links
// -- adds an icon for playing from the popup
// -- changes links that are created dynamically

var regex_ = /^https?\:\/\/www\.netflix\.com\/WiPlayer\?movieid=([\d]+)/; // changed from movies to www lifehacker-jaredsohn
var linkBase_ = (location.pathname.indexOf("/Kids") === 0) ? 'http://www.netflix.com/KidsMovie/' : 'http://www.netflix.com/WiMovie/'; // apply to all kids pages
var aTags_ = Array.prototype.slice.call(document.getElementsByTagName('a'));
var tagIndex_ = aTags_.length;

var stopIt = function(e) { e.preventDefault(); e.stopPropagation(); };
var clickIt = function(e) { stopIt(e); window.location.href = this.href; };


var fixTag = function(tag)
{
    if (regex_.test(tag.href)) {
        if ((tag.id === "fp_play_popover") || (tag.classList.contains("fp_play")))
            return;
        tag.playhref = tag.href;
        tag.classList.remove("playLink"); // also care about hoverPlay for genre pages but Flix Plus forwards those URLs to AltGenre
        tag.href = linkBase_ + tag.href.match(regex_)[1];
        tag.onmousedown = stopIt;
        tag.onclick = clickIt;
    }
};

var createPlayLink = function(movie_id, link_id) {
    var elem = document.createElement('a');

    elem.href = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movie_id;
    elem.innerHTML = "<img alt='Play' width=32px src='" + chrome.extension.getURL('../src/img/play.png') + "'>";
    elem.style.cssText = "margin-left: 20px; display:inline-block";
    elem.id = link_id;
    elem.title = "Play";
    elem.className = "fp_play fp_button";

    return elem;
};

var monitorPreview = function(elem_id)
{
    // Add a play button to the popup.  mark as fp_play_popover so URL isn't rewritten.
    document.body.arrive("#" + elem_id + " .readMore", function()
    {
        console.log("arrive");

        fplib.createPopupHeaderRow();

        var parts = $("#" + elem_id + " .mdpLink")[0].href.split("/");
        var movie_id = parts[parts.length - 1];
        var link = createPlayLink(movie_id, "fp_play_popover");
        $(".fp_header_row")[0].appendChild(link);
    });
};

// Make window bigger so there is room for button
var onPopup = function()
{
    console.log("arrive");

    $(".bobMovieContent").height(250); // jaredsohn-lifehacker: Added to make room for ratings buttons (after recommend button was added)
    $(".bobMovieContent").width(325);  // Sometimes the code below wouldn't fit within the popup; make it bigger to accomodate it
    $("#BobMovie-content").width(347); // Match the width
    $(".bobMovieHeader").width(329);   // Match the width
};

var ignoreElems = function(elems)
{
    if (elems.length)
    {
        for (i = 0; i < elems.length; i++)
            elems[i].classList.add("fp_play");
    }
};

var ignoreAllElems = function()
{
    ignoreElems($(".displayPagePlayable a")); // play button on wimovie
    ignoreElems($(".episodeList .playBtn a")); // play buttons for episodes on wimovie
    ignoreElems($("#chronology a")); // play buttons for episodes on kidsmovie
    ignoreElems($(".episode .playButton")); // play buttons for episodes on wimovie (Netflix Originals)
    ignoreElems($(".playButtonWrapper a")); // play and recap buttons on wimovie for Netflix Originals
    ignoreElems($(".trailers a")); // Buttons within trailers
};

// Remove the Play hover buttons on posters on genre pages
extlib.addGlobalStyle(".lockup:hover>.playHover { background-image:none; }  !important");

ignoreAllElems();
while (tagIndex_--)
    fixTag(aTags_[tagIndex_]);

// clear out hasText class so that it doesn't grey out the recently watched movie when it is highlighted
$.each($(".recentlyWatchedInner .hasText"), function() { this.classList.remove("hasText"); });

// Fixes links that are added to the page (such as when you add something to My List).
document.arrive("a", function()
{
    ignoreAllElems(); // a little redundant

    fixTag(this);
});

monitorPreview('BobMovie-content');
// for wiGenre, would use monitorPreview('bob-container'), but that page now redirects to wiAltGenre

var selectors = fplib.getSelectorsForPath();
if ((selectors !== null) && (selectors["bobPopup"] !== null))
    document.arrive(selectors["bobPopup"], onPopup);


