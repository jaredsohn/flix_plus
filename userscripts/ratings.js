//jaredsohn/lifehacker source: https://github.com/joshblum/netflix-rate-chrome-ext/blob/master/js/ratings.js

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
    }
});

if (window.location.protocol === "https:")
{
    consolelog(-1,"Rotten Tomatoes/IMDB ratings not supported for https; load this page using http for ratings.")
    return;
}

var key_prefix = "flix_plus " + fplib.getProfileName();

// s (NEW!)  string (optional)   title of a movie to search for
// i     string (optional)   a valid IMDb movie id
// t     string (optional)   title of a movie to return
// y     year (optional)     year of the movie
// r     JSON, XML   response data type (JSON default)
// plot  short, full     short or extended plot (short default)
// callback  name (optional)     JSONP callback name
// tomatoes  true (optional)     adds rotten tomatoes data
var IMDB_API =  "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/alias?type=imdbid&s=";
var IMDB_LINK = "http://www.imdb.com/title/";
var _title = "";
var _year = "";

//popup movie selectors
var HOVER_SEL = {
        '.bobbable .popLink' : getWIMainTitle, //wi main display movies
        '.mdpLink' : getSideOrDVDTitle,
    };

var CACHE = localStorage[key_prefix + " ratings"]; // storing all settings into a single local Storage key (Jared Sohn/Lifehacker)
if (typeof(CACHE) === "undefined")
    CACHE = {};
else
    CACHE = JSON.parse(CACHE);

var CACHE_LIFE = 1000*60*60*24*7*2; //two weeks in milliseconds

/////////// HELPERS /////////////
/*
    Builds a select object where the selector is used to insert the ratings via the given insertFunc. Interval specifies the interval necessary for the popupDelay. imdb and rt classes are extra classes that can be added to a rating.
*/
function selectObj(selector, insertFunc, interval, imdbClass, rtClass){
    imdbClass = imdbClass || '';
    rtClass = rtClass || '';
    return {
        'selector' : selector,
        'insertFunc' : insertFunc,
        'interval' : interval,
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


/*
    Get the arguments for showRating based on which popup is being overridden
*/
function getArgs() {
    var url = document.location.href;
    var key = 'dvd.netflix.com';
    var args;
    if (url.indexOf(key) != -1) { // we are in dvds
        args = POPUP_INS_SEL[key];
        args.key = key;
        return args
    }

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
function addCache(title, imdb, tomatoMeter, tomatoUserMeter, imdbID, year, actors) {
    year = year || null;
    imdb = imdb || null;
    tomatoMeter = tomatoMeter || null;
    tomatoUserMeter = tomatoUserMeter || null;
    imdbID = imdbID || null;

    var date = new Date().getTime();
    var rating = {
        'title' : title,
        'imdb' : imdb,
        'tomatoMeter' : tomatoMeter,
        'tomatoUserMeter' : tomatoUserMeter,
        'imdbID' : imdbID,
        'year' : year,
        'date' : date,
        'actors' : actors
    };
    
    CACHE[title] = rating;
    localStorage[key_prefix + " ratings"] = JSON.stringify(CACHE);

    return rating
}

function checkCache(title) {
    if(!(title in CACHE)) {
        return {
            'inCache' : false,
            'cachedVal' : null,
        }
    }

    var cachedVal = CACHE[title];
    var inCache = false;
    if (cachedVal !== undefined && cachedVal.tomatoMeter !== undefined && cachedVal.year !== null){
        var now = new Date().getTime();
        var lifetime = now - cachedVal.date;
        if(lifetime <= CACHE_LIFE) {
            inCache = true;
        }
    }
    return {
        'inCache' : inCache,
        'cachedVal' : cachedVal,
    }
}

/*
    Helper to generalize the parser for side titles and DVD titles
*/
function getWrappedTitle(e, key, regex) {
    var title = $(e.target).attr('alt');
    if (title === undefined) {
        var url = $(e.target).context.href;
        if (typeof url === "undefined"){
            return ""
        }
        url = url.split('/');
        var title = url[url.indexOf(key) + 1];
        title = title.replace(regex, ' ');
    }
    return title
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
    var url = IMDB_API + '&t=' + title;
    if (year !== null) {
        url += '&y=' + year;
    }
    console.log("query url: " + url);
    return url
}

/*
    Build the url for the imdbLink
*/
function getIMDBLink(title) {
    return IMDB_LINK + title
}

/*
    Build the url for the rtLink
*/
function getTomatoLink(imdbID) {
    imdbID = imdbID.slice(2) //convert tt123456 -> 123456
    return TOMATO_LINK + imdbID
}


///////////////// TITLE PARSERS ////////////////
/*
    parses form: http://www.netflix.com/WiPlayer?movieid=70171942&trkid=7103274&t=Archer
*/
function getWIMainTitle(e) {
//    var title = $(e.target).siblings('img').attr('alt');
    var title = $(".bobMovieHeader .title")[0].innerText
    _title = title;
    console.log("title = " + title);
    return title;
}

/*
    Cleanup recently watched title
*/
function getRecentTitle(title) {
    var index = title.indexOf('%3A');
    if (index !== -1) {
        title = title.slice(0, index);
    }
    return title
}

/*
    Instant Queue and dvd popups use the same selector but different parsers
*/
function getSideOrDVDTitle(e) {
    var url = document.location.href;
    if (url.indexOf('Search') != -1) { //no popups on search page.
        return $(e.target).text() // but still cache the title
    }

    var key = 'dvd.netflix.com';
    if (url.indexOf(key) != -1) { // we are in dvds now
        return getDVDTitle(e)
    } 
    return getSideTitle(e)
}

function getSideTitle(e) {
    var key = "WiMovie";
    var regex = /_/g;
    return getWrappedTitle(e, key,regex)
}

function getDVDTitle(e) {
    var key = "Movie";
    var regex = /-/g;
    return getWrappedTitle(e, key,regex)
}

function parseYear($target) {
    var $target = $target || $('.year');
    var year = null;
    if ($target.length) {
        year = $target.text().split('-')[0];
    }
    return year
}

/*
    Parse the search title for a given search result
*/
function parseSearchTitle($target){
    return $target.find('.title').children().text();
}

/////////// RATING HANDLERS ////////////
function eventHandler(e){
    var title = e.data(e); //title parse funtion
    if ($('.label').contents() != '') { //the popup isn't already up
        getRating(title, null, null, function(rating){ //null year, null addArgs
            showRating(rating, getArgs());
        });
    }
}

/*
    Search for the title, first in the CACHE and then through the API
*/
function getRating(title, year, addArgs, callback) {
    var cached = checkCache(title);
    if (cached.inCache){
        callback(cached.cachedVal, addArgs);
        return
    }
    $.get(getIMDBAPI(title, year), function(res){
        try {
          res = JSON.parse(res);
        } catch(e){
          res = {
                'Response' : 'False',
            };
        }
        
        if (res.Response === 'False'){
            addCache(title);
            return null
        }
        console.log("~~~");
        console.log(res);
        var imdbScore = parseFloat(res.imdbRating);
        var tomatoMeter = getTomatoScore(res, "tomatoMeter");
        var tomatoUserMeter = getTomatoScore(res, "tomatoUserMeter");
        var rating = addCache(title, imdbScore, tomatoMeter, tomatoUserMeter, res.imdbID, year, res.actors);
        callback(rating, addArgs);
    });
}

/*
    parse tomato rating from api response object
*/
function getTomatoScore(res, meterType) {
    return res[meterType] === "N/A" ? null : parseInt(res[meterType])
}

/*
    Given a rating and specific arguments, display to popup or search page
*/
function showRating(rating, args) {
    if (!args.interval) { // unknown popup
        return
    }
    var checkVisible = setInterval(function(){
        var $target = $(args.selector);
        if($target.length){
            clearInterval(checkVisible);
            updateCache(rating.title); //run the query with the year to update
            clearOld(args);
            displayRating(rating, args);
        }
    }, args.interval);
}

/*
    Call the API with the year and update the rating if neccessary
*/
function updateCache(title) {
    var this_title = title;
    function get_and_show_rating() {    
        var cachedVal = checkCache(title).cachedVal;
        if (cachedVal.year === null) {
            var year = parseYear();
            getRating(title, year, null, function(rating){
                if ((rating.title.trim() === _title.trim()))
                {
                    // TODO: also do a check for actors, directors, etc.
                    showRating(rating, getArgs());                
                }
            });
        }
    }
    get_and_show_rating();
}

/*
    Build and display the ratings
*/
function displayRating(rating, args) {
    console.log("displayRating");
    console.log(rating);
    console.log(args);

//    if ((rating.title === $(".bobMovieHeader .title")[0].innerText))
    {
        var imdb = getIMDBHtml(rating, args.imdbClass);
        var tomato = getTomatoHtml(rating, args.rtClass);
        var $target = $(args.selector);
        $target[args.insertFunc](imdb);
        $target[args.insertFunc](tomato);
    }
}

////////SEARCH AND INDIVIDUAL PAGE HANDLERS //////////
/*
    Determine which search, dvd or watch instantly and display the correct ratings
*/
function searchSetup() {
    var url = document.location.href;
    var args;
    if (url.indexOf("WiSearch") !== -1) {
        args = SEARCH_SEL.WiSearch;
        args.selectorClass = ".media";
    } else if (url.indexOf("Search") !== -1) {
        args = SEARCH_SEL.Search;
        args.selectorClass = ".agMovie";
    }
    if (args === undefined) {
        return
    }
    return displaySearch(args)
}

/*
    Find ratings for all of the movies found by the search and display them
*/
function displaySearch(args){

    var selector = args.selector;
    $.each($(args.selectorClass), function(index, target){ // iterate over movies found
        var $target = $(target);
        var year = parseYear($target.find('.year'));
        var title = parseSearchTitle($target);
        var addArgs = {
            'target' : $target,
            'selector' : selector,
        }; // add the current target so the rating matches the movie found
        getRating(title, year, addArgs, function(rating, addArgs){
            args.selector = addArgs.target.find(addArgs.selector); // store selector to show rating on.

            displayRating(rating, args);
        });
    });
}


/////////// HTML BUILDERS ////////////
function getIMDBHtml(rating, klass) {
    var score = rating.imdb;
    var html = $('<a class="rating-link" target="_blank" href="' + escapeHTML(getIMDBLink(rating.imdbID)) + '"><div class="imdb imdb-icon star-box-giga-star" title="IMDB Rating - ' + rating.title.trim() + '"></div></a>');
    if (!score) {
        html.css('visibility', 'hidden');
    } else {
        html.find('.imdb').addClass(klass).append(score.toFixed(1));
    }
    return html
}

// Updated by jaredsohn-lifehacker to show just critic or user ratings if only one is available
function getTomatoHtml(rating, klass) {
    var html_text = '<a class="rating-link" target="_blank" href="' + escapeHTML(getTomatoLink(rating.imdbID)) + '">';
    html_text += '<span class="tomato tomato-wrapper" title="Rotten Tomato Rating - ' + rating.title.trim() + '">';

    if (rating.tomatoMeter)
        html_text += '<span class="rt-icon tomato-icon med"></span><span class="rt-score tomato-score"></span>';
    if (rating.tomatoUserMeter)
        html_text += '<span class="rt-icon audience-icon med"></span><span class="rt-score audience-score"></span>';
    html_text += '</span></a>';

    var html = $(html_text);

    if ((!rating.tomatoMeter) && (!rating.tomatoUserMeter)) {
        html.css('visibility', 'hidden');
        return html
    }
    if (rating.tomatoMeter)
    {
        html.find('.tomato-icon').addClass(getTomatoClass(rating.tomatoMeter)).addClass(klass);
        html.find('.tomato-score').append(rating.tomatoMeter + '%');    
    }

    if (rating.tomatoUserMeter)
    {
        html.find('.audience-icon').addClass(getTomatoClass(rating.tomatoUserMeter)).addClass(klass);
        html.find('.audience-score').append(rating.tomatoUserMeter + '%');
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
    var dvdSelObj = selectObj('.bobMovieRatings', 'append', 800, 'dvd-popup', 'dvd-rt-icon');
    var WiObj = selectObj('.midBob', 'append', 800);

    //poup select types
    POPUP_INS_SEL = {
        'www.netflix.com' : { // was movies (jaredsohn/lifehacker)
            'Wi': WiObj, // main page selector
            'Queue' : selectObj('.info', 'before', 800, 'queue-icon'), // queue page selector
        },
        'dvd.netflix.com' : dvdSelObj, // dvdqueue page selector
    };

    //search select types
    SEARCH_SEL = {
        //search page selectors
        'Search' : selectObj('.bluray', 'append', -1, 'dvd-search-page', 'search-rt-icon'),
        'WiSearch' : selectObj('.actions', 'append', -1, 'wi-search-page', 'search-rt-icon'),
    };

    addStyle(); //add ratings.css to the page 
    searchSetup(); // check if this is a search page

    $.each(HOVER_SEL, function(selector, parser){ //add listeners for each hover selector
        $(document).on('mouseenter', selector, parser, eventHandler);
    });

});