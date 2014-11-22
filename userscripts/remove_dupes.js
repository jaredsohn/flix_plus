// remove_dupes
// 
// Written by jaredsohn/lifehacker
//
// Hide duplicate titles.  Requires fplib.js
//////////////////////////////////////////////////////////////////

var key_prefix = "flix_plus " + fplib.getProfileName() + " ";

var keys_dict = {};
keys_dict[key_prefix + " fpduplicate_style"] = "hide";

fplib.syncGet(keys_dict, function(items)
{
  fplib.define_poster_css("fp_duplicate", items[key_prefix + " fpduplicate_style"]);
});

// Mark 'Rate what you've seen' and 'because you like' elements so that they do not get hidden as duplicates
$(".mrow-rating .boxShot img").each(function() { $(this).attr("data-fp-ignore", true);})
$(".supportVideos .boxShot img").each(function() { $(this).attr("data-fp-ignore", true);})
$(".recentlyWatched .boxShot img").each(function() { $(this).attr("data-fp-ignore", true);})

var dupe_count = 0;
var already_shown = {};
var imgs = $(".boxShot img");
for (i = 0; i < imgs.length; i++) {
  if (imgs[i].getAttribute("data-fp-ignore") === "true")
    continue;

  var movie_id = fplib.getMovieIdFromField(imgs[i].parentNode.id);

  if (typeof(already_shown[movie_id]) === "undefined")
    already_shown[movie_id] = true;
  else
  {
    dupe_count++;
    imgs[i].className += " fp_duplicate";
    imgs[i].parentNode.parentNode.className += " fp_duplicate_gp"; 
  }
}
console.log("Found " + dupe_count + " posters (of " + imgs.length + ")");

fplib.idMrows();
fplib.rolloverVisibleImages(["fp_duplicate_gp"]);