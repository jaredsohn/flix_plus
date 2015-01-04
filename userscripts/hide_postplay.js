// written by jaredsohn-lifehacker

// code relies on arrive.js, jquery

// requires HTML5 player (not Silverlight)
hidePostPlay = function()
{
    document.body.arrive(".player-postplay", function() {
        console.log("hiding post play...");

        $("#netflix-player").removeClass("player-postplay");
        $(".player-postplay")[0].style.display = "none";

        var restorePostPlay = setInterval(function() {
            if ($("#netflix-player")[0].classList.contains("video-ended"))
            {
                $(".player-postplay")[0].style.display = "";
                $("#netflix-player").addClass("player-postplay");
                $(".player-postplay-background-gradient").hide();
                $(".player-postplay-background-image").hide();
                $(".player-postplay-show-metadata").hide();

                clearInterval(restorePostPlay);
            }
        }, 1000);
    });
};

hidePostPlay();
