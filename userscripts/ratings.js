// Original source: https://github.com/joshblum/netflix-rate-chrome-ext/blob/master/js/ratings.js
// Heavily modified by jaredsohn-lifehacker to: 
//
//  1. prevent displaying wrong rating by comparing title/year with ui before updating
//  2. make sure that movies are matched with movies and tv series are matched with series.
//  3. Simplify titles to do a better job of matching
//  4. A new 'long' matching algorithm that does some searching and then does more careful comparison against each result
//  5. removing support for DVD and old-style (pre-Fall 2014) search
//  6. warn about lack of https support
//  7. indicate when still searching for matches
//  8. indicate if no match is found

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old MyList.")
    return;
}

document.arrive(".bobMovieContent", function()
{
    $(".bobMovieContent").height(250); // jaredsohn-lifehacker: Added to make room for ratings buttons (after recommend button was added)
    $(".bobMovieContent").width(325);  // Sometimes the code below wouldn't fit within the popup; make it bigger to accomodate it
    $("#BobMovie-content").width(347); // Match the width
    $(".bobMovieHeader").width(329);   // Match the width

    clearOld(null);

    if (window.location.protocol === "https:")
    {
        $(".midBob").append("<br>No https support for Rotten Tomatoes / IMDB ratings.");
    } else
    {
        console.log("arrive");
        var ui_data = get_ui_data();
        var args = getArgs();

        getRating(ui_data, function(movie_info) {
            console.log(movie_info);
            clearOld(args);

            if ((movie_info.nodata === true) || (!info_match_ui(movie_info)))
                $(".midBob").append("<br>Rotten Tomatoes / IMDB ratings not found.");
            else
                displayRating(movie_info, args);
        });
    }
});

if (window.location.protocol === "https:")
{
    consolelog(-1,"Rotten Tomatoes/IMDB ratings not supported for https; load this page using http for ratings.")
    return;
}

var key_name = "flix_plus " + fplib.getProfileName() + " ratings2";
var IMDB_API =  "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/alias?type=imdbid&s=";
var IMDB_LINK = "http://www.imdb.com/title/";

//popup movie selectors
var HOVER_SEL = {
        '.bobbable .popLink' : parseTitle, //wi main display movies
    };

var CACHE = localStorage[key_name]; // storing all settings into a single local Storage key (Jared Sohn/Lifehacker)
if (typeof(CACHE) === "undefined")
    CACHE = {};
else
    CACHE = JSON.parse(CACHE);

var CACHE_LIFE = 1000*60*60*24*7*2; //two weeks in milliseconds

/////////// HELPERS /////////////
/*
    Builds a select object where the selector is used to insert the ratings via the given insertFunc. imdb and rt classes are extra classes that can be added to a rating.
*/
function selectObj(selector, insertFunc, imdbClass, rtClass){
    imdbClass = imdbClass || '';
    rtClass = rtClass || '';
    return {
        'selector' : selector,
        'insertFunc' : insertFunc,
        'imdbClass' : imdbClass,
        'rtClass' : rtClass,
        }
}

/*
    Add the style sheet to the main netflix page.
*/
function addStyle() {
    if (!$('#rating-overlay').length){
        var url = chrome.extension.getURL('../src/css/ratings.css');
        $("head").append("<link id='rating-overlay' href='" + url + "' type='text/css' rel='stylesheet' />");
    }
}

var parse_movie_info = function(omdb_json)
{
    if ((omdb_json === null) || (omdb_json["Response"] === "False"))
        return null;
    if ((omdb_json["Type"] === "episode") || (omdb_json["Type"] === "game") || (omdb_json["Type"] === "N/A"))
        return null;

    var info = {};
    info.title = omdb_json["Title"] || null;
    info.year = omdb_json["Year"] || null;
    info.imdbID = omdb_json["imdbID"] || null;
    info.imdbScore = parseFloat(omdb_json["imdbRating"]);
    info.tomatoMeter = getTomatoScore(omdb_json, "tomatoMeter");
    info.tomatoUserMeter = getTomatoScore(omdb_json, "tomatoUserMeter");
    info.date = new Date().getTime();
    info.type = omdb_json["Type"];
    info.roles = {};
    info.roles["actors"] = omdb_json["Actors"];
    info.roles["directors"] = omdb_json["Director"];
    info.roles["creators"] = omdb_json["Creator"];
    info.rated = omdb_json["Rated"];
    info.nodata = false;

    return info;
}

