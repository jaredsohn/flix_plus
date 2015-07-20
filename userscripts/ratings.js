// Original source: https://github.com/joshblum/netflix-rate-chrome-ext/blob/master/js/ratings.js
// Heavily rewritten by jaredsohn-lifehacker to:
//
//  1. prevent displaying wrong rating by comparing title/year with ui before updating
//  2. improve accuracy of matches by
//      -- only matching movies with movies and tv series with tv series
//      -- created a simplified version of a title and compare against that
//      -- do searches of original and simplified titles and check all returned results
//      -- look at roles and other information to deal with choose among multiple matches
//  3. update to work with Netflix June 2015 UI; show progress via spinner; indicate if no match is found
//  4. remove support for DVDs
//  5. support HTTPS via support from background page or warn that it is not supported
//  6. show rotten ratings even if only one type found
//  7. not pollute localstorage or css classes
//
// Note: The metacritic code here came from a newer version of joshblum's script and has not been tested yet.  One issue is that omdbapi
// does not include metacritic URLs, so to include links additional code would be needed.

"use strict";

var keyName_ = "flix_plus " + fplib.getProfileName() + " ratings2";
var IMDB_API = "http://www.omdbapi.com/?tomatoes=true";
var TOMATO_LINK = "http://www.rottentomatoes.com/alias?type=imdbid&s=";
var IMDB_LINK = "http://www.imdb.com/title/";

var CACHE = localStorage[keyName_];
if (typeof(CACHE) === "undefined")
  CACHE = {};
else
  CACHE = JSON.parse(CACHE);

var CACHE_LIFE = 1000 * 60 * 60 * 24 * 7 * 2; //two weeks in milliseconds

var isHttps_ = (window.location.protocol === "https:");
var httpsSupported_ = true; // Not true if using this as a userscript
var movieInfoCached_ = {}; // id: movieInfo; only stored in memory

//////////// CACHE //////////////

function addCache(uiData, movieInfo) {
  if ((movieInfo === null) || (movieInfo["nodata"] === true)) // We don't cache when the movie wasn't found
    return null;

  var compactMovieInfo = {};
  var fields = ["title", "year", "type", "date", "imdbID", "imdbScore", "tomatoMeter", "tomatoUserMeter", "metaScore"];
  fields.forEach(function(field) {
    compactMovieInfo[field] = movieInfo[field];
  });

  var key = uiData["title"] + "_" + uiData["year"] + "_" + uiData["type"];

  CACHE[key] = compactMovieInfo;
  localStorage[keyName_] = JSON.stringify(CACHE);

  return movieInfo;
}

function checkCache(title, year, type) {
  var key = title + "_" + year + "_" + type;
  console.log("checking cache - " + key);

  if (!(key in CACHE))
    return null;

  // Return cached value if not expired
  var cachedValue = ((new Date().getTime() - CACHE[key].date) <= CACHE_LIFE) ? CACHE[key] : null;

  if (cachedValue)
    console.log("found in cache!");

  return cachedValue;
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
  return ($(".Episodes", $(args["parse_head"]))).length ? "series" : "movie";
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
function getViaBackgroundPage(url, callback) {
  chrome.runtime.sendMessage({"request_type": "get", "url": url}, function(response) {
    callback(response["data"]);
  });
}

function getMovieInfo(url, callback) {
  console.log(url);
  var movieInfo = {};

  getViaBackgroundPage(url, function(res) {
    console.log(res);
    try {
      var omdbJson = res;
      movieInfo = parseMovieInfo(omdbJson);
    } catch (ex) {
      console.error(ex);
    }
    callback(movieInfo);
  });
}

function getAllMovieInfos(title, args, callback) {
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
        if (simplified.toLowerCase() === title.toLowerCase()) {
          callback2(null, null);
        } else {
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

      var searchRequestDatas_ = [];
      var dict = {};

      function collectUniqueSearchRequests(elem) {
        if ((dict[elem.imdbID] || null) === null) {
          searchRequestDatas_.push(elem);
          dict[elem.imdbID] = true;
        }
      }
      if (searchJson0 && (searchJson0.Search || null)) {
        [].slice.call(searchJson0.Search).forEach(collectUniqueSearchRequests);
      }
      if (searchJson1 && (searchJson1.Search || null)) {
        [].slice.call(searchJson1.Search).forEach(collectUniqueSearchRequests);
      }

      console.log("search results");
      console.log(searchRequestDatas_);

      if (searchRequestDatas_.length) {
        async.map(searchRequestDatas_, function(searchRequestData, callback3) {
          searchRequestData["type"] = searchRequestData["Type"];
          if (!infoMatchUiType(searchRequestData, args)) // don't bother if not of appopriate type
            callback3(0, null);
          else {
            getMovieInfo(getForIdIMDBAPI(searchRequestData["imdbID"]), function(movieInfo) {
              if (infoMatchUi(movieInfo, args) === false)
                callback3(0, null);
              else if (((movieInfo["type"] || null) !== "series") && (infoMatchUiRolesCount(movieInfo, args) === 0))
                callback3(0, null);
              else
                callback3(0, movieInfo);
            });
          }
        }, function(err, results) {
          console.log("getallmovieinfos");
          console.log(results);

          var matches = [];
          [].slice.call(results).forEach(function(result) {
            if (result && (result.nodata === false))
              matches.push(result);
          });
          callback(matches);
        });
      } else {
        callback(null);
      }
    }
  );
}

