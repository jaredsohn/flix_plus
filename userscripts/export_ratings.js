// export_ratings userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery

var exportRatings = function() {
  var rated_data = [];

  [].slice.call($(".retableRow")).forEach(function(elem) {
    var rating = $(".personal.icon-star", $(elem)).length;
    if ($(".icon-star-50-percent", $(elem)).length) {
      rating += 0.5;
    }

    var id = "0";
    var hrefElems = $(".title a", $(elem));
    if (hrefElems.length) {
      var hrefStr = hrefElems[0].href;
      var matches = hrefStr.match(new RegExp(/\d+/));
      id = matches.length ? matches[0] : 0;
    }

    rated_data.push({
      netflixid: id.toString(),
      yourrating: rating.toString(),
      titlename: elem.getElementsByClassName("title")[0].innerText,
      ratedate: elem.getElementsByClassName("date")[0].innerText
    });
  });

  extlib.saveData(rated_data, "netflix_ratings.json");
};

// Add a button
if ($(".responsive-account-container").length > 0) {
  var header = document.getElementsByClassName("responsive-account-container")[0];
  $(header).prepend(document.createElement("br"));
  $(header).prepend(document.createElement("br"));

  $(header).prepend(extlib.createButton("export_ratings", "Export JSON", false, function(e) {
    var dialogText = "This only exports ratings that can be found on the page.  Because exactly 100 ratings";
    dialogText +=    " were found, you probably need to scroll down if you want to export all ratings.\n\n";
    dialogText +=    "Are you sure you want to export just these 100 ratings?";

    var elems = document.getElementsByClassName("retableRow");
    if ((elems.length !== 100) || confirm(dialogText))
      exportRatings();
  }));
}