// from https://github.com/michaelschade/netflix-trailers
// jaredsohn-lifehacker: removed insertion of jquery, analytics

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old MyList.")
    return;
}

function main() {
  MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

  // YouTube URL for trailer
  function trailerURL(movieName) {
    return 'https://youtube.com/results?search_query=' + encodeURIComponent(movieName + ' trailer');
  }

  // jQuery link element
  function trailerLink(movieName, id) {
    return $('<a>', {
      href: trailerURL(movieName),
      text: 'Trailer',
      target: '_blank',
      id: id
    }).click(function() {
      //        _gaq.push(['_trackEvent', $(this).attr('id'), 'clicked']);
    });
  }

  // Detect movie popover and add trailer link
  function monitorPreview(id, readmore_class) {
    var target = document.querySelector('#' + id);
    var observer = new MutationObserver(function(mutations) {
      var movieName = $('#' + id + ' .mdpLink .title').text().trim();
      var link$ = trailerLink(movieName, 'trailer-popover');
      $('#' + id + ' .' + readmore_class).after(link$).after(' \u00B7 ');
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
    case "WiSimilarsByViewType":
      monitorPreview('BobMovie-content', 'readMore');
      break;
    case "WiGenre":
      monitorPreview('bob-container', 'synopsis .mdpLink');
      break;
    case "WiMovie": // Movie detail page
      movieInfo();
      break;
    default:
      break;
  }
}

main();