// Search for the title, first in the CACHE and then through the API
function getRating(args, cacheOnly, callback) {
  var uiData = getUiData(args);

  var $target = $(args["out_head"]);
  var spinner = "<div id='fp_rt_spinner_div'>Looking up external ratings...<br><img class='fp_button fp_rt_spinner' src='" + chrome.extension.getURL('../src/img/ajax-loader.gif') + "'><br><br><br></div>";
  $target.append(spinner);

  var cached = checkCache(uiData["title"], uiData["year"], uiData["type"]);

  if (cached !== null) {
    callback(cached);
    return;
  }

  if (cacheOnly) {
    console.log("quitting since cache-only mode is in effect");
    callback(null);
    return;
  }
  if (uiData["type"] !== "series") {
    getMovieInfo(getIMDBAPI(simplifyTitleForSearch(uiData["title"]), uiData["year"]), function(movieInfo) {
      console.log(movieInfo);

      if ((movieInfo !== null) && infoMatchUi(movieInfo, args)) {
        addCache(uiData, movieInfo);
        callback(movieInfo);
      } else
        getRatingWithSearch(uiData, args, callback);
    });
  } else { // Don't bother a direct search for tv series since the API doesn't work right for that
    getRatingWithSearch(uiData, args, callback);
  }
}

function getRatingWithSearch(uiData, args, callback) {
  // If not a good match doing a naive lookup, then find all similar titles and find the best match
  getAllMovieInfos(uiData["title"], args, function(movieInfos) {
    console.log(movieInfos);

    // If there is more than one match, we treat it like there are no matches
    var bestInfo = (movieInfos && (movieInfos.length === 1))
      ? movieInfos[0]
      : {"title" : uiData["title"], "year": uiData["year"], "type": uiData["type"], "nodata": true, "data": new Date().getTime()};
    addCache(uiData, bestInfo);
    callback(bestInfo);
  });
}

function parseMovieInfo(omdbJson) {
  if ((omdbJson === null) || (omdbJson["Response"] === "False"))
    return null;
  if ((omdbJson["Type"] === "episode") || (omdbJson["Type"] === "game") || (omdbJson["Type"] === "N/A"))
    return null;

  var info = {
    title: omdbJson["Title"] || null,
    year: omdbJson["Year"] || null,
    imdbID: omdbJson["imdbID"] || null,
    imdbScore: parseFloat(omdbJson["imdbRating"]),
    tomatoMeter: getTomatoScore(omdbJson, "tomatoMeter"),
    tomatoUserMeter: getTomatoScore(omdbJson, "tomatoUserMeter"),
    metacriticScore: getTomatoScore(omdbJson, "Metascore"),
    date: new Date().getTime(),
    type: omdbJson["Type"],
    roles: {
      actors: getRolesArray(omdbJson, "Actors"),
      directors: getRolesArray(omdbJson, "Director"),
      creators: getRolesArray(omdbJson, "Creator")
    },
    rated: omdbJson["Rated"],
    nodata: false,
    ignoreRoles: false,
    ignoreYears: false
  };

  console.log("parsed movie info");
  console.log(info);

  return info;
}

