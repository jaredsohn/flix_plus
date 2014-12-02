// Original source: https://github.com/joshblum/netflix-rate-chrome-ext/blob/master/js/ratings.js
// Heavily rewritten by jaredsohn-lifehacker to: 
//
//  1. prevent displaying wrong rating by comparing title/year with ui before updating
//  2. improve accuracy of matches by
//      -- only matching movies with movies and tv series with tv series
//      -- created a simplified version of a title and compare against that
//      -- do searches of original and simplified titles and check all returned results
//      -- look at roles and other information to deal with choose among multiple matches
//  3. make popup bigger to handle newer recommend button; show progress via spinner; indicate if no match is found
//  4. ensure it works on all pages (added wiRoledisplay, wimovie, perhaps a few others).  WiGenre pages are handled by Flix Plus redirecting to WiAltGenre URLs.
//  5. remove support for DVDs; also match current (Nov 2014) version of site
//  6. warn about lack of https support
//  7. show rotten ratings even if only one type found
//  8. not pollute localstorage or css classes
//
// Note: The metacritic code here came from a newer version of joshblum's script and has not been tested yet.  One issue is that omdbapi
// does not include metacritic URLs, so to include links additional code would be needed.

var key_name = "flix_plus " + fplib.getProfileName() + " ratings2";
var IMDB_API =  "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/alias?type=imdbid&s=";
var IMDB_LINK = "http://www.imdb.com/title/";

var CACHE = localStorage[key_name]; // storing all settings into a single local Storage key (Jared Sohn/Lifehacker)
if (typeof(CACHE) === "undefined")
    CACHE = {};
else
    CACHE = JSON.parse(CACHE);

var CACHE_LIFE = 1000*60*60*24*7*2; //two weeks in milliseconds

//////////// CACHE //////////////

function addCache(ui_data, movie_info) {
    if ((movie_info === null) || (movie_info["nodata"] === true)) // We don't cache when the movie wasn't found
        return null;

    var compact_movie_info = {};
    var fields = ["title", "year", "type", "date", "imdbID", "imdbScore", "tomatoMeter", "tomatoUserMeter", "metaScore"];
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
    console.log(key);

    if(!(key in CACHE))
        return null;

    console.log("is in cache:");
    console.log(((new Date().getTime() - CACHE[key].date) <= CACHE_LIFE) ? CACHE[key] : null);

    // Return cached value if not expired
    return ((new Date().getTime() - CACHE[key].date) <= CACHE_LIFE) ? CACHE[key] : null;
}

///////////////// URL BUILDERS ////////////////

function getIMDBAPI(title, year) {
    var url = IMDB_API + '&t=' + title.trim();
    if (year !== null) {
        url += '&y=' + year;
    }
    console.log(url);
    return url
}

function getSearchIMDBAPI(title) {
    var url = IMDB_API + '&s=' + title.trim();
    console.log(url);
    return url;
}

function getForIdIMDBAPI(id) {
    var url = IMDB_API + '&i=' + id.trim();
    console.log(url);
    return url;
}

function getIMDBLink(title) {
    return IMDB_LINK + title.trim()
}

function getTomatoLink(imdbID) {
    imdbID = imdbID.slice(2) //convert tt123456 -> 123456
    return TOMATO_LINK + imdbID
}


///////////////// UI PARSERS ////////////////
function parseTitle(args) {
    return $(args["info_section"] + " .title")[0].innerText.trim();
}

// Assumes only tv series or movie
function parseType(args) {
    var $target = $(args["info_section"] + " .duration");
    var text = $target.text();
    if ((text.indexOf("Season") !== -1) || (text.indexOf("Series") !== -1) || (text.indexOf("Episode")    !== -1) || 
        (text.indexOf("Part") !== -1)   || (text.indexOf("Volume") !== -1) || (text.indexOf("Collection") !== -1))
        return "series";
    else
        return "movie";
}

function parseYear(args) {
    var $target = $(args["info_section"] + " .year");
    return $target.text().split('-')[0];
}

function parseEndYear(args) {
    var $target = $(args["info_section"] + " .year");
    var endYear = null;
    if ($target[0].innerText.indexOf("-") !== -1)
        endYear = $target.text().split('-')[1];
    return endYear;
}

