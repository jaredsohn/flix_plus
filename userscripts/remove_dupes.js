return; // TODO: reenable this feature later

// remove_dupes userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib.js

var keyPrefix = "flix_plus " + fplib.getProfileName() + " ";

var keysDict = {};
keysDict[keyPrefix + "fp_duplicates_style"] = "hide";
console.log(keysDict);

fplib.syncGet(keysDict, function(items) {
  console.log(items);
  fplib.definePosterCss("fp_duplicate", items[keyPrefix + "fp_duplicates_style"]);
});

var dupeCount = 0;
var alreadyShown = {};
var imgs = $(".lockup .video-artwork");
var imgsLength = imgs.length;
for (var i = 0; i < imgsLength; i++) {
  if (imgs[i].getAttribute("data-fp-ignore") === "true")
    continue;

  var movieId = fplib.getMovieIdFromField(imgs[i].parentNode.parentNode.id);

  if (!alreadyShown.hasOwnProperty(movieId))
    alreadyShown[movieId] = true;
  else {
    dupeCount++;
    imgs[i].parentNode.classList.add("fp_duplicate"); // technically this is parent herex
    imgs[i].parentNode.parentNode.parentNode.classList.add("fp_duplicate_p"); // technically is ggp now
  }
}

/* //TODO: add this back; perhaps have idmrows run earlier and identify the my list row
// Don't mark anything as dupe if it is within My List
var myListImgs = $(".yourListRow .boxShot img");
var len = myListImgs.length;
for (var i = 0; i < len; i++) {
  if (myListImgs[i].classList.contains("fp_duplicate")) {
    myListImgs[i].classList.remove("fp_duplicate");
    myListImgs[i].parentNode.parentNode.classList.remove("fp_duplicate_p");
    dupe_count--;
  }
}*/


console.log("Found " + dupeCount + " duplicate posters (of " + imgs.length + ")");

fplib.idMrows(); // TODO: not all mrows are ided on page load
fplib.rolloverVisibleImages(["fp_duplicate_p"]);
