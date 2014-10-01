// Written by jaredsohn/lifehacker
//////////////////////////////////////////////////////////////////

extlib.addGlobalStyle(".fp_duplicate { display: none; }");

// Mark 'Rate what you've seen' elements so that they do not get hidden as duplicates
$(".mrow-rating .boxShot").each(function() { $(this).attr("data-fp-rate", true);})

// Hide duplicate titles.  Requires fplib.js
var dupe_count = 0;
var already_shown = {};
titles = document.getElementsByClassName("boxShot");
for (i = 0; i < titles.length; i++) {
  if (titles[i].getAttribute("data-fp-rate") === "true")
    continue;

  var movie_id = fplib.getMovieIdFromField(titles[i].id);

  if (typeof(already_shown[movie_id]) === "undefined")
    already_shown[movie_id] = true;
  else
  {
    dupe_count++;
    //titles[i].style.opacity = "0.3";
    titles[i].parentNode.className += " fp_duplicate"; 
  }
}
console.log("Found " + dupe_count + " posters (of " + titles.length + ")");


$(window).scroll(function(e){
  fplib.mouseoverVisiblePosters();
});
fplib.mouseoverVisiblePosters();