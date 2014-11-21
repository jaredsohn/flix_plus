// from https://github.com/michaelschade/netflix-trailers
// jaredsohn-lifehacker: removed insertion of jquery.js, analytics

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old My List.")
    return;
}

function main() {

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
    }).append(trailerLink(movieName, 'trailer-detail'));
    header$.parent().after(link$);
  }

  /* Route page to proper processing logic */
  switch (window.location.pathname.split('/')[1]) {
    case "WiHome":            
    case "WiRecentAdditions":
    case "NewReleases":
    case "WiAgain":
    case "WiAltGenre":
    case "MyList":
    case "WiSimilarsByViewType":
      monitorPreview('BobMovie-content');
      break;
    case "WiGenre":
      monitorPreview('bob-container'  );
      break;
    case "WiMovie": // Movie detail page
      movieInfo();
      break;
    default:
      break;
  }
}

main();
