// random_ep userscript for Netflix
// Code was originally from https://github.com/michaelschade/netflix-trailers
// Updated by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib

// YouTube URL for trailer
var trailerURL = function(movieName) {
  return 'https://youtube.com/results?search_query=' + encodeURIComponent(movieName + ' trailer');
};

var createTrailerElem = function(movieName, id) {
  var elem = document.createElement("a");
  elem.className = "fp_preview_link fp_button";
  elem.href = trailerURL(movieName);
  elem.innerHTML = "<img alt='Watch trailer' width=96px src='" + chrome.extension.getURL('../src/img/trailer.png') + "'>";
  elem.target = '_blank';
  elem.style.cssText = "display:inline-block;";
  elem.id = id;
  elem.title = "Watch trailer";
  elem.classList.add("overviewPlay");

  return elem;
};

var createPreviewLink = function(overviewInfoElem) {
//  console.log("createPreviewLink");
//  console.log(overviewInfoElem);

  var jawBoneContainerElems = $(overviewInfoElem).closest(".jawBoneContainer");

  if (jawBoneContainerElems.length === 0)
    return;
  if (jawBoneContainerElems[0].getElementsByClassName("fp_preview_link").length !== 0)
    return;
  if (jawBoneContainerElems[0].getElementsByClassName("title").length === 0)
    return;

  var movieName = fplib.parseTitle(jawBoneContainerElems[0]);
  var previewElem = createTrailerElem(movieName, 'trailer-detail');

  var infoElems = jawBoneContainerElems[0].getElementsByClassName("overviewPlay");
  if (infoElems.length) {
//    console.log("adding!");
    $(infoElems[0]).after(previewElem);
    infoElems[0].id = "fp_overviewPlay_" + infoElems[0].parentNode.id; // Name this so we can identify it when removed
  }
};

$(".jawbone-overview-info").each(function() {
  createPreviewLink(this);
});
document.body.arrive(".overviewPlay.playLink", function() {
  createPreviewLink(this);
});


var removePreviewLinks = function(elem) {
  var previewLinks = elem.getElementsByClassName("fp_preview_link");
  [].slice.call(previewLinks).forEach(function(previewLink) {
    console.log("removing!");
    previewLink.parentNode.removeChild(previewLink);
  });
};

// Remove preview links when users click on menu buttons
// We create event listeners on the menu buttons instead of using leave() because otherwise an
// exception occurs when trying to show the panel again later.
var addMenuListener = function(elem) {
  if (elem.classList.contains("Overview"))
    return;

  console.log("adding listener to ");
  console.log(elem);

  var self = $(elem).closest(".jawBoneContainer");

  elem.addEventListener("click", function() {
    console.log("clicked!");
//    console.log(self);
    removePreviewLinks($(self)[0]);
    var count = 0;
    var removeInterval = setInterval(function() {
      removePreviewLinks($(self)[0]);
      count++;
      if (count > 10) {
        console.log('clearing interval');
        clearInterval(removeInterval);
      }
    }, 25);
  });
};

console.log("~!~");
document.body.arrive(".jawBone .menu li", function() {
  addMenuListener(this);
});
var menuLis = $(".jawBone .menu li");
if (menuLis.length) {
  [].slice.call(menuLis).forEach(function(menuLi) {
    addMenuListener(menuLi);
  });
}

extlib.addGlobalStyle(".overviewPlay { margin-right: -55px }");


