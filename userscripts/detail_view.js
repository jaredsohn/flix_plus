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

// jaredsohn-lifehacker: Now requires extlib.js, fplib.js, and arrive.js.

extlib.addGlobalStyle(".lockup:hover>.playHover { background-image:none; }  !important"); // jaredsohn-Lifehacker...so it doesn't show 'Play' on genre pages

var stopIt    = function (e) { e.preventDefault(); e.stopPropagation(); },
    clickIt   = function (e) { stopIt(e); window.location.href = this.href; },
    regex     = /^https?\:\/\/www\.netflix\.com\/WiPlayer\?movieid=([\d]+)/, // changed from movies to www lifehacker-jaredsohn
    linkBase  = 'http://www.netflix.com/WiMovie/',
    aTags     = Array.prototype.slice.call(document.getElementsByTagName('a')),
    playClass = /(?:\s|^)playLink|hoverPlay(?:\s|$)/, // hoverPlay added lifehacker-jaredsohn
    i         = aTags.length,
    tag;


var fixTag = function(tag)
{
  if (regex.test(tag.href)) {
    if (tag.id === "play-popover")
      return;

    tag.playhref     = tag.href;
    tag.className    = tag.className.replace(playClass, ' ');
    tag.href         = linkBase + tag.href.match(regex)[1];
    tag.onmousedown  = stopIt;
    tag.onclick      = clickIt;
  }
}

function createPlayLink(movie_id, link_id) {
  var elem = document.createElement('a');

  elem.href = window.location.protocol + "//www.netflix.com/WiPlayer?movieid=" + movie_id;
  elem.innerHTML = "<img alt='Play' width=32px src='" + chrome.extension.getURL('../src/img/play.png') + "'>";
  elem.style.cssText = "margin-left: 20px; display:inline-block";
  elem.id = link_id;
  elem.title = "Play";
  elem.className = "fp_play_link fp_button";

  return elem;
}

while (i--) {
  tag = aTags[i];
  fixTag(tag);
}

// added by jaredsohn-lifehacker so that it fixes links that later are added to the page (such as when you add something to My List).
document.arrive("a", function()
{
  fixTag(this);
});


monitorPreview = function(elem_id)
{
  // Add a play button to the popup.  mark as play-popover so URL isn't rewritten.
  document.body.arrive("#" + elem_id + " .readMore", function()
  {
    console.log("arrive");

    fplib.create_popup_header_row();

    var parts = $("#" + elem_id + " .mdpLink")[0].href.split("/");
    var movie_id = parts[parts.length - 1];
    var link = createPlayLink(movie_id, "play-popover");
    $(".fp_header_row")[0].appendChild(link);
  });
}

monitorPreview('BobMovie-content');
// for wiGenre, would use monitorPreview('bob-container'), but that page now redirects to wiAltGenre



// Make window bigger so there is room for button
var onPopup = function()
{
    console.log("arrive");

    $(".bobMovieContent").height(250); // jaredsohn-lifehacker: Added to make room for ratings buttons (after recommend button was added)
    $(".bobMovieContent").width(325);  // Sometimes the code below wouldn't fit within the popup; make it bigger to accomodate it
    $("#BobMovie-content").width(347); // Match the width
    $(".bobMovieHeader").width(329);   // Match the width
};

var selectors = fplib.getSelectorsForPath();
if (selectors !== null)
  document.arrive(selectors["bobPopup"], onPopup);

