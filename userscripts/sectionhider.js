// section_hider userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib.js, extlib.js, some images
//
// Derived from Flix Plus customizations made to Scrollbuster, but with different behavior
// (hides/shows sections instead of removing/adding scrollbars)

return; //TODO (disabled for now)


var KEY_NAME = "flix_plus " + fplib.getProfileName() + " sectionhider";

var show_template = "#MROWID .bd { display:block }";
var hide_template = "#MROWID .bd { display:none }";

var hideImageHtml_ = "<img class='flix_plus_hiddensectionbutton' src='" + chrome.extension.getURL("src/img/hide.png") + "' width=24 title='Section hidden; click to show.'>";
var showImageHtml_ = "<img class='flix_plus_shownsectionbutton' src='" + chrome.extension.getURL("src/img/show.png") + "' width=24 title='Section shown; click to hide.'>";

fplib.syncGet(KEY_NAME, function(items) {
  defaults = items[KEY_NAME];
  defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

  fplib.idMrows();

  mrows = $(".mrow, .lolomoRow");
  for (var i = 0; i < mrows.length; i++) {
    if (mrows[i].classList.contains("characterRow")) // skips over characters on kids page
        continue;

    var id = mrows[i].id;

    // Get relevant info
    showCssCode = showTemplate.replace(new RegExp("MROWID", 'g'), id);
    hideCssCode = hideTemplate.replace(new RegExp("MROWID", 'g'), id);

    var mrowName = mrows[i].getElementsByClassName("rowTitle")[0].innerHTML.trim();

    //TODO_broke_old
    //var mrow_name = document.getElementById(id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
    //    document.getElementById(id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
    //    .textContent.trim();

    // Update UI now
    var showHideText = showImageHtml_;
    if ((mrowName in defaults) && (defaults[mrowName] === true)) {
      extlib.addGlobalStyle(hideCssCode);
    }

    // Add a button
    var showHideNode = document.createElement("a");
    showHideNode.id = id + "_showhide";
    //TODO_broke_old (see github for old code here)
    mrows[i].insertBefore(showHideNode, mrows[i].getElementsByClassName("rowTitle")[0]);
    document.getElementById(id + "_showhide").innerHTML = showHideText;

    // Create event listener to update based on user interaction
    document.getElementById(id + "_showhide").addEventListener('click', function() {
      var id_ = id;
      var showCssCode_ = showCssCode;
      var hideCssCode_ = hideCssCode;

      return function() { // Toggles show/hide and saves to localstorage
        var shouldHide = (document.getElementById(id_ + "_showhide").innerHTML.indexOf("click to hide") !== -1);
        extlib.addGlobalStyle(shouldHide ? hideCssCode_ : showCssCode_);
        document.getElementById(id_ + "_showhide").innerHTML = shouldHide ? hideImageHtml_ : showImageHtml_;

        fplib.syncGet(KEY_NAME, function(items) {
          defaults = items[KEY_NAME];
          defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

          var mrowName = document.getElementById(id_).getElementsByClassName("rowTitle")[0].innerHTML.trim();

          //TODO_BROKE_OLD var mrow_name = document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
          //    document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
          //    .textContent.trim();
          defaults[mrowName] = shouldHide;
          fplib.syncSet(KEY_NAME, JSON.stringify(defaults), function(items) {
          });
        });
      };
    }(), false);
  }
});