function get_ui_data() {
    var ui_data = {};
    ui_data["title"] = parseTitle();
    ui_data["year"] = parseYear();
    ui_data["roles"] = parseRoles();
    ui_data["type"] = parseType();

    return ui_data;
}

/*
    Get the arguments for showRating based on which popup is being overridden
*/
function getArgs() {
    var url = document.location.href;

    key = 'www.netflix.com';
    var dict = POPUP_INS_SEL[key];
    if (url.indexOf('Queue') != -1) {
        args = dict.Queue;
        args.key = 'Queue';
    } else {
        args = dict.Wi;
        args.key = 'Wi';
    }

    return args
}


/*
    Add item to the cache
*/
function addCache(ui_data, movie_info) {
    if (movie_info === null) // We don't cache when the movie wasn't found
        return null;

    var compact_movie_info = {};
    var fields = ["title", "year", "type", "date", "imdbID", "imdbScore", "tomatoMeter", "tomatoUserMeter", "metaScore", "nodata"];
    var len = fields.length;
    for (i = 0; i < len; i++)
        compact_movie_info[fields[i]] = movie_info[fields[i]];

    var key = ui_data["title"] + "_" + ui_data["year"] + "_" + ui_data["type"];

    CACHE[key] = compact_movie_info;
    localStorage[key_name] = JSON.stringify(CACHE);

    return movie_info;
}

function checkCache(title, year, type) {
    var key = title + "_" + year + "_" + type;
    console.log("checking cache");
    console.log(title + " - " + year + " - " + type);

    if(!(key in CACHE))
        return null;

    console.log("is in cache");
    console.log("cached entry: ");
    console.log(((new Date().getTime() - CACHE[key].date) <= CACHE_LIFE) ? CACHE[key] : null);

    // Return cached value if not expired
    return ((new Date().getTime() - CACHE[key].date) <= CACHE_LIFE) ? CACHE[key] : null;
}

/*
    Clear old ratings and unused content. Differs for different popups
*/
function clearOld(args){
    var $target = $('#BobMovie');
    if ((args === null) || (args.key in POPUP_INS_SEL['www.netflix.com'])){ // was movies (jaredsohn/lifehacker)
        $target.find('.label').contents().remove();
    }
    $target.find('.rating-link').remove();
    $target.find('.ratingPredictor').remove();

    // Fix alignment issues by removing stbrLeftAlign class (added by jaredsohn/Lifehacker so rotten/imdb ratings appear on same line as user star ratings)
    var elems = document.getElementsByClassName("bobMovieRatings")[0].getElementsByClassName("stbrLeftAlign");
    for (i = 0; i < elems.length; i++)
    {
        elems[i].className = elems[i].className.replace(new RegExp(" ?\\b"+"stbrLeftAlign"+"\\b"),'')
    }
}

function getTomatoClass(score) {
    return score < 59 ? 'rotten' : 'fresh';
}


///////////////// URL BUILDERS ////////////////

/*
    Builds and returns the imdbAPI url
*/
function getIMDBAPI(title, year) {
    var url = IMDB_API + '&t=' + title.trim();
    if (year !== null) {
        url += '&y=' + year;
    }
    console.log("query url: " + url);
    return url
}

function getSearchIMDBAPI(title) {
    var url = IMDB_API + '&s=' + title.trim();
    console.log("search query url: " + url);
    return url;
}

function getForIdIMDBAPI(id) {
    return IMDB_API + '&i=' + id.trim();
}

/*
    Build the url for the imdbLink
*/
function getIMDBLink(title) {
    return IMDB_LINK + title.trim()
}

/*
    Build the url for the rtLink
*/
function getTomatoLink(imdbID) {
    imdbID = imdbID.slice(2) //convert tt123456 -> 123456
    return TOMATO_LINK + imdbID
}


///////////////// UI PARSERS ////////////////
// These parse from the popup.

function parseTitle() {
    return $(".bobMovieHeader .title")[0].innerText.trim();
}

// Assumes only tv series or movie
function parseType($target) {
    var $target = $('#BobMovie .duration');
    if (($target.text().indexOf("Season") !== -1) || ($target.text().indexOf("Series") !== -1) || ($target.text().indexOf("Episode") !== -1) || ($target.text().indexOf("Part") !== -1) || ($target.text().indexOf("Volume") !== -1) || ($target.text().indexOf("Collection") !== -1) )
        return "series";
    else
        return "movie";
}

function parseYear($target) {
    var $target = $target || $('#BobMovie .year');
    var year = null;
    if ($target.length) {
        year = $target.text().split('-')[0];
    }
    return year
}

function parseRoles($target) {
    var roles = {};
    roles["actors"] = {};
    roles["directors"] = {};
    roles["creators"] = {};

    try
    {
        var dts = $(".info dl dt", $target);
        var dds = $(".info dl dd", $target);

        var len = dts.length;

        for (i = 0; i < len; i++)
        {
            var elems = $("a", dds[i]);
            if (dts[i].innerText.trim() === "Starring:")
            {
                var len2 = elems.length;
                for (j = 0; j < len2; j++)
                    roles["actors"][elems[j].innerText.trim()] = true;
            } else if (dts[i].innerText.trim() === "Director:")
            {
                var len2 = elems.length;
                for (j = 0; j < len2; j++)
                    roles["directors"][elems[j].innerText.trim()] = true;
            } else if (dts[i].innerText.trim() === "Creator:")
            {
                var len2 = elems.length;
                for (j = 0; j < len2; j++)
                    roles["creators"][elems[j].innerText.trim()] = true;
            }
        }
    }
    catch (ex)
    {
        console.log(ex);
    }
    return roles;
}

///////////////// AJAX ////////////////


function score_movie_info(ui_data, movie_info)
{
    var scores = {};
    // for title, increase based on how many characters are missing/not missing
    // for year, get abs value between years
    // for roles, subtract 1 for every actor in ui_data found in request_data
    // also create a string that indicates why we think this might be a match
    return scores;
}

function get_movie_info(url, callback)
{
    var movie_info = {};

    // TODO: check cache first (maybe just store json based on the url?)

    $.get(url, function(res) 
    {
        try {
            var omdb_json = JSON.parse(res);
            movie_info = parse_movie_info(omdb_json);
        } catch(e) {
            console.log(e);
        }
        callback(movie_info);
    });
}

function get_all_movie_infos(title, callback)
{
    async.parallel(
        [
            function(callback2) {
                $.get(getSearchIMDBAPI(title), function(res) {
                    callback2(null, res);
                });
            }, function(callback2) {
                var simplified = simplify_title_for_search(title);
                if (simplified === title)
                {
                    callback2(null, null);
                } else
                {
                    $.get(getSearchIMDBAPI(simplified), function(res) {
                        callback2(null, res);
                    });
                }
            }
        ],
        function(err, res) {
            var searchJson0 = JSON.parse(res[0]);
            var searchJson1 = JSON.parse(res[1]);

            var search_request_datas = [];
            var dict = {};

            if ((searchJson0 !== null) && (typeof(searchJson0.Search) !== "undefined"))
            {
                var len = searchJson0.Search.length;
                for (i = 0; i < len; i++)
                {
                    if (typeof(dict[searchJson0.Search[i]["imdbID"]]) === "undefined")
                    {
                        search_request_datas.push(searchJson0.Search[i]);
                        dict[searchJson0.Search[i]["imdbID"]] = true;
                    }
                }
            }

            if ((searchJson1 !== null) && (typeof(searchJson1.Search) !== "undefined"))
            {
                var len = searchJson1.Search.length;
                for (i = 0; i < len; i++)
                {
                    if (typeof(dict[searchJson1.Search[i]["imdbID"]]) === "undefined")
                    {
                        search_request_datas.push(searchJson1.Search[i]);
                        dict[searchJson1.Search[i]["imdbID"]] = true;
                    }
                }
            }

            console.log("search results");
            console.log(search_request_datas);

            if ((typeof(search_request_datas) !== "undefined") && (search_request_datas !== null) && (search_request_datas.length > 0))
            {
                async.map(search_request_datas, function(search_request_data, callback3)
                {
                    search_request_data["type"] = search_request_data["Type"];
                    if (!info_match_ui_type(search_request_data)) // don't bother if not of appopriate type
                        callback3(0, null);
                    else
                    {
                        get_movie_info(getForIdIMDBAPI(search_request_data["imdbID"]), function(movie_info)
                        {
                            if (info_match_ui(movie_info) === false)
                                callback3(0, null);
                            else
                                callback3(0, movie_info);
                        });
                    }
                }, function(err, results)
                {
                    console.log("getallmovieinfos");
                    console.log(results);

                    var matches = [];

                    var len = results.length;
                    for (i = 0; i < len; i++)
                        if ((results[i] !== null) && (results[i].nodata === false))
                            matches.push(results[i]);
                    callback(matches);
                });
            } else
            {
                callback(null);
            }
        }
    );
}

/*
    Search for the title, first in the CACHE and then through the API
*/
function getRating(ui_data, callback) {
    var cached = checkCache(ui_data["title"], ui_data["year"], ui_data["type"]);
    if (cached !== null)
    {
        callback(cached);
        return;
    }

    if (ui_data["type"] !== "series")
    {
        get_movie_info(getIMDBAPI(simplify_title_for_search(ui_data["title"]), ui_data["year"]), function(movie_info) {
            console.log(movie_info);

            if ((movie_info !== null) && info_match_ui(movie_info))
            {
                addCache(ui_data, movie_info);
                callback(movie_info);
            } else
                getRatingWithSearch(ui_data, callback);
        });
    } else // Don't bother a direct search for tv series
    {
        console.log("skipping first search!");
        getRatingWithSearch(ui_data, callback);
    }
}

function getRatingWithSearch(ui_data, callback)
{
    // If not a good match doing a naive lookup, then find all similar titles and find the best match
    get_all_movie_infos(ui_data["title"], function(movie_infos) {
        console.log(movie_infos);

        var best_info = null;
        if (movie_infos !== null)
        {
            if (movie_infos.length === 1)
                best_info = movie_infos[0];
            else if (movie_infos.length > 1)
            {
                best_info = movie_infos[0]; // TODO: arbitrary for now
            }
        }

        if (best_info !== null)
        {
            if (movie_infos.length === 1)
                addCache(ui_data, best_info); // Only store in cache if just one result (since we don't store other factors that we use for matching).  Could store all matches otherwise.

            callback(best_info);                    
        } else
        {
            var best_info = {};
            best_info["title"] = ui_data["title"];
            best_info["year"] = ui_data["year"];
            best_info["type"] = ui_data["type"];
            best_info["nodata"] = true;
            best_info["date"] = new Date().getTime();
            addCache(ui_data, best_info); // Store that we couldn't find it
            callback(best_info);
        }
    });
}


/*
    parse tomato rating from api response object
*/
function getTomatoScore(res, meterType) {
    return ((typeof(res[meterType]) === "undefined") || res[meterType] === "N/A") ? null : parseInt(res[meterType])
}

///////////////// Display ratings ////////////////

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

// Remove initial 'the', 'the movie', punctuation symbols and double spaces.  Also, convert & to and.
function simplify_title(title)
{
    if ((typeof(title) === "undefined") || (title === null))
        return "";

    var title = title.trim().toLowerCase();
    if (title.indexOf("the ") === 0)
        title = title.substring(4);

    title = title.replace(" & ", " and ");
    title = title.replace("the movie", "");
    title = title.replace("unrated version", "");

    // Assume we can match these based on roles/years
    title = title.replace("(u.s.)", "");
    title = title.replace("(u.k.)", "");
    title = title.replace("(original series)", "");

    if (endsWith(title, "collection"))
        title = title.substring(0, title.length - 11)

    if (endsWith(title, ": the series"))
        title = title.substring(0, title.length - 12)


    title = title.trim();

//    var punctuationless = title.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    var punctuationless = title.replace(/[^\w ]/g,"");
    return punctuationless.replace(/\s{2,}/g," ").trim();
}

function simplify_title_for_search(title)
{
    var simple = simplify_title(title);
    return simple.replace(" and ", " ");
}

function info_match_ui_type(movie_info) {
    var type = parseType();
    if (type !== movie_info["type"])
    {
        console.log("type doesn't match");
        return false;
    }
    return true;
}

function info_match_ui(movie_info) {
    if ((typeof(movie_info) === "undefined") || (movie_info === null))
    {
        console.log("No data returned to compare.");
        return false;
    }

    if (!info_match_ui_type(movie_info))
        return false;

    if (simplify_title(movie_info["title"]) !== simplify_title(parseTitle()))
    {
        console.log("titles don't match");
        return false;
    }

    // TODO - hack.  ignore year for series right now
    if (movie_info.type === "movie")
    {
        if ((movie_info["year"] !== null) && (movie_info["year"] !== parseYear()))
        {
            console.log("years don't match");
            return false;
        }
    }

    return true;
}

/*
    Build and display the ratings
*/
function displayRating(movie_info, args) {
    if (!info_match_ui(movie_info))
        return;
    var imdb = getIMDBHtml(movie_info, args.imdbClass);
    var tomato = getTomatoHtml(movie_info, args.rtClass);
    var $target = $(args.selector);
    $target[args.insertFunc](imdb);
    $target[args.insertFunc](tomato);

//    var poster = "<div id='poster'><img width=80 src='" + "http://img.omdbapi.com/?i=" + movie_info.imdbID + "&apikey=f35e5684" + "'></div>";
//    $target[args.insertFunc](poster);
}

/////////// HTML BUILDERS ////////////
function getIMDBHtml(movie_info, klass) {
    var score = movie_info.imdbScore;
    var html = $('<a class="rating-link" target="_blank" href="' + escapeHTML(getIMDBLink(movie_info.imdbID)) + '"><div class="imdb imdb-icon star-box-giga-star" title="IMDB Rating - ' + movie_info.title.trim() + '"></div></a>');
    if (!score) {
        html.css('visibility', 'hidden');
    } else {
        html.find('.imdb').addClass(klass).append(score.toFixed(1));
    }
    return html
}

// Updated by jaredsohn-lifehacker to show just critic or user ratings if only one is available
function getTomatoHtml(movie_info, klass) {
    var html_text = '<a class="rating-link" target="_blank" href="' + escapeHTML(getTomatoLink(movie_info.imdbID)) + '">';
    html_text += '<span class="tomato tomato-wrapper" title="Rotten Tomato Rating - ' + movie_info.title.trim() + '">';

    if (movie_info.tomatoMeter)
        html_text += '<span class="rt-icon tomato-icon med"></span><span class="rt-score tomato-score"></span>';
    if (movie_info.tomatoUserMeter)
        html_text += '<span class="rt-icon audience-icon med"></span><span class="rt-score audience-score"></span>';
    html_text += '</span></a>';

    var html = $(html_text);

    if ((!movie_info.tomatoMeter) && (!movie_info.tomatoUserMeter)) {
        html.css('visibility', 'hidden');
        return html
    }
    if (movie_info.tomatoMeter)
    {
        html.find('.tomato-icon').addClass(getTomatoClass(movie_info.tomatoMeter)).addClass(klass);
        html.find('.tomato-score').append(movie_info.tomatoMeter + '%');    
    }

    if (movie_info.tomatoUserMeter)
    {
        html.find('.audience-icon').addClass(getTomatoClass(movie_info.tomatoUserMeter)).addClass(klass);
        html.find('.audience-score').append(movie_info.tomatoUserMeter + '%');
    }

    return html
}

/*
    Helper function for escaping API urls
*/
function escapeHTML(str) {
    return str.replace(/[&"<>]/g, function(m) {
        return { 
            "&": "&amp;",
            '"': "&quot;",
            "<": "&lt;",
            ">": "&gt;",
        }[m];
    });
}

///////// INIT /////////////
$(document).ready(function() {
    
    //common select objects
    var WiObj = selectObj('.midBob', 'append');

    //poup select types
    POPUP_INS_SEL = {
        'www.netflix.com' : {
            'Wi': WiObj, // main page selector
            'MyList' : selectObj('.info', 'before', 'queue-icon'), // queue page selector
        },
    };

    addStyle(); //add ratings.css to the page 
});