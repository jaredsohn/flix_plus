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
//
// Note that this file has slightly different coding standards than others in Flix Plus by Lifehacker
// (functions are declarative rather than expressions, local vars are camelcase)
// and this was done to match the origin script's style and also my own style when I did a lot of work on this.

var key_name_ = "flix_plus " + fplib.getProfileName() + " ratings2";
var IMDB_API = "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/alias?type=imdbid&s=";
var IMDB_LINK = "http://www.imdb.com/title/";

var CACHE = localStorage[key_name_]; // storing all settings into a single local Storage key (Jared Sohn/Lifehacker)
if (typeof(CACHE) === "undefined")
    CACHE = {};
else
    CACHE = JSON.parse(CACHE);

var CACHE_LIFE = 1000 * 60 * 60 * 24 * 7 * 2; //two weeks in milliseconds

var https_supported_ = true; // Not true if using this as a userscript
var movie_info_cached_ = {}; // id: movieInfo; only stored in memory

//////////// CACHE //////////////

function addCache(ui_data, movie_info) {
    if ((movie_info === null) || (movie_info["nodata"] === true)) // We don't cache when the movie wasn't found
        return null;

    var compact_movie_info = {};
    var fields = ["title", "year", "type", "date", "imdbID", "imdbScore", "tomatoMeter", "tomatoUserMeter", "metaScore"];
    var len = fields.length;
    for (var i = 0; i < len; i++)
        compact_movie_info[fields[i]] = movie_info[fields[i]];

    var key = ui_data["title"] + "_" + ui_data["year"] + "_" + ui_data["type"];

    CACHE[key] = compact_movie_info;
    localStorage[key_name_] = JSON.stringify(CACHE);

    return movie_info;
}

function checkCache(title, year, type) {
    var key = title + "_" + year + "_" + type;
    console.log("checking cache");
    console.log(key);

    if (!(key in CACHE))
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
    return url;
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
    return IMDB_LINK + title.trim();
}

function getTomatoLink(imdbID) {
    imdbID = imdbID.slice(2); //convert tt123456 -> 123456
    return TOMATO_LINK + imdbID;
}


///////////////// UI PARSERS ////////////////
function parseTitle(args) {
    return fplib.parseTitle(args["parse_head"]);
}

// Assumes only tv series or movie
function parseType(args) {
    return ($(".Episodes", $(args["parse_head"])).length) ? "series" : "movie";
}

function parseYear(args) {
    var $target = $(".meta .year", $(args["parse_head"]));
    return $target.text().split('-')[0];
}

function parseEndYear(args) {
    var $target = $(".meta .year", $(args["parse_head"]));
    var endYear = null;
    if ($target[0].innerText.indexOf("-") !== -1)
        endYear = $target.text().split('-')[1];
    return endYear;
}

function parseRoles(args) {
    var roles = { "actors" : {}, "directors" : {}, "creators" : {} };
    var $target = $(".metaList a", args["parse_head"]);

    [].slice.call($target).forEach(function(metaEntry) {
        if (metaEntry.getAttribute("type") === "person") {
            roles["actors"][metaEntry.innerHTML.toLowerCase().trim()] = true;
        }
    });

    return roles;
}

///////////////// AJAX ////////////////

// a replacement for $.get that uses the background page to make requests.
// Allows requesting http data via an https page.
function getViaBackgroundPage(url, callback)
{
    chrome.runtime.sendMessage({"request_type": "get", "url": url}, function(response) {
        callback(response["data"]);
    });
}

function getMovieInfo(url, callback)
{
    console.log(url);
    var movie_info = {};

    getViaBackgroundPage(url, function(res)
    {
        console.log(res);
        try {
            var omdb_json = res;
            movie_info = parseMovieInfo(omdb_json);
        } catch (ex) {
            console.log(ex);
        }
        callback(movie_info);
    });
}

function getAllMovieInfos(title, args, callback)
{
    var url;

    async.parallel(
        [
            function(callback2) {
                url = getSearchIMDBAPI(title);
                getViaBackgroundPage(url, function(res) {
                    callback2(null, res);
                });
            }, function(callback2) {
                var simplified = simplifyTitleForSearch(title);
                if (simplified.toLowerCase() === title.toLowerCase())
                {
                    callback2(null, null);
                } else
                {
                    url = getSearchIMDBAPI(simplified);
                    getViaBackgroundPage(url, function(res) {
                        callback2(null, res);
                    });
                }
            }
        ],
        function(err, res) {

            console.log("~~~~");
            console.log(res);

            var searchJson0 = res[0];
            var searchJson1 = res[1];

            var search_request_datas = [];
            var dict = {};

            if ((searchJson0 !== null) && (typeof(searchJson0.Search) !== "undefined"))
            {
                var len = searchJson0.Search.length;
                for (var i = 0; i < len; i++)
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
                for (var i = 0; i < len; i++)
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
                    if (!infoMatchUiType(search_request_data, args)) // don't bother if not of appopriate type
                        callback3(0, null);
                    else
                    {
                        getMovieInfo(getForIdIMDBAPI(search_request_data["imdbID"]), function(movie_info)
                        {
                            if (infoMatchUi(movie_info, args) === false)
                                callback3(0, null);
                            else if (((movie_info["type"] || null) !== "series") && (infoMatchUiRolesCount(movie_info, args) === 0))
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
                    for (var i = 0; i < len; i++)
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

    var ui_data = getUiData(args);

    var $target = $(args["out_head"]);
    var spinner = "<div id='fp_rt_spinner_div'>Looking up external ratings...<br><img class='fp_button fp_rt_spinner' src='" + chrome.extension.getURL('../src/img/ajax-loader.gif') + "'><br><br><br></div>";
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
        return;
    }
    if (ui_data["type"] !== "series")
    {
        getMovieInfo(getIMDBAPI(simplifyTitleForSearch(ui_data["title"]), ui_data["year"]), function(movie_info) {
            console.log(movie_info);

            if ((movie_info !== null) && infoMatchUi(movie_info, args))
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
    getAllMovieInfos(ui_data["title"], args, function(movie_infos) {
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

function parseMovieInfo(omdb_json)
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
    info.metacriticScore = getTomatoScore(omdb_json, "Metascore");
    info.date = new Date().getTime();
    info.type = omdb_json["Type"];
    info.roles = {};
    info.roles["actors"] = getRolesArray(omdb_json, "Actors");
    info.roles["directors"] = getRolesArray(omdb_json, "Director");
    info.roles["creators"] = getRolesArray(omdb_json, "Creator");
    info.rated = omdb_json["Rated"];
    info.nodata = false;
    info.ignoreRoles = false;
    info.ignoreYears = false;
    console.log("parsed movie info");
    console.log(info);

    return info;
}

// parse tomato rating from api response object
function getTomatoScore(res, meterType) {
    return ((typeof(res[meterType]) === "undefined") || res[meterType] === "N/A") ? null : parseInt(res[meterType]);
}

function getRolesArray(json_obj, field)
{
    var roles_array = [];
    if ((typeof(json_obj[field]) !== "undefined") && (json_obj[field] !== null))
        roles_array = json_obj[field].split(",");
    for (var i = 0; i < roles_array.length; i++)
        roles_array[i] = roles_array[i].trim();

    return roles_array;
}

function getUiData(args) {
    var ui_data = {};
    ui_data["title"] = parseTitle(args);
    ui_data["year"] = parseYear(args);
    ui_data["roles"] = parseRoles(args);
    ui_data["type"] = parseType(args);

    return ui_data;
}

// Remove initial 'the', 'the movie', punctuation symbols and double spaces.  Also, convert & to and.
function simplifyTitle(title)
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
        title = title.substring(0, title.length - 11);

    if (extlib.endsWith(title, ": the series"))
        title = title.substring(0, title.length - 12);


    title = title.trim();

    var punctuationless = title.replace(/[^\w ]/g, "");
    return punctuationless.replace(/\s{2,}/g, " ").trim();
}

function simplifyTitleForSearch(title)
{
    var simple = simplifyTitle(title);
    return simple.replace(" and ", " ");
}

///////////////// DISPLAY RATINGS ////////////////

function infoMatchUiType(movie_info, args) {
    var type = parseType(args);
    if (type !== movie_info["type"])
    {
        console.log("types don't match");
        return false;
    }
    return true;
}

function infoMatchUiRolesCount(movie_info, args) {
    console.log("comparing roles");
    console.log(movie_info);

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
        for (var i = 0; i < role_names.length; i++)
        {
            var dict = {};

            var keys = Object.keys(ui_roles[role_names[i]]);
            var len = keys.length;
            for (var j = 0; j < len; j++)
            {
                var name = keys[j].toLowerCase().trim();
                dict[name] = true;
            }

            for (var j = 0; j < ajax_roles[role_names[i]].length; j++)
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


function infoMatchUi(movie_info, args) {
    if ((typeof(movie_info) === "undefined") || (movie_info === null))
    {
        console.log("No data returned to compare.");
        return false;
    }

    if (!infoMatchUiType(movie_info, args))
    {
        //message already shown by method console.log("types don't match");
        return false;
    }

    // Netflix no longer shows roles on the show info page if a series (it
    // is still accessible in the details page, but then we need to do some
    // magic to get at that information.
    console.log("will skip roles if series");
    console.log(movie_info["type"]);
    console.log((movie_info["type"] || null) !== "series");
    console.log(movie_info["type"] || null);
    if (((movie_info["type"] || null) !== "series") && (movie_info["ignoreRoles"] === false)) {
        console.log("guess we will compare");
        var roles_match_count = infoMatchUiRolesCount(movie_info, args);
        console.log("~~~");
        console.log(movie_info);
        console.log(roles_match_count);
        if (roles_match_count === 0)
        {
            console.log("roles don't match.");
            return false;
        }
    }

    if (simplifyTitle(movie_info["title"]) !== simplifyTitle(parseTitle(args)))
    {
        console.log("titles don't match");
        return false;
    }

    try
    {
        // We ignore years for series (but will reject if more than one match),
        // since Netflix's June 2015 update now only shows the year that the series
        // was updated on Netflix.  Means that we cannot show ratings for some shows
        // such as Doctor Who.
        if (((movie_info["type"] || null) !== "series") && (movie_info["ignoreYears"] === false)) {
            // The year (or start year) must be within one
            var ajax_years = extlib.parseYearRange(movie_info["year"]);
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
        }
    } catch (ex)
    {
        extlib.stackTrace();
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
    if ((movie_info === null) || (movie_info.nodata === true) || (!infoMatchUi(movie_info, args)))
    {
        if (is_https && !https_supported_)
            $(args["out_head"]).append("<div class='fp_rt_no_https'><br>No HTTPS support for external ratings.</div>");
        else
            $(args["out_head"]).append("<div id='fp_rt_not_found'><br>Could not find external ratings.</div>");
    }
    else
    {
        var imdb = getIMDBHtml(movie_info, '');
        var tomato = getTomatoHtml(movie_info, '');
//        var meta = getMetatcriticHtml(movie_info, '');

        $(args["out_head"]).append(imdb);
        $(args["out_head"]).append(tomato);
  //      $target.append(meta);
    }
}

Object.defineProperty(Element.prototype, 'outerHeight', {
    'get': function()
    {
        var height = this.clientHeight;
        var computedStyle = window.getComputedStyle(this);
        height += parseInt(computedStyle.marginTop, 10);
        height += parseInt(computedStyle.marginBottom, 10);
        height += parseInt(computedStyle.borderTopWidth, 10);
        height += parseInt(computedStyle.borderBottomWidth, 10);
        return height;
    }
});

Element.prototype.documentOffsetTop = function()
{
  return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
};

// Hide elements as necessary so that the most important content fits
function ensureEverythingFits(overviewInfo) {
    var jawBoneElems = $(overviewInfo).closest(".jawBone");
    if (jawBoneElems.length === 0)
        return;
    var menuElems = jawBoneElems[0].getElementsByClassName("menu");
    if (menuElems.length === 0)
        return;


    // We make use of the menubar's vertical space as well (but leave a 5 pixel margin)
    var allowedHeight = menuElems[0].documentOffsetTop() - overviewInfo.documentOffsetTop() + menuElems[0].offsetHeight - 5;
    var actualHeight = overviewInfo.scrollHeight;

    console.log("allowed1: " + menuElems[0].documentOffsetTop());
    console.log("allowed2: " + overviewInfo.documentOffsetTop());
    console.log("allowed3: " + menuElems[0].offsetHeight || 0);
    console.log(".fp_links: ");
    console.log($(".fp_links"));

    console.log("allowedHeight = " + allowedHeight);
    console.log("actualHeight = " + actualHeight);

    if (actualHeight > allowedHeight)
    {
        var elems = overviewInfo.getElementsByClassName("user-evidence");
        if (elems.length) {
            actualHeight = actualHeight - elems[0].outerHeight;
            elems[0].style.display = "none";
            console.log("hid user-evidence");
            console.log("new actualheight is " + actualHeight);
        }
    }

    if (actualHeight > allowedHeight)
    {
        var elems = overviewInfo.getElementsByClassName("listMeta");
        if (elems.length > 0) {
            var tagElems = elems[0].getElementsByTagName("p");
            if (tagElems.length)
            {
                var elemsArray = [].slice.call(tagElems);
                for (var tagIndex = elemsArray.length - 1; tagIndex >= 0; tagIndex--)
                {
                    if (actualHeight > allowedHeight)
                    {
                        actualHeight -= tagElems[tagIndex].offsetHeight;
                        console.log("new actualheight is " + actualHeight);
                        tagElems[tagIndex].style.display = "none";
                        console.log("hid listmeta p");
                    }
                }
                var tags = elems[0].getElementsByTagName("p");
                if (tags.length === 0)
                {
                    actualHeight -= elems[0].outerHeight;
                    console.log("new actualheight is " + actualHeight);
                    elems[0].style.display = "none";
                    console.log("hid all listmeta");
                }
            }
        }
    }

    if (actualHeight > allowedHeight)
    {
        var elems = overviewInfo.getElementsByClassName("fp_external_ratings");
        if (elems.length) {
            console.log("hid fp_external_ratings");
            console.log(elems[0].outerHeight);
            actualHeight = actualHeight - elems[0].outerHeight;
            console.log("new actualheight is " + actualHeight);
            elems[0].style.display = "none";
        }
    }
}

// Clear old ratings and unused content.
function clearOld(args) {
    var $target = $(args["out_head"]);
    $target.find('.ratingPredictor').remove();
    $target.find('.fp_rt_rating_link').remove();
    $target.find('#fp_rt_spinner_div').remove();
    $target.find('#fp_rt_not_found').remove();
    $target.find('.fp_rt_no_https').remove();
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
    return html;
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
        return html;
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

    return html;
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

var createRatingElemsDiv = function(head) {
    // Don't create more than one
    console.log(head.getElementsByClassName("fp_external_ratings"));
    if (head.getElementsByClassName("fp_external_ratings").length !== 0) {
        return null;
    }

    var out_heads = [head];
    if (!head.classList.contains("jawbone-overview-info"))
        out_heads = head.getElementsByClassName("jawbone-overview-info");

    var ratingsDiv = document.createElement("div");
    ratingsDiv.className = "fp_external_ratings";
    var metaElems = out_heads[0].getElementsByClassName("meta");
    if (metaElems.length)
    {
        $(metaElems[0]).after(ratingsDiv);
    } else
    {
        ratingsDiv = null;
    }
    return ratingsDiv;
};

$(document).ready(function() {
    extlib.addStyle("fp_rt_rating_overlay", chrome.extension.getURL('../src/css/ratings.css'));

    console.log("starting!");

    var is_https = (window.location.protocol === "https:");

    if (!(is_https && !https_supported_)) {
        document.body.arrive(".jawBone", { fireOnAttributesModification: true }, function()
        {
            var movie_id = $(this).closest(".jawBoneContainer")[0].id;
            var self;
            var overviewInfos = this.getElementsByClassName("jawbone-overview-info");
            if (overviewInfos.length)
            {
                var ratingsDiv = createRatingElemsDiv(overviewInfos[0]);
                if (ratingsDiv !== null)
                {
                  var args = {"parse_head" : this, "out_head" : ratingsDiv };
                    console.log(args);
                    getRating(args, false, function(movie_info)
                    {
                        displayRating(movie_info, is_https, args);
                        // Cache movie info and don't require that year and roles match
                        movie_info.ignoreRoles = true;
                        movie_info.ignoreYears = true;
                        movie_info_cached_[movie_id] = movie_info;

                        console.log("displayRating - 2");
                        ensureEverythingFits(overviewInfos[0]);
                        document.body.arrive(".fp_links", function() {
                            console.log("fp_links arrive");
                            ensureEverythingFits(overviewInfos[0]);
                        });
                    });
                }
            } else {
                console.log("overviewInfos.length was zero");
            }
            var jawBoneElem = this;
            this.arrive(".jawbone-overview-info", { fireOnAttributesModification: true }, function()
            {
//                console.log("arrived - .jawbone-overview-info!");

                var movie_id = $(this).closest(".jawBoneContainer")[0].id;
                console.log("movie_id2 = " + movie_id);

                if ((movie_info_cached_[movie_id] || null) !== null)
                {
                    var ratingsDiv = createRatingElemsDiv(this);
                    if (ratingsDiv !== null)
                    {
                      var args = {"parse_head" : jawBoneElem, "out_head" : ratingsDiv };
                        displayRating(movie_info_cached_[movie_id], is_https, args); // redisplay as needed
                        ensureEverythingFits(this);
                        document.body.arrive(".fp_links", function() {
                            console.log("fp_links arrive");
                            ensureEverythingFits(overviewInfos[0]);
                        });
                    }
                }
            });
        });
    }

    var changeMenuPointerLogic = function(elem)
    {
        try {
            elem.style.pointerEvents = "none";
            var tagElems = elem.getElementsByTagName("li");
            [].slice.call(tagElems).forEach(function(tagElem) {
                tagElem.style.pointerEvents = "all";
            });
        } catch (ex) {
            console.error(ex);
        }
    };

    document.body.arrive(".menu", function() {
        changeMenuPointerLogic(this);
    });
    $(".menu").each(function(index, value) { changeMenuPointerLogic(this); });

    [].slice.call($(".jawBone")).forEach(function(ratingArea)
    {
        console.log("jawbone ready");
        var ratingsDiv = createRatingElemsDiv(ratingArea);
        if (ratingsDiv)
        {
            console.log("ratingsdiv exists");
            var args = {"parse_head" : ratingArea, "out_head" : ratingsDiv };

            if (is_https && !https_supported_)
            {
                console.log("won't work since https");
                $(args["out_head"]).append("<div class='fp_rt_no_https'><br>No https support for Rotten Tomatoes / IMDB ratings.</div>");
            } else
            {
                console.log("getRating");
                getRating(args, false, function(movie_info)
                {
                    var movie_id = $(ratingArea).closest(".jawBoneContainer")[0].id;
                    console.log("movie_id0 = " + movie_id);
                    console.log("displayRating - 1");
                    displayRating(movie_info, is_https, args);

                    // Cache movie info and don't require that year and roles match
                    movie_info.ignoreRoles = true;
                    movie_info.ignoreYears = true;
                    movie_info_cached_[movie_id] = movie_info;

                    var overviewInfos = ratingArea.getElementsByClassName("jawbone-overview-info");
                    if (overviewInfos.length) {
                        ensureEverythingFits(overviewInfos[0]);
                        document.body.arrive(".fp_links", function() {
                            console.log("fp_links arrive3");
                            ensureEverythingFits(overviewInfos[0]);
                        });
                    }
                });
            }
        }
    });
});
