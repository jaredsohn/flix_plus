// written by jaredsohn-lifehacker

// code relies on arrive.js

// requires HTML5 player (not Silverlight)
hideOnPlayer = function()
{
    try
    {
        document.getElementsByClassName("player-loading-background")[0].style["background-image"] = "";
    } catch (ex)
    {
        console.log("background image wasn't in dom yet")   
    }
    document.body.arrive(".player-loading-background", function() {
        this.style.display = "none"  
    });

    document.body.arrive(".episode-list-image", function() {
        console.log("image found!");
        this.src = "";
    });

    document.body.arrive(".episode-list-synopsis", function() {
        console.log("synopsis");
        this.innerText = "";
    });

    document.body.arrive(".next-episode-image", function() {
        console.log("next episode image found!");
        this.src = "";
    });

    document.body.arrive(".player-next-episode-description", function() {
        console.log("next episode desc found!");
        this.innerText = "";
    });
        
    document.body.arrive(".playback-longpause-container", function() {
        var paragraphs = $(".playback-longpause-container .content p");
        paragraphs[paragraphs.length - 1].innerText = "";
    });

    extlib.addGlobalStyle("#fp_blackscreen { display: none };")
    console.log("restoring from black screen");
}


hideOnMovieDetails = function()
{
    document.body.arrive(".synopsis", function() {
    	console.log("synopsis");
        this.innerText = "";
    });
    var elems = document.getElementsByClassName("synopsis");
    for (i = 0; i < elems.length; i++)
    {
    	elems[i].innerText = "";
    }
}

if (location.pathname.indexOf("/WiPlayer") === 0)
{
	hideOnPlayer();
} else if (location.pathname.indexOf("/WiMovie") === 0)
{
	console.log("hide_synopsis");
    hideOnMovieDetails();
}