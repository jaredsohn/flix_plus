// written by jaredsohn-lifehacker

// code relies on arrive.js

// requires HTML5 player (not Silverlight)
hidePostPlay = function()
{
    document.body.arrive(".player-postplay", function() {
        console.log("hiding post play2...");

        $("#netflix-player").removeClass("player-postplay");
        $(".player-postplay")[0].style.display = "none";
    });
}

hidePostPlay();