function parseRoles(args) {
    var roles = { "actors" : {}, "directors" : {}, "creators" : {} };
    var target_elem = $(args["roles_section"]);
    try
    {
        var dts = $(" dl dt", target_elem);
        var dds = $(" dl dd", target_elem);

        var dts_len = dts.length;
        for (i = 0; i < dts_len; i++)
        {
            var dt = dts[i].innerText.trim().replace(":", "").toLowerCase();

            var elems = $("a", dds[i]);
            var elems_len = elems.length;

            var dict = {"starring": "actors", "cast": "actors", "director": "directors", "creator": "creators"};
            if (dt in dict)
                for (j = 0; j < elems_len; j++)
                    roles[dict[dt]][elems[j].innerText.trim()] = true;
        }
    }
    catch(ex)
    {
        console.log(ex);
    }
    return roles;
}

///////////////// AJAX ////////////////

function get_movie_info(url, callback)
{
    console.log(url);
    var movie_info = {};

    $.get(url, function(res) 
    {
        try {
            var omdb_json = JSON.parse(res);
            movie_info = parse_movie_info(omdb_json);
        } catch(ex) {
            console.log(ex);
        }
        callback(movie_info);
    });
}

function get_all_movie_infos(title, args, callback)
{
    var url;

    async.parallel(
        [
            function(callback2) {
                url = getSearchIMDBAPI(title);
                $.get(url, function(res) {
                    callback2(null, res);
                });
            }, function(callback2) {
                var simplified = simplify_title_for_search(title);
                if (simplified.toLowerCase() === title.toLowerCase())
                {
                    callback2(null, null);
                } else
                {
                    url = getSearchIMDBAPI(simplified);
                    $.get(url, function(res) {
                        callback2(null, res);
                    });
                }
            }
        ],
        function(err, res) {

            console.log("~~~~");
            console.log(res);

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
                    if (!info_match_ui_type(search_request_data, args)) // don't bother if not of appopriate type
                        callback3(0, null);
                    else
                    {
                        get_movie_info(getForIdIMDBAPI(search_request_data["imdbID"]), function(movie_info)
                        {
                            if (info_match_ui(movie_info, args) === false)
                                callback3(0, null);
                            else if (info_match_ui_roles_count(movie_info, args) === 0)
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

// Search for the title, first in the CACHE and then through the API
function getRating(args, cache_only, callback) {

    var ui_data = get_ui_data(args);

    var $target = $(args["selector"]);
    var spinner = "<div id='fp_rt_spinner_div'>Looking up external ratings...<br><img class='fp_button fp_rt_spinner' src='" + chrome.extension.getURL('../src/img/ajax-loader.gif') + "'></div>";
    $target.append(spinner);

    var cached = checkCache(ui_data["title"], ui_data["year"], ui_data["type"]);

    if (cached !== null)
    {
        callback(cached);
        return;
    }

    if (cache_only)
    {
        console.log("quitting since cache-only mode is in effect");
        callback(null);
        return
    }
    if (ui_data["type"] !== "series")
    {
        get_movie_info(getIMDBAPI(simplify_title_for_search(ui_data["title"]), ui_data["year"]), function(movie_info) {
            console.log(movie_info);

            if ((movie_info !== null) && info_match_ui(movie_info, args))
            {
                addCache(ui_data, movie_info);
                callback(movie_info);
            } else
                getRatingWithSearch(ui_data, args, callback);
        });
    } else // Don't bother a direct search for tv series since the API doesn't work right for that
    {
        getRatingWithSearch(ui_data, args, callback);
    }
}

function getRatingWithSearch(ui_data, args, callback)
{
    // If not a good match doing a naive lookup, then find all similar titles and find the best match
    get_all_movie_infos(ui_data["title"], args, function(movie_infos) {
        console.log(movie_infos);

        var best_info = null;
        if (movie_infos !== null)
        {
            if (movie_infos.length === 1)
                best_info = movie_infos[0];
            else if (movie_infos.length > 1)
            {
                best_info = null; // We reject it for now to avoid showing wrong information.
            }
        }

        if (best_info !== null)
        {
            if (movie_infos.length === 1)
                addCache(ui_data, best_info); // Only store in cache if just one result (since we don't store other factors that we use for matching).  Could store all matches otherwise.

            callback(best_info);
        } else
        {
            // Could not find it; create a dummy object and pass it along to update the UI (this exists because we used to cache this)
            var best_info = {"title" : ui_data["title"], "year": ui_data["year"], "type": ui_data["type"], "nodata": true, "data": new Date().getTime()};
            addCache(ui_data, best_info);
            callback(best_info);
        }
    });
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
    info.metacriticScore = getTomatoScore(omdb_json, "Metascore")
    info.date = new Date().getTime();
    info.type = omdb_json["Type"];
    info.roles = {};
    info.roles["actors"] = getRolesArray(omdb_json, "Actors");
    info.roles["directors"] = getRolesArray(omdb_json, "Director");
    info.roles["creators"] = getRolesArray(omdb_json, "Creator");
    info.rated = omdb_json["Rated"];
    info.nodata = false;
    console.log("parsed movie info");
    console.log(info);

    return info;
}

// parse tomato rating from api response object
function getTomatoScore(res, meterType) {
    return ((typeof(res[meterType]) === "undefined") || res[meterType] === "N/A") ? null : parseInt(res[meterType])
}

function getRolesArray(json_obj, field)
{
    var roles_array = [];
    if ((typeof(json_obj[field]) !== "undefined") && (json_obj[field] !== null))
        roles_array = json_obj[field].split(",");
    for (i = 0; i < roles_array.length; i++)
        roles_array[i] = roles_array[i].trim();

    return roles_array;
}

function get_ui_data(args) {
    var ui_data = {};
    ui_data["title"] = parseTitle(args);
    ui_data["year"] = parseYear(args);
    ui_data["roles"] = parseRoles(args);
    ui_data["type"] = parseType(args);

    return ui_data;
}

// Remove initial 'the', 'the movie', punctuation symbols and double spaces.  Also, convert & to and.
function simplify_title(title)
{
    if ((typeof(title) === "undefined") || (title === null))
        return "";

    var title = title.trim().toLowerCase();
    if (title.indexOf("the ") === 0)
        title = title.substring(4);

    if (title.indexOf("classic ") === 0)
        title = title.substring(8);

    title = title.replace(" & ", " and ");
    title = title.replace("the movie", "");
    title = title.replace("unrated version", "");

    // Assume we can match these based on roles/years
    title = title.replace("(u.s.)", "");
    title = title.replace("(u.k.)", "");
    title = title.replace("(original series)", "");

    if (extlib.endsWith(title, "collection"))
        title = title.substring(0, title.length - 11)

    if (extlib.endsWith(title, ": the series"))
        title = title.substring(0, title.length - 12)


    title = title.trim();

    var punctuationless = title.replace(/[^\w ]/g,"");
    return punctuationless.replace(/\s{2,}/g," ").trim();
}

function simplify_title_for_search(title)
{
    var simple = simplify_title(title);
    return simple.replace(" and ", " ");
}

///////////////// DISPLAY RATINGS ////////////////

function info_match_ui_type(movie_info, args) {
    var type = parseType(args);
    if (type !== movie_info["type"])
    {
        console.log("type doesn't match");
        return false;
    }
    return true;
}

function info_match_ui_roles_count(movie_info, args) {
    if (typeof(movie_info["roles"]) === "undefined")
        return 1;

    var ui_roles = parseRoles(args);
    var ajax_roles = movie_info["roles"];
    var match_count = 0;

    console.log("ajax_roles: ~~~~");
    console.log(ajax_roles);


    console.log("ui_roles: ~~~~");
    console.log(ui_roles);

    var match_count_text = "";
    var ui_roles_count = ui_roles["actors"].length + ui_roles["directors"].length + ui_roles["creators"].length;
    var ajax_roles_count = ajax_roles["actors"].length + ajax_roles["directors"].length + ajax_roles["creators"].length;
    if ((ui_roles_count === 0) || (ajax_roles_count === 0))
        return 1; // If either is missing role data we treat it as a low match.
    else
    {
        // must have at least one match.
        var role_names = ["actors", "directors", "creators"];
        for (i = 0; i < role_names.length; i++)
        {
            var dict = {};

            var keys = Object.keys(ui_roles[role_names[i]]);;
            var len = keys.length;
            for (j = 0; j < len; j++)
            {
                var name = keys[j].toLowerCase().trim();
                dict[name] = true;
            }

            for (j = 0; j < ajax_roles[role_names[i]].length; j++)
            {
                var name = ajax_roles[role_names[i]][j].trim();
                if (typeof(dict[name.toLowerCase()]) !== "undefined")
                {
                    match_count_text += name + ", ";
                    match_count += 1;
                }
            }
        }
    }
    console.log('match count is ' + match_count);
    console.log(match_count_text);

    return match_count;
}


function info_match_ui(movie_info, args) {
    if ((typeof(movie_info) === "undefined") || (movie_info === null))
    {
        console.log("No data returned to compare.");
        return false;
    }

    if (!info_match_ui_type(movie_info, args))
    {
        //message already shown by method console.log("types don't match");
        return false;
    }

    var roles_match_count = info_match_ui_roles_count(movie_info, args);
    console.log("~~~");
    console.log(movie_info);
    console.log(roles_match_count);
    if (roles_match_count === 0)
    {
        console.log("roles don't match.");
        return false;
    }

    if (simplify_title(movie_info["title"]) !== simplify_title(parseTitle(args)))
    {
        console.log("titles don't match");
        return false;
    }

    try
    {
        // The year (or start year) must be within one
        var ajax_years = extlib.parse_year_range(movie_info["year"]);
        var ajax_year_str = null;
        if (ajax_years.length)
            ajax_year_str = ajax_years[0].toString();

        if ((ajax_year_str !== null) && (ajax_year_str.trim() !== ""))
        {
            var ajax_year = parseInt(ajax_year_str);
            var ui_year_str = parseYear(args);

            if ((ui_year_str !== ((ajax_year).toString())) && 
                (ui_year_str !== ((ajax_year - 1).toString())) && 
                (ui_year_str !== ((ajax_year + 1).toString())))
            {
                console.log("years don't match");
                return false;
            }
        } else
        {
            console.log("years don't match");
            return false;        
        }
    } catch (ex)
    {
        console.log(ex);
        console.log("years don't match");
        return false;                
    }

    return true;
}

//    Build and display the ratings
function displayRating(movie_info, is_https, args) {
    console.log(movie_info);
    clearOld(args);
    if ((movie_info === null) || (movie_info.nodata === true) || (!info_match_ui(movie_info, args)))
    {
        if (is_https)
            $(args["selector"]).append("<div class='fp_rt_no_https'><br>No HTTPS support for external ratings.</div>");
        else
            $(args["selector"]).append("<div id='fp_rt_not_found'><br>Could not find external ratings.</div>");
    }
    else
    {
        var imdb = getIMDBHtml(movie_info, '');
        var tomato = getTomatoHtml(movie_info, '');
//        var meta = getMetatcriticHtml(movie_info, '');

        var $target = $(args["selector"]);
        $target.append(imdb);
        $target.append(tomato);
  //      $target.append(meta);
    }
}

// Clear old ratings and unused content.
function clearOld(args){
    var $target = $(args["info_section"]);
    if (args["hide_labels"] === true)
        $target.find('.label').contents().remove();
    $target.find('.ratingPredictor').remove();
    $target.find('.fp_rt_rating_link').remove();
    $target.find('#fp_rt_spinner_div').remove();
    $target.find('#fp_rt_not_found').remove();
    $target.find('.fp_rt_no_https').remove();

    if (args["fix_alignment"] === true)
    {
        // Fix alignment issues by removing stbrLeftAlign class so rotten/imdb ratings appear on same line as user star ratings)
        var elems = $target.find('.bobMovieRatings')[0].getElementsByClassName("stbrLeftAlign");
        for (i = 0; i < elems.length; i++)
            elems[i].className = elems[i].className.replace(new RegExp(" ?\\b"+"stbrLeftAlign"+"\\b"),'');
    }
}

function getTomatoClass(score) {
    return score < 59 ? 'fp_rt_rotten' : 'fp_rt_fresh';
}

function getMetacriticClass(score) {
    var klass;
    if (score > 60) klass = 'favorable';
    else if (score > 40) klass = 'faverage';
    else klass = 'unfavorable';
    return 'fp_rt_' + klass;
}


/////////// HTML BUILDERS ////////////
function getIMDBHtml(movie_info, klass) {
    var score = movie_info.imdbScore;
    var html = $('<a class="fp_rt_rating_link" target="_blank" href="' + extlib.escapeHTML(getIMDBLink(movie_info.imdbID)) + '"><div class="fp_rt_imdb fp_rt_imdb_icon fp_rt_star_box_giga_star" title="IMDB Rating - ' + movie_info.title.trim() + '"></div></a>');
    if (!movie_info.imdbID) {
        html.css('visibility', 'hidden');
    } else {
        if (!score)
            html.find('.fp_rt_imdb').addClass(klass).append("N/A");            
        else
            html.find('.fp_rt_imdb').addClass(klass).append(score.toFixed(1));
    }
    return html
}

function getTomatoHtml(movie_info, klass) {
    var html_text = '<a class="fp_rt_rating_link" target="_blank" href="' + extlib.escapeHTML(getTomatoLink(movie_info.imdbID)) + '">';
    html_text += '<span class="fp_rt_tomato fp_rt_tomato_wrapper" title="Rotten Tomato Rating - ' + movie_info.title.trim() + '">';

    if (movie_info.tomatoMeter)
        html_text += '<span class="fp_rt_icon fp_rt_tomato_icon fp_rt_med"></span><span class="fp_rt_score fp_rt_tomato_score"></span>';
    if (movie_info.tomatoUserMeter)
        html_text += '<span class="fp_rt_icon fp_rt_audience_icon fp_rt_med"></span><span class="fp_rt_score fp_rt_audience_score"></span>';
    html_text += '</span></a>';

    var html = $(html_text);

    if ((!movie_info.tomatoMeter) && (!movie_info.tomatoUserMeter)) {
        html.css('visibility', 'hidden');
        return html
    }
    if (movie_info.tomatoMeter)
    {
        html.find('.fp_rt_tomato_icon').addClass(getTomatoClass(movie_info.tomatoMeter)).addClass(klass);
        html.find('.fp_rt_tomato_score').append(movie_info.tomatoMeter + '%');    
    }
    if (movie_info.tomatoUserMeter)
    {
        html.find('.fp_rt_audience_icon').addClass(getTomatoClass(movie_info.tomatoUserMeter)).addClass(klass);
        html.find('.fp_rt_audience_score').append(movie_info.tomatoUserMeter + '%');
    }

    return html
}

function getMetatcriticHtml(movie_info, klass) {
    var html = $('<a class="fp_rt_rating_link" target="_blank" href="#"><span class="fp_rt_metascore fp_rt_metacritic_rating" title="MetaCritic Rating - "' + movie_info.title + '>' + movie_info.metacriticScore + '</span>');
    html.find('.metacritic-rating').addClass(getMetacriticClass(movie_info.metacriticScore));
    if (!movie_info.metacriticScore) {
        html.css('visibility', 'hidden');
    }
    return html;
}


///////// MAIN /////////////

var onPopup = function()
{
    console.log("arrive-ratings-onPopup");

    $(".bobMovieContent").height(250); // jaredsohn-lifehacker: Added to make room for ratings buttons (after recommend button was added)
    $(".bobMovieContent").width(325);  // Sometimes the code below wouldn't fit within the popup; make it bigger to accomodate it
    $("#BobMovie-content").width(347); // Match the width
    $(".bobMovieHeader").width(329);   // Match the width

    var args = {"info_section" : "#BobMovie", "roles_section" : ".info", "selector" : ".midBob", "hide_labels" : true, "fix_alignment": true }
    if (location.pathname.indexOf("/search") === 0)
    {
        console.log("fix alignment set to false");
        args["fix_alignment"] = false;
    }

    clearOld(args);

    var is_https = (window.location.protocol === "https:");
    getRating(args, is_https, function(movie_info) {
console.log("7");
        displayRating(movie_info, is_https, args);
    });
};

$(document).ready(function() {
    extlib.addStyle("fp_rt_rating_overlay", chrome.extension.getURL('../src/css/ratings.css'));

    // Show ratings on movie details page
    if (location.pathname.indexOf("/WiMovie") === 0)
    {
        var args = {"info_section" : "#displaypage-overview-details", "roles_section" : "#displaypage-details", "selector" : ".ratingsInfo", "hide_labels" : false, "fix_alignment": false }

        if (window.location.protocol === "https:")
        {
            $(args["info_section"]).append("<div class='fp_rt_no_https'><br>No https support for Rotten Tomatoes / IMDB ratings.</div>");
        } else
        {
            getRating(args, false, function(movie_info) {
                console.log("3");

                var is_https = (window.location.protocol === "https:");
                displayRating(movie_info, is_https, args);
            });
        }
    }

    var selectors = fplib.getSelectorsForPath();
    if (selectors !== null)
        document.arrive(selectors["bobPopup"], onPopup);
});
