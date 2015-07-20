// hide_postplay userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, fplib.js
//
// requires HTML5 player

var restorePostPlay_ = 0;

// Reset when player is loaded or removed
fplib.addMutation("hide_synopsis player - player loaded/unloaded", {element: "#playerWrapper"}, function(summary) {
  clearInterval(restorePostPlay_);
  restorePostPlay_ = 0;
});

fplib.addMutation("hide_synopsis player - post play episode info", {element: ".player-postplay"}, function(summary) {
  if (summary.added) {
    console.log("hiding post play...");
    if (!$("#netflix-player")[0].classList.contains("video-ended")) {
      $("#netflix-player").removeClass("player-postplay");

      $(".player-postplay-background-gradient").hide();
      $(".player-postplay-background-image").remove();
      $(".player-postplay-footer").hide();
      $(".player-postplay-recommendations").hide();
      $(".player-postplay-recommend-text").hide();
    }

    if (restorePostPlay_ === 0) {
      console.log("waiting for player end...");
      restorePostPlay_ = setInterval(function() {
        if ($("#netflix-player")[0].classList.contains("video-ended")) {
          $("#netflix-player").addClass("player-postplay");
          $(".player-postplay-footer").show();
          $(".player-postplay-recommendations").show();
          $(".player-postplay-recommend-text").show();
          clearInterval(restorePostPlay_);
          restorePostPlay_ = 0;
        }
      }, 1000);
    }
  }
});
