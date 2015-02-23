//jaredsohn/lifehacker: source = https://github.com/ayan4m1/random-flix/blob/master/src/main.js

// ==UserScript==
// @name        random-flix
// @namespace   http://thekreml.in
// @version     0.2
// @grant       none
// @description Add a 'Random Episode' button to Netflix Watch Instantly pages.
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
// @match       http://movies.netflix.com/WiMovie/*
// ==/UserScript==

var random_in_progress_ = false;
var auto_random_mode_ = false;

if (location.pathname.indexOf("/WiPlayer") === 0)
{
    // TODO-BONUS: have it not repeat episodes and maybe also not show episodes already watched.  also maybe have it start new episode from beginning

    var playRandomFromPlayer = function()
    {
        if (random_in_progress_)
            return;

        random_in_progress_ = true;
        //auto_random_mode_ = true; // functionality disabled for now.  Still need: lots more testing, disable if user configured to not automatically play another episode, integrate with random ep on wimovie, have it start episodes from beginning

        // TODO: update localstorage so that future episodes are also random.  also set this from wimovie page.
        var seasonElems = $(".season");
        var episodeCount = 0;
        var seasonEpisodeCounts = [];
        for (i = 0; i < seasonElems.length; i++)
        {
            seasonElems[i].click();
            var count = $(".episode-list-item-header").length;
            episodeCount += count;
            seasonEpisodeCounts.push(count);
        }
        if (episodeCount <= 1)
            return;
        var rnd = Math.floor(Math.random() * episodeCount);
        for (i = 0; i < seasonElems.length; i++)
        {
            if (rnd >= seasonEpisodeCounts[i])
            {
                rnd = rnd - seasonEpisodeCounts[i];
            } else
               {
                console.log(i);
                console.log(rnd);
                seasonElems[i].click();
                setTimeout(function() { // we wait until we can assume the episode list has loaded
                    try
                    {
                        ($(".episode-list-title")[rnd]).click();
                        ($(".episode-list-title")[rnd]).click(); // requires clicking twice for some reason
                    } catch (ex)
                    {
                    }
                    random_in_progress_ = false;

                }, 1500);
                break;
            }
        }
    };

    // Support to WiPlayer added for Flix Plus by Lifehacker
    var elem = document.createElement('div');
    elem.id = "fp_random_episode";
    document.body.appendChild(elem);
    $(elem).on('click', function() {
        playRandomFromPlayer();
    });

    document.body.arrive(".player-postplay", function() {
        var autoRandom = setInterval(function() {
            if (auto_random_mode_)
            {
                if ($("#netflix-player")[0].classList.contains("video-ended"))
                {
                    clearInterval(auto_random_mode_);
                    playRandomFromPlayer();
                }
            }
        }, 1000);
    });
}
else if (location.pathname.indexOf("/WiMovie") === 0)
{
    jQuery(function($) {
        // define a list of page types that we want to match on / insert into
        var handlers = [
            {
                'selector': '.episodeList li',
                'insert': function() {
                    var elem = $('<span id ="random_button" class="mltBtn" style="float:right"><a class="svf-button svfb-silver evo-btn svf-button-inq"><span class="inr">Random Episode</span></a></span>');
                    elem.on('click', function() {

                        var seasonElems = $('#seasonsNav .seasonItem');
                        var seasonEpisodeCounts = [];
                        var episodeCount = 0;
                        for (i = 0; i < seasonElems.length; i++)
                        {
                            seasonElems[i].click();
                            var count = $('.episodeList li').length;
                            episodeCount += count;
                            seasonEpisodeCounts.push(count);
                        }
                        var rnd = Math.floor(Math.random() * episodeCount);
                        console.log(rnd);
                        for (i = 0; i < seasonElems.length; i++)
                        {
                            if (rnd >= seasonEpisodeCounts[i])
                            {
                                rnd = rnd - seasonEpisodeCounts[i];
                            } else
                            {
                                console.log(i);
                                console.log(rnd);
                                seasonElems[i].click();
                                setTimeout(function() {
                                    $('.episodeList li')[rnd].click();
                                }, 1000);
                                /*$("#random_title")[0].href = "#";
                                $("#random_title")[0].innerHTML = "(Rolling the dice...)";
                                setTimeout(function() {
                                    $("#random_title")[0].innerHTML = $('.episodeList li')[rnd].getElementsByClassName("episodeTitle")[0].innerText;
                                    $("#random_title")[0].href = $('.episodeList li')[rnd].getElementsByClassName("playBtn")[0].getElementsByTagName("a")[0].href;
                                    if ($(".current").length > 0)
                                        $(".current")[0].classList.remove("current");
                                    ($('.episodeList li')[rnd]).classList.add("current");
                                }, 2000); */
                                break;
                            }
                        }
                    });
                    $('#seasonSelector, .episodeHeading').after(elem);
    //                var titleElem = $('<div>&nbsp;&nbsp;&nbsp;Random episode: <a href="#" id="random_title"></a></div>');
    //                $(elem).after(titleElem);
                }
            },
            { // Orange is the New Black and other 'special' pages
                'selector': ".episodesContent .videoRow",
                'insert': function() {
                    var elem = $('<span class="mltBtn" style="position:relative;top:35px;float:right"><a class="svf-button svfb-black evo-btn svf-button-inq"><span class="inr">Random Episode</span></a></span>');
                    elem.on('click', function() {
                        var idx = Math.floor(Math.random() * $(".episodesContent .videoRow").length);
                        ($('.episodesContent .videoRow')[idx]).click();
                    });
                    $('.video-controls').css('height', '70px');
                    $('.video-controls .video-tabs').after(elem);
                },
                'buttonHtml': '<div class="write-btn-wrap"><div class="dp-btn-wrap"><a class="dp-btn">Random Episode</a></div></div>'
            }
        ];

        // search the page for each handler and insert if applicable
        $.each(handlers, function(i, v) {
            if ($(v.selector).length > 0) {
                v.insert();
            }
        });
    });
}
