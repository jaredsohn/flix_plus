// from https://github.com/michaelschade/netflix-trailers
// jaredsohn-lifehacker: removed insertion of jquery.js, analytics

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

// YouTube URL for trailer
function trailerURL(movieName) {
  return 'https://youtube.com/results?search_query=' + encodeURIComponent(movieName + ' trailer');
}

function createTrailerElem(movieName, id) {
  var elem = document.createElement("a");
  elem.className = "fp_preview_link";
  elem.href = trailerURL(movieName);
  elem.innerHTML = "<img alt='Watch trailer' width=32px src='" + chrome.extension.getURL('../src/img/trailer.png') + "'>";
  elem.target = '_blank';
  elem.style.cssText = "margin-left: 20px; display:inline-block";
  elem.id = id;
  elem.title = "Watch trailer";

  return elem;
}

// Detect movie popover and add trailer link
function monitorPreview(id) {
  var target = document.querySelector('#' + id);
  var observer = new MutationObserver(function(mutations) {

    fplib.create_popup_header_row();

    var movieName = $('#' + id + ' .mdpLink .title').text().trim();
    var linkElem = createTrailerElem(movieName, 'trailer-popover');
    $(".fp_header_row")[0].appendChild(linkElem);
  });
  observer.observe(target, { childList: true });
}

// Add trailer link to movie detail page
function movieInfo() {
  var header$ = $('h1.title');
  var movieName = header$.text().trim();
  var link$ = $('<span>', {
    class: 'year'
  }).append(createTrailerElem(movieName, 'trailer-detail'));
  header$.parent().after(link$);
}

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

monitorPreview('BobMovie-content'); // should work everywhere except for wigenre; redirect those pages to wialtgenre
if ((window.location.pathname.split('/')[1]) === "WiMovie")
    movieInfo();


