// ==UserScript==
// @name        Netflix Scroll Buster
// @namespace   micflan
// @description No more side scrolling nonsense.
// @include     *netflix.com*
// @version     1
// @grant       none
// ==/UserScript==

// Modified heavily by jaredsohn/Lifehacker to:
// -- allow doing it piecemeal, a section at a time
// -- allow undoing it
// -- allow saving/loading via local storage / Chrome storage
// -- various UI improvements
//    -- add empty text under each poster so that the layout looks less funky
//    -- make sure the horizontal alignment is okay when undone
//    -- remove the vertical bar, 


// Now requires extlib.js, fplib.js (jaredsohn-lifehacker)

// TODO: cannot scroll left immediately after expanding if user didn't scroll earlier.

var KEY_NAME = "flix_plus " + fplib.getProfileName() + " scrollshowall";

var collapse_height = 268;
if (location.pathname.indexOf("/Kids") === 0) //hacky
  collapse_height = 242;

// How this css works: is four statements; first two make it show everything instead of scrolling; next two remove arrows and dividers
var expand_template   = "#MROWID .slider { height: auto !important; overflow: visible !important; } #MROWID .slider .agMovieSetSlider { position: relative !important; width: auto !important;   } #MROWID .triangleBtns .sliderButton, #MROWID .sliderButton, #MROWID .boxShotDivider { display: none !important; }"
var collapse_template = "#MROWID .slider { height: " + collapse_height + "px !important; overflow: hidden !important; } #MROWID .slider .agMovieSetSlider { position: absolute !important; width: 2000px !important; } #MROWID .triangleBtns .sliderButton, #MROWID .sliderButton, #MROWID .boxShotDivider { display: block !important; }"

var _scrolls_active_image_html = "<img class='flix_plus_scrolls_shown_button' src='" + chrome.extension.getURL("src/img/right.png") + "' width=24 title='Scrollbars shown; click to remove'>";
var _all_image_html = "<img class='flix_plus_all_shown_button' src='" + chrome.extension.getURL("src/img/down.png") + "' width=24 title='Scrollbars removed; click to add back'>";


// Try to fix Recently Watched.  Might not do desired thing for all users.
try
{
  $(".controlTitle")[0].style["font-size"] = "125%"
} catch (ex)
{
  console.log(ex);
}

fplib.syncGet(KEY_NAME, function(items)
{
  defaults = items[KEY_NAME];
  defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

  fplib.idMrows();

  mrows = document.getElementsByClassName("mrow");
  for (i = 0; i < mrows.length; i++)
  {
    if (mrows[i].classList.contains("characterRow")) // skips over characters on kids page
      continue;

    var id = mrows[i].id;

    // Get relevant info  
    showall_css_code = expand_template.replace(new RegExp("MROWID", 'g'), id);
    scroll_css_code = collapse_template.replace(new RegExp("MROWID", 'g'), id);

    var mrow_name = document.getElementById(mrows[i].id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
      document.getElementById(mrows[i].id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
      .textContent.trim();

    // Update UI now
    var scrollshowall_text = _scrolls_active_image_html;
    if ((mrow_name in defaults) && (defaults[mrow_name] === true))
    {
      extlib.addGlobalStyle(showall_css_code);
      scrollshowall_text = _all_image_html;
      extlib.simulateEvent(document.getElementById(id), "mouseover");
      console.log('simulating mouseover');
    }
    // Add a button
    var scrollshowall_node = document.createElement("a");
    scrollshowall_node.id = id + "_scrollshowall";
    mrows[i].getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].insertBefore(scrollshowall_node, mrows[i].getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].firstChild);
    document.getElementById(id + "_scrollshowall").innerHTML = scrollshowall_text;

    // Create event listener to update based on user interaction
    document.getElementById(id + "_scrollshowall").addEventListener('click', function() {
      var _id = id;
      var _expandCssCode = showall_css_code;
      var _collapseCssCode = scroll_css_code;

      return function()
      {
        var should_expand = (document.getElementById(_id + "_scrollshowall").innerHTML.indexOf("Scrollbars shown") !== -1);
        extlib.addGlobalStyle(should_expand ? _expandCssCode : _collapseCssCode);
        document.getElementById(_id + "_scrollshowall").innerHTML = should_expand ? _all_image_html : _scrolls_active_image_html;

        if (should_expand)
          extlib.simulateEvent(document.getElementById(_id), "mouseover");

        fplib.syncGet(KEY_NAME, function(items)
        {
          defaults = items[KEY_NAME];
          defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

          var mrow_name = document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
            document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
            .textContent.trim();
          defaults[mrow_name] = should_expand;
          //console.log(defaults);
          fplib.syncSet(KEY_NAME, JSON.stringify(defaults), function(items) {
          });
        });
      };
    }(), false)
  }

  fplib.addEmptyVideoAnnotations(); // clean up the DOM

/*
  // Build 'all' buttons at top of page
  var createAddAllButton = function(id, class_name, button_text)
  {
    var button = document.createElement("a");
    button.id = id;
    button.innerHTML = button_text;
    button.className = "extlib_button";
    document.getElementsByClassName("mrows")[0].insertBefore(button, document.getElementById("mrow_id_0")); 
    document.getElementById(id).addEventListener('click', function() {
      var _class_name = class_name;

      return function() 
      {
        var elems = document.getElementsByClassName(_class_name);
        var elems_array = [];
        
        Array.prototype.forEach.call(elems, function(el) {
          elems_array.push(el);
        });
        for (i = 0; i < elems_array.length; i++)
          elems_array[i].click();
      }
    }(), false);
  }

  extlib.initButtonCss();

  createAddAllButton("unscrollall", "flix_plus_scrolls_shown_button", "Remove all scrollbars");
  createAddAllButton("scrollall", "flix_plus_all_shown_button", "Add back all scrollbars");
*/

//  $(window).scroll(function(e){
//    fplib.mouseoverVisiblePosters();
//  });
//  fplib.mouseoverVisiblePosters();
});
