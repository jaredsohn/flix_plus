// hide_postplay userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, fplib.js
//
// requires HTML5 player

var restorePostPlay_ = 0;

// Reset when player is loaded or removed
fplib.addMutation("hide_synopsis player - player loaded/unloaded", {element: ".nf-player-container"}, function(summary) {
  clearInterval(restorePostPlay_);
  restorePostPlay_ = 0;
});

fplib.addMutation("hide_synopsis player - postplay episode info", {element: ".WatchNext"}, function(summary) {
  if (summary.added.length) {
    console.log("hiding post play...");
    console.log($(".WatchNext-background-gradient"));
    if (!$(".nf-player-container")[0].classList.contains("ended")) {
      console.log("doesn't contain ended");
      $(".nf-player-container")[0].classList.remove("postplay");
      console.log("removed postplay class");
      console.log($(".nf-player-container")[0].classList);
      $(".WatchNext-background-gradient").remove();
      $(".WatchNext-background").remove();
      $(".WatchNext-footer").hide();
      $(".WatchNext-recommendations").hide();
      $(".WatchNext-recommend-text").hide();
    }

    if (restorePostPlay_ === 0) {
      console.log("waiting for ended...");
      restorePostPlay_ = setInterval(function() {
        if ($(".nf-player-container")[0].classList.contains("ended")) {
          $(".nf-player-container").addClass("WatchNext");
          $(".WatchNext-footer").show();
          $(".WatchNext-recommendations").show();
          $(".WatchNext-recommend-text").show();
          clearInterval(restorePostPlay_);
          restorePostPlay_ = 0;
          console.log("ended");
        }
      }, 1000);
    }
  }
});