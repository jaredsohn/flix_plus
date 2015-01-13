// written by jaredsohn-lifehacker

// code relies on jquery, arrive.js

// requires HTML5 (not Silverlight) player
var hideOnPlayer = function()
{
    try
    {
        if ($(".player-loading-background").length)
            $(".player-loading-background")[0].style["background-image"] = "";
    } catch (ex)
    {
        console.log("background image wasn't in dom yet");
    }
    document.body.arrive(".player-loading-background", function() {
        this.style.opacity = 0;
    });

    document.body.arrive(".episode-list-image", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".episode-list-synopsis", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".next-episode-image", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".episode-list-title", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".player-next-episode-description", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".playback-longpause-container", function() {
        var paragraphs = $(".playback-longpause-container .content p");
        paragraphs[paragraphs.length - 1].classList.add("fp_spoiler");

        var h3s = this.getElementsByTagName("h3");
        h3s[h3s.length - 1].classList.add("fp_spoiler");
    });

    document.body.arrive(".player-postplay-autoplay-still", function() {
        this.classList.add("fp_spoiler");
    });

    document.body.arrive(".player-status", function() {
        var spans = this.getElementsByTagName("span");
        if (spans.length >= 3)
            spans[2].classList.add("fp_spoiler");
    });

    var elems = $(".description h2");
    if (elems.length)
        elems[0].innerText = elems[0].innerText.split("“")[0];

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
    $.each($("#seasonDetail .synopsis"), function() { this.classList.add("fp_spoiler") });

    $.each($(".episodeTitle"), function() { this.classList.add("fp_spoiler") });

    // Used by 'special' shows like Orange is the New Black
    $.each($(".videoImagery"), function() { this.classList.add("fp_spoiler") });
    $.each($(".videoDetails .title-text"), function() {this.classList.add("fp_spoiler"); });
    $.each($(".videoDetails .synopsis"), function() {this.classList.add("fp_spoiler"); });
};

if (location.pathname.indexOf("/WiPlayer") === 0)
    hideOnPlayer();
else if (location.pathname.indexOf("/WiMovie") === 0)
    hideOnMovieDetails();
