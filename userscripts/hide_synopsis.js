// written by jaredsohn-lifehacker

// code relies on jquery, arrive.js

function addSpoilerClassToSelectors(selectors)
{
    for (i = 0; i < selectors.length; i++)
    {
        document.body.arrive(selectors[i], function() {
            this.classList.add("fp_spoiler");
        });

        $.each($(selectors[i]), function() { this.classList.add("fp_spoiler") });
    }
}

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

    var selectors = [".episode-list-image", ".episode-list-synopsis", ".next-episode-image", ".episode-list-title", ".player-next-episode-description", ".player-postplay-autoplay-still"];
    addSpoilerClassToSelectors(selectors);

    document.body.arrive(".playback-longpause-container", function() {
        var paragraphs = $(".playback-longpause-container .content p");
        paragraphs[paragraphs.length - 1].classList.add("fp_spoiler");

        var h3s = this.getElementsByTagName("h3");
        h3s[h3s.length - 1].classList.add("fp_spoiler");
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
    var selectors = ["#seasonDetail .synopsis", ".episodeTitle", ".videoImagery", ".videoDetails .title-text", ".videoDetails .synopsis"];
    addSpoilerClassToSelectors(selectors);
};

if (location.pathname.indexOf("/WiPlayer") === 0)
    hideOnPlayer();
else if (location.pathname.indexOf("/WiMovie") === 0)
    hideOnMovieDetails();
