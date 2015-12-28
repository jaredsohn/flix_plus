// mylist_importexport userscript for Netflix
// Written by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, mutation-summary.js, extlib.js, fplib.js

// This script allows exporting My List.
// Previous versions of the code would make AJAX requests to import a Netlfix user's My List history (hence, the name)
// but that has been removed.

var addExportListButton = function() {
  if ($(".fp_export_mylist_button").length !== 0)
    return;

  var buttonParent = null;

  if (fplib.isOldMyList()) {
    var headers = $(".galleryHeader .title");
    if (headers && headers.length) {
      buttonParent = headers[0];
    }
  } else if (fplib.isNewMyList()) {
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
  [].slice.call($(".rowListItem")).forEach(function(entry) {
    var obj = {};

    var titleElems = $(".title", $(entry));
    if (titleElems.length === 0)
      return;

    obj.netflixid = fplib.getMovieIdFromReactId(titleElems[0].getAttribute("data-reactid"));
    obj.title = titleElems[0].innerText;
    obj.genre = ""; // no longer available
    obj.year = $(".year", $(entry))[0].innerHTML;
    obj.maturity = $(".maturity-number", $(entry))[0].innerHTML;
    obj.duration = $(".duration span", $(entry))[0].innerHTML;

    obj.customNote = "";
    if ($(".fp_notes", $(entry)).length > 0) {
      var temp = $(".fp_notes", $(entry))[0].innerText.trim();
      if (temp !== "add note")
        obj.customNote = temp;
    }

    var rating = "";
    var ratings = $("span.default, span.personal", $(entry));
    var halfStars = $(".icon-star-50-percent", $(entry)[0]);
    var quarterStars = $(".icon-star-25-percent", $(entry)[0]);
    var threeQuarterStars = $(".icon-star-75-percent", $(entry)[0]);
    var ratingIsPersonal = false;
    if (halfStars.length) {
      rating = parseInt(halfStars[0].getAttribute("data-rating")) - 1 + 0.5;
      ratingIsPersonal = halfStars[0].classList.contains("personal");
    } else if (quarterStars.length) {
      rating = parseInt(quarterStars[0].getAttribute("data-rating")) - 1 + 0.25;
      ratingIsPersonal = quarterStars[0].classList.contains("personal");
    } else if (threeQuarterStars.length) {
      rating = parseInt(threeQuarterStars[0].getAttribute("data-rating")) - 1 + 0.75;
      ratingIsPersonal = threeQuarterStars[0].classList.contains("personal");
    } else {
      rating = 0;
      [].slice.apply(ratings).forEach(function(ratingElem) {
        var temp = parseInt(ratingElem.getAttribute("data-rating"));
        rating = Math.max(rating, temp);
        ratingIsPersonal = ratingElem.classList.contains("personal");
      });
    }
    obj.yourRating = ratingIsPersonal ? rating.toString() : "";
    obj.suggestedRating = !ratingIsPersonal ? rating.toString() : "";

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
      genre: "",
      maturity: "",
      duration: "",
      year: ""
    });
  });

  return exportData;
};

// The mutation observer is needed for the newer style My List because when a user goes
// to /my-list, there isn't necessary a page reload.
fplib.addMutationAndNow("add Export List button", {"element": ".galleryHeader" }, function(summary) {
  if (summary.added.length) {
    console.log("addexportlistbutton");
    addExportListButton();
  }
});

