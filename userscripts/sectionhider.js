// section_hider userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, mutation-summary.js, fplib.js, extlib.js, some images
//
// Derived from Flix Plus customizations made to Scrollbuster, but with different behavior
// (hides/shows sections instead of removing/adding scrollbars)

"use strict";

var KEY_NAME = "flix_plus " + fplib.getProfileName() + " sectionhider";

var showTemplate_ = "#MROWID { display:block !important }";
var hideTemplate_ = "#MROWID { display:none !important }";

var shownImageHtml_ = "<img class='flix_plus_shownsectionbutton' src='" + chrome.extension.getURL("src/img/hide.png") + "' width=24 title='Section shown; click to hide.'>";
var hiddenImageHtml_ = "<img class='flix_plus_hiddensectionbutton' src='" + chrome.extension.getURL("src/img/show.png") + "' width=24 title='Section hidden; click to show.'>";

var removeRowTitleMarginLeft_ = ".rowTitle { margin-left: 0 !important }";
var addRowHeaderMarginLeft_ = ".rowHeader { margin-left: 49.156px !important }";

var defaults_ = {};

extlib.addGlobalStyle(removeRowTitleMarginLeft_);
extlib.addGlobalStyle(addRowHeaderMarginLeft_);

var addSectionButton = function(mrow) {
  try {
    if (mrow.classList.contains("characterRow")) // skips over characters on kids page
      return false;
    if (mrow.classList.contains("lolomoPreview")) // doesn't have full content; ignore it
      return false;

    var $mrow = $(mrow);
    var $rowContainer = $(".rowContainer", $mrow);

    var id = $rowContainer[0].id;
    var parts = id.split('_');
    var rowContainerId = parts[parts.length - 1];

    // Get relevant info
    showCssCode = showTemplate_.replace(new RegExp("MROWID", 'g'), rowContainerId);
    hideCssCode = hideTemplate_.replace(new RegExp("MROWID", 'g'), rowContainerId);

    var mrowName = "";
    var $spans = $(".rowTitle .row-header-title", $mrow);
    if ($spans)
      mrowName = $spans[0].innerHTML.trim();
    else {
      console.log("rowTitle not found");
      return false;
    }

    // Update UI now
    var showHideText = shownImageHtml_;
    if ((mrowName in defaults_) && (defaults_[mrowName] === true)) {
      extlib.addGlobalStyle(hideCssCode);
      showHideText = hiddenImageHtml_;
    } else {
      extlib.addGlobalStyle(showCssCode);
    }

    // Add a button
    var showHideNode = document.createElement("a");
    showHideNode.id = "fp_section_toggle_" + id;
    showHideNode.classList.add("fp_section_toggle");
    showHideNode.innerHTML = showHideText;

    var $rowHeader = $(".rowHeader", $mrow);
    var $rowTitle = $(".rowTitle", $mrow);

    $rowHeader[0].insertBefore(showHideNode, $rowTitle[0]);

    // Create event listener to update based on user interaction
    document.getElementById("fp_section_toggle_" + id).addEventListener('click', function() {
      var id_ = id;
      var rowContainerId_ = rowContainerId;
      var mrowName_ = mrowName;

      return function() { // Toggles show/hide and saves to localstorage
        var shouldHide = (document.getElementById("fp_section_toggle_" + id_).innerHTML.indexOf("click to hide") !== -1);
        var template = shouldHide ? hideTemplate_ : showTemplate_;
        extlib.addGlobalStyle(template.replace("MROWID", rowContainerId));
        document.getElementById("fp_section_toggle_" + id_).innerHTML = shouldHide ? hiddenImageHtml_ : shownImageHtml_;

        fplib.syncGet(KEY_NAME, function(items) {
          var defaults = JSON.parse(items[KEY_NAME] || "{}");
          defaults[mrowName_] = shouldHide;
          defaults_[mrowName_] = shouldHide; // update in memory, too
          fplib.syncSet(KEY_NAME, JSON.stringify(defaults));
        });
      }();
    });
  } catch (ex) {
    console.error(ex);
    return false;
  }
  return true;
}

fplib.syncGet(KEY_NAME, function(items) {
  defaults_ = JSON.parse(items[KEY_NAME] || "{}");
//  console.log("defaults:");
//  console.log(defaults_);

  fplib.addMutationAndNow("sectionHider lolomorow", {element: ".lolomoRow"}, function(summary) {
    summary.added.forEach(function(added) {
      addSectionButton(added);
    });
  });
}); //syncGet
