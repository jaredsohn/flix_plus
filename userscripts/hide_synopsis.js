// written by jaredsohn-lifehacker

// code relies on jquery, arrive.js

// requires HTML5 player (not Silverlight)
var hideOnPlayer = function()
{
    try
    {
        $(".player-loading-background")[0].style["background-image"] = "";
    } catch (ex)
    {
        console.log("background image wasn't in dom yet");
    }
    document.body.arrive(".player-loading-background", function() {
        this.style.opacity = 0;
    });

    document.body.arrive(".episode-list-image", function() {
        console.log("image found!");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".episode-list-synopsis", function() {
        console.log("synopsis");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".next-episode-image", function() {
        console.log("next episode image found!");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".episode-list-title", function() {
        console.log("next episode desc found!");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".player-next-episode-description", function() {
        console.log("next episode desc found!");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".playback-longpause-container", function() {
        var paragraphs = $(".playback-longpause-container .content p");
        paragraphs[paragraphs.length - 1].classList.add("fp_spoiler");

        var h3s = this.getElementsByTagName("h3");
        h3s[h3s.length - 1].classList.add("fp_spoiler");
    });

    document.body.arrive(".player-postplay-autoplay-still", function() {
        console.log("postplay autoplay still found");
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".player-status", function() {
        var spans = this.getElementsByTagName("span");
        if (spans.length >= 3)
            spans[2].classList.add("fp_spoiler");
    });

    document.body.arrive(".description h2", function() {
        this.innerText = this.innerText.split("“")[0];
    });

    extlib.addGlobalStyle("#fp_blackscreen { display: none };");
    console.log("restoring from black screen");
};

var hideOnMovieDetails = function()
{
    document.body.arrive(".synopsis", function() {
        console.log("synopsis");
        this.classList.add("fp_spoiler");
    });

    var elems = document.getElementsByClassName("synopsis");
    for (i = 0; i < elems.length; i++)
        elems[i].classList.add("fp_spoiler");

    var elems = document.getElementsByClassName("episodeTitle");
    for (i = 0; i < elems.length; i++)
        elems[i].classList.add("fp_spoiler");

    // for 'special' shows like Orange Is The New Black
    var elems2 = document.getElementsByClassName("videoImagery");
    for (i = 0; i < elems2.length; i++)
        elems2[i].classList.add("fp_spoiler");
};

if (location.pathname.indexOf("/WiPlayer") === 0)
    hideOnPlayer();
else if (location.pathname.indexOf("/WiMovie") === 0)
    hideOnMovieDetails();
