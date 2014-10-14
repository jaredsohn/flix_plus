// remove_dupes
// 
// Written by jaredsohn/lifehacker
//
// Hide duplicate titles.  Requires fplib.js
//////////////////////////////////////////////////////////////////

extlib.addGlobalStyle(".fp_duplicate { display: none !important; }");

// Mark 'Rate what you've seen' and 'because you like' elements so that they do not get hidden as duplicates
$(".mrow-rating .boxShot").each(function() { $(this).attr("data-fp-ignore", true);})
$(".supportVideos .boxShot").each(function() { $(this).attr("data-fp-ignore", true);})

var dupe_count = 0;
var already_shown = {};
titles = document.getElementsByClassName("boxShot");
for (i = 0; i < titles.length; i++) {
  if (titles[i].getAttribute("data-fp-ignore") === "true")
    continue;

  var movie_id = fplib.getMovieIdFromField(titles[i].id);

  if (typeof(already_shown[movie_id]) === "undefined")
    already_shown[movie_id] = true;
  else
  {
    dupe_count++;
    titles[i].parentNode.className += " fp_duplicate"; 
  }
}
console.log("Found " + dupe_count + " posters (of " + titles.length + ")");

fplib.idMrows();
fplib.rolloverVisibleImages(["fp_duplicate"]);