// hide_postplay userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js

var restorePostPlay_ = 0;

// Reset when player is loaded
document.body.arrive("#playerWrapper", function() {
  clearInterval(restorePostPlay_);
  restorePostPlay_ = 0;
});

// requires HTML5 player
document.body.arrive(".player-postplay", function() {
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
});
