// mylist_importexport userscript for Netflix
// Written by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, extlib.js, fplib.js

// This script allows exporting My List.
// Previous versions of the code would make AJAX requests to import a Netlfix user's My List history (hence, the name)
// but that has been removed.

var addExportListButton = function() {
  if ($(".fp_export_mylist_button").length !== 0)
    return;

  var buttonParent = null;

  if (fplib.isOldMyList()) {
    var headers = $(".listQueueHead");
    if (headers && headers.length) {
      if ($(".listQueueHead br").length === 0)
        headers[0].appendChild(document.createElement("br"));

      buttonParent = headers[0];
    }
  } else {
    var galleryHeaders = [].slice.call($(".galleryHeader"));
    galleryHeaders.forEach(function(galleryHeader) {
      var title = (galleryHeader.getElementsByClassName("title").length ? galleryHeader.getElementsByClassName("title")[0].innerHTML : null);
      if (title === "My List")
        buttonParent = galleryHeader;
    });
  }
  if (buttonParent) {
    buttonParent.appendChild(extlib.createButton("export_mylist", "Export JSON", false, function(e) {
      console.log("export clicked");
      var exportData = fplib.isOldMyList() ? getListOldMyList() : getListNewMyList();
      extlib.saveData(exportData, "mylist_" + fplib.getProfileName() + ".json");
    }));
  }
}

var getListOldMyList = function() {
  var exportData = [];
  [].slice.call($("#queue .qtbl tr")).forEach(function(entry) {
    var obj = {};

    var titleElems = $(".mdpLink", $(entry));
    if (titleElems.length === 0)
      return;

    obj.netflixid = fplib.getMovieIdFromField(titleElems[0].id);
    obj.title = titleElems[0].innerText;
    obj.yourRating = "";
    obj.suggestedRating = "";

    if ($(".fp_notes").length > 0)
      obj.customNote = $(".fp_notes", $(entry))[0].innerText.trim();
      if (obj.customNote === "add note")
        obj.customNote = "";
    else
      obj.customNote = "";

    obj.genre = $(".gn a", ($("tr")[10]))[0].text.trim();

    var ratingElems = $(".stbrMaskFg", $(entry));
    if (ratingElems.length === 0)
      return;

    var rating = null;
    var classNames = ratingElems[0].classList;
    classNames.forEach(function(className) {
      try {
        if (className.indexOf("sbmf-") === 0)
          rating = parseInt(className.substring(className.indexOf("-") + 1)) / 10;
      } catch (ex) {
        console.error(ex);
      }
    });
    if ((classNames.contains("sbmfpr")) && (rating !== null))
      obj.suggestedRating = rating.toString();
    else if (classNames.contains("sbmfrt"))
      obj.yourRating = rating.toString();

    exportData.push(obj);
  });

  return exportData;
};

var getListNewMyList = function() {
  var exportData = [];
  var titles = [].slice.call($(".smallTitleCard"));

  titles.forEach(function(title) {
    exportData.push({
      netflixid: fplib.getMovieIdFromField(title.id),
      title: title.getAttribute('aria-label'),
      yourRating: "",
      suggestedRating: "",
      customNote: "",
      genre: ""
    });
  });

  return exportData;
};


// The arrive is needed for the newer style My List because when a user goes
// to /my-list, there isn't necessary a page reload.
addExportListButton();
document.body.arrive(".galleryHeader", addExportListButton);