// parse tomato rating from api response object
function getTomatoScore(res, meterType) {
  return ((typeof(res[meterType]) === "undefined") || res[meterType] === "N/A") ? null : parseInt(res[meterType]);
}

function getRolesArray(jsonObj, field) {
  var rolesArray = [];
  if ((jsonObj[field] || null) !== null)
    rolesArray = jsonObj[field].split(",");
  rolesArray.forEach(function(role) {
    role = role.trim();
  });

  return rolesArray;
}

function getUiData(args) {
  var uiData = {
    "title": parseTitle(args),
    "year": parseYear(args),
    "roles": parseRoles(args),
    "type": parseType(args)
  };

  return uiData;
}

// Remove/change the string to create a simpler version for comparison against
function simplifyTitle(title) {
  if ((typeof(title) === "undefined") || (title === null))
    return "";

  var title = title.trim().toLowerCase();
  if (title.indexOf("the ") === 0)
    title = title.substring(4);

  if (title.indexOf("classic ") === 0)
    title = title.substring(8);

  var removeStrs = ["the movie", "unrated version", "(u.s.)", "(u.k.)", "(original series)"];
  removeStrs.forEach(function(str) {
    title = title.replace(str, "");
  });

  title = title.replace(" & ", " and ");

  if (extlib.endsWith(title, "collection"))
    title = title.substring(0, title.length - 11);

  if (extlib.endsWith(title, ": the series"))
    title = title.substring(0, title.length - 12);

  title = title.trim();

  var punctuationless = title.replace(/[^\w ]/g, "");
  return punctuationless.replace(/\s{2,}/g, " ").trim();
}

function simplifyTitleForSearch(title) {
  var simple = simplifyTitle(title);
  return simple.replace(" and ", " ");
}

///////////////// DISPLAY RATINGS ////////////////

function infoMatchUiType(movieInfo, args) {
  var matches = (parseType(args) === movieInfo["type"]);
  if (!matches)
    console.log("types don't match");
  return matches;
}

function infoMatchUiRolesCount(movieInfo, args) {
  return 1; // Comparing roles might not be necessary.  There are several movies where it doesn't return
            // results just because Netflix and OMDB list a different set of actors. (such as Knights of Badassdom)
/*
  console.log("comparing roles");
  console.log(movieInfo);

  if ((movieInfo.roles || null) == null)
    return 1;

  var uiRoles = parseRoles(args);
  var ajaxRoles = movieInfo.roles;
  var matchCount = 0;

  console.log("uiRoles: ~~~~");
  console.log(uiRoles);

  console.log("ajaxRoles: ~~~~");
  console.log(ajaxRoles);

  var matchCountText = "";
  var uiRoles_count = Object.keys(uiRoles["actors"]).length + Object.keys(uiRoles["directors"]).length + Object.keys(uiRoles["creators"]).length;
  var ajaxRoles_count = ajaxRoles["actors"].length + ajaxRoles["directors"].length + ajaxRoles["creators"].length;
  console.log("uiRoles_count = " + uiRoles_count);
  console.log("ajaxRoles_count = " + ajaxRoles_count);

  if ((uiRoles_count === 0) || (ajaxRoles_count === 0))
    return 1; // If either is missing role data we treat it as a low match.
  else {
    // must have at least one match.
    var rolesNames = ["actors", "directors", "creators"];
    for (var i = 0; i < rolesNames.length; i++) {
      var dict = {};

      var keys = Object.keys(uiRoles[rolesNames[i]]);
      var len = keys.length;
      for (var j = 0; j < len; j++) {
        var name = keys[j].toLowerCase().trim();
        dict[name] = true;
      }

      for (var j = 0; j < ajaxRoles[rolesNames[i]].length; j++) {
        var name = ajaxRoles[rolesNames[i]][j].trim();
        if (typeof(dict[name.toLowerCase()]) !== "undefined") {
          matchCountText += name + ", ";
          matchCount += 1;
        }
      }
    }
  }
  console.log('match count is ' + matchCount);
  console.log(matchCountText);

  return matchCount;*/
}


function infoMatchUi(movieInfo, args) {
  if ((movieInfo || null) === null) {
    console.log("No data returned to compare against UI.");
    return false;
  }

  if (!infoMatchUiType(movieInfo, args)) {
    //message already shown by method console.log("types don't match");
    return false;
  }

  var isSeries = ((movieInfo["type"] || null) === "series");

  /*
  // We disable this completely since I think we can find more matches
  // where the roles on Netflix and OMDB vary compared to resolving
  // shows with the same title by matching against roles.
  //
  // Doing this should not result in showing the wrong show since we show
  // nothing when we have more than one match.
  // Below comments assume that this code is still enabled.
  //
  // Netflix (as of June 2015 update) no longer shows roles on the show info page if
  // a series (it is still accessible in the details page, but then we need to do some
  // magic to get at that information.)
  if (!isSeries && !movieInfo.ignoreRoles) {
    console.log("comparing roles");
    var rolesMatchCount = infoMatchUiRolesCount(movieInfo, args);
    console.log(movieInfo);
    console.log(rolesMatchCount);
    if (rolesMatchCount === 0) {
      console.log("roles don't match.");
      return false;
    }
  }*/

  if (simplifyTitle(movieInfo["title"]) !== simplifyTitle(parseTitle(args))) {
    console.log("simplified titles don't match");
    return false;
  }

  var yearsMatch = false;
  try {
    // We ignore years for series (but will reject if more than one match),
    // since Netflix's June 2015 update now only shows the year that the series
    // was updated on Netflix.  Means that we cannot show ratings for some shows
    // such as Doctor Who.
    if (!isSeries && !movieInfo.ignoreYears) {
      // The year (or start year) must be within one
      var ajaxYears = extlib.parseYearRange(movieInfo["year"]);
      var ajaxYearStr = (ajaxYears.length) ? ajaxYears[0].toString().trim() : "";

      if (ajaxYearStr) {
        var ajaxYear = parseInt(ajaxYearStr);
        var uiYear = parseInt(parseYear(args));
        yearsMatch = Math.abs(ajaxYear - uiYear) <= 1;
      }
    } else {
      yearsMatch = true;
    }
  } catch (ex) {
    console.error(ex);
  }
  if (!yearsMatch)
    console.log("years don't match");

  return yearsMatch;
}

//    Build and display the ratings
function displayRating(movieInfo, isHttps, args) {
  console.log(movieInfo);
  clearOld(args);
  if ((movieInfo === null) || (movieInfo.nodata === true) || (!infoMatchUi(movieInfo, args))) {
    if (isHttps_ && !httpsSupported_)
      $(args["out_head"]).append("<div class='fp_rt_no_https'><br>No HTTPS support for external ratings.</div>");
    else
      $(args["out_head"]).append("<div id='fp_rt_not_found'><br>Could not find external ratings.</div>");
  } else {
    var imdb = getIMDBHtml(movieInfo, '');
    var tomato = getTomatoHtml(movieInfo, '');
//        var meta = getMetatcriticHtml(movieInfo, '');

    $(args["out_head"]).append(imdb);
    $(args["out_head"]).append(tomato);
  //      $target.append(meta);
  }
}

Object.defineProperty(Element.prototype, 'outerHeight', {
  'get': function() {
    var height = this.clientHeight;
    var computedStyle = window.getComputedStyle(this);
    height += parseInt(computedStyle.marginTop, 10);
    height += parseInt(computedStyle.marginBottom, 10);
    height += parseInt(computedStyle.borderTopWidth, 10);
    height += parseInt(computedStyle.borderBottomWidth, 10);
    return height;
  }
});

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
function getIMDBHtml(movieInfo, klass) {
  var score = movieInfo.imdbScore;
  var html = $('<a class="fp_rt_rating_link" target="_blank" href="' + extlib.escapeHTML(getIMDBLink(movieInfo.imdbID)) + '"><div class="fp_rt_imdb fp_rt_imdb_icon fp_rt_star_box_giga_star" title="IMDB Rating - ' + movieInfo.title.trim() + '"></div></a>');
  if (!movieInfo.imdbID) {
    html.css('visibility', 'hidden');
  } else {
    if (!score)
      html.find('.fp_rt_imdb').addClass(klass).append("N/A");
    else
      html.find('.fp_rt_imdb').addClass(klass).append(score.toFixed(1));
  }
  return html;
}

