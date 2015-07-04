// export_ratings userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery

var exportRatings = function() {
  var rated_data = [];

  var ratingsHistory = document.getElementById("ratingHistorySection");
  var nodes = ratingsHistory.getElementsByTagName("li");
  var elems = Array.prototype.slice.call(nodes);

  elems.forEach(function(elem) {
    rated_data.push({
      netflixid: elem.getAttribute("data-movieid"),
      yourrating: elem.getElementsByClassName("starbar")[0].getAttribute("data-your-rating"),
      titlename: elem.getElementsByClassName("title")[0].getElementsByTagName("a")[0].text,
      ratedate: elem.getElementsByClassName("date")[0].innerHTML
    });
  });

  extlib.saveData(rated_data, "netflix_ratings.json");
};

// Add a button
var header = document.getElementsByClassName("controlBar")[0];
if (($(".controlBar br") || null) !== null)
  header.appendChild(document.createElement("br"));

header.appendChild(extlib.createButton("export_ratings", "Export JSON", false, function(e) {
  var ratingsHistory = document.getElementById("ratingHistorySection");
  var elems = ratingsHistory.getElementsByTagName("li");
  if (elems.length === 100) {
    if (confirm("This only exports ratings that can be found on the page.  Because exactly 100 ratings were found, you probably need to scroll down if you want to export all ratings.\n\nAre you sure you want to export just these 100 ratings?"))
      exportRatings();
  } else {
    exportRatings();
  }
}));