function getTomatoHtml(movieInfo, klass) {
  var htmlText = '<a class="fp_rt_rating_link" target="_blank" href="' + extlib.escapeHTML(getTomatoLink(movieInfo.imdbID)) + '">';
  htmlText += '<span class="fp_rt_tomato fp_rt_tomato_wrapper" title="Rotten Tomato Rating - ' + movieInfo.title.trim() + '">';

  if (movieInfo.tomatoMeter)
    htmlText += '<span class="fp_rt_icon fp_rt_tomato_icon fp_rt_med"></span><span class="fp_rt_score fp_rt_tomato_score"></span>';
  if (movieInfo.tomatoUserMeter)
    htmlText += '<span class="fp_rt_icon fp_rt_audience_icon fp_rt_med"></span><span class="fp_rt_score fp_rt_audience_score"></span>';
  htmlText += '</span></a>';

  var html = $(htmlText);

  if ((!movieInfo.tomatoMeter) && (!movieInfo.tomatoUserMeter)) {
    html.css('visibility', 'hidden');
    return html;
  }
  if (movieInfo.tomatoMeter) {
    html.find('.fp_rt_tomato_icon').addClass(getTomatoClass(movieInfo.tomatoMeter)).addClass(klass);
    html.find('.fp_rt_tomato_score').append(movieInfo.tomatoMeter + '%');
  }
  if (movieInfo.tomatoUserMeter) {
    html.find('.fp_rt_audience_icon').addClass(getTomatoClass(movieInfo.tomatoUserMeter)).addClass(klass);
    html.find('.fp_rt_audience_score').append(movieInfo.tomatoUserMeter + '%');
  }

  return html;
}

function getMetatcriticHtml(movieInfo, klass) {
  var html = $('<a class="fp_rt_rating_link" target="_blank" href="#"><span class="fp_rt_metascore fp_rt_metacritic_rating" title="MetaCritic Rating - "' + movieInfo.title + '>' + movieInfo.metacriticScore + '</span>');
  html.find('.metacritic-rating').addClass(getMetacriticClass(movieInfo.metacriticScore));
  if (!movieInfo.metacriticScore) {
    html.css('visibility', 'hidden');
  }
  return html;
}

///////// MAIN /////////////

var createRatingElemsDiv = function(head) {
  // Don't create more than one
  if (head.getElementsByClassName("fp_external_ratings").length !== 0) {
    return null;
  }

  var outHeads = [head];
  if (!head.classList.contains("jawbone-overview-info"))
    outHeads = head.getElementsByClassName("jawbone-overview-info");

  var ratingsDiv = document.createElement("div");
  ratingsDiv.className = "fp_external_ratings";
  var metaElems = outHeads[0].getElementsByClassName("meta");
  if (metaElems.length) {
    $(metaElems[0]).after(ratingsDiv);
  } else {
    ratingsDiv = null;
  }
  return ratingsDiv;
};

$(document).ready(function() {
  extlib.addStyle("fp_rt_rating_overlay", chrome.extension.getURL('../src/css/ratings.css'));

  fplib.addMutationAndNow("ratings - jawbone", {"element": ".jawbone-overview-info"}, function(summaries) {
    summaries.added.forEach(function(elem) {
      var jawBoneContainer = $(elem).closest(".jawBoneContainer")[0];
      var movieId = jawBoneContainer.id;

      var menus = jawBoneContainer.getElementsByClassName("menu");
      [].slice.call(menus).forEach(function(menu) {
        fplib.changeMenuPointerLogic(menu);
      });

      var ratingsDiv = createRatingElemsDiv(elem);
      if (ratingsDiv) {
        var args = {"parse_head" : jawBoneContainer, "out_head": ratingsDiv };
        console.log(args);

        if (isHttps_ && !httpsSupported_) {
          $(args["out_head"]).append("<div class='fp_rt_no_https'><br>No https support for Rotten Tomatoes / IMDB ratings.</div>");
        } else {
          function showMovieInfo(movieInfo) {
            console.log("displayRating (.jawBone)");
            displayRating(movieInfo, isHttps_, args);
            // Cache movie info and don't require that year and roles match
            movieInfo.ignoreRoles = true;
            movieInfo.ignoreYears = true;
            movieInfoCached_[movieId] = movieInfo;

            fplib.ensureEverythingFits(elem);
          }

          if (movieInfoCached_[movieId])
            showMovieInfo(movieInfoCached_[movieId]);
          else
            getRating(args, false, showMovieInfo);
        }
      }
    });
  });
});
