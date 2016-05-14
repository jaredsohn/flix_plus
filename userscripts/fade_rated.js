// fade_rated userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib.js, extlib.js
//
// This script will make AJAX requests to get a Netflix user's rating history.
// When making changes to this code, consider also making them in fade_watched.js

var keyPrefix_ = "flix_plus " + fplib.getProfileName() + " ";

// Make multiple async AJAX requests to get recent Netflix rating history
// Parameters for settings include:
//  startTime: earliest time to get data for
//  netflixApiBase: URL for Netflix API (extract from existing webpages)
//  authURL: authentication to use Netflix API (extract from existing webpages)
//  pageNo: used within next query.  Defaults to 0.
//  resultsJSON: results from a query.  ratingItems will get updated after multiple
//               requests (but other fields will) be data from first request.
//               Created after first call to method.
// The callback will be returned when all data has been collected.
var getHistory = function(settings, callback) {
  if ((settings === null) ||
      ((settings.apiMethod || null) === null) ||
      ((settings.netflixApiBase || null) === null) ||
      ((settings.authUrl || null) === null)) {

    callback(null);
    return;
  }

  if ((settings.pageNo || null) === null)
    settings.pageNo = 0;

  if ((settings.startTime || null) === null)
    settings.startTime = 0;

  var url = settings.netflixApiBase + "/" + settings.apiMethod + "?pg=" + settings.pageNo + "&authURL=" + settings.authUrl + "&_retry=0";
  console.log(url);

  $.ajax({
    url: url,
    cache: false,
    success: function(json) {
      var pastStartTime = false;

      if ((settings.resultsJson || null) === null)
        settings.resultsJson = json;
      else {
        console.log(settings.resultsJson.ratingItems);
        settings.resultsJson.ratingItems = settings.resultsJson.ratingItems.concat(json.ratingItems);
      }
      if (((json.ratingItems || []).length === 0) ||
          ((new Date(json.ratingItems[json.ratingItems.length - 1].date).getTime()) < settings.startTime))
        pastStartTime = true;  // This will be our last call.

      if ((!pastStartTime) && (json.size === json.ratingItems.length)) {
        settings.pageNo++;
        getHistory(settings, callback);
      }
      else
        callback(settings.resultsJson || null);
    }
  });
};

// Note that this method includes code specific to the response from Netlix AJAX calls
var createUniqueIdsDict = function(idArray, resultsJson, matchesFilter) {
  var dict = {};

  for (var i = 0; i < idArray.length; i++) {
    if (idArray[i].trim() !== "")
      dict[idArray[i]] = true;
  }

  if ((resultsJson === null) || (resultsJson.ratingItems === null))
    return dict;

  for (var i = 0; i < resultsJson.ratingItems.length; i++) {
    if (matchesFilter(resultsJson.ratingItems[i])) {
      var idField = ((resultsJson.ratingItems[i].series || null) !== null) ? "series" : "movieID";
      dict[resultsJson.ratingItems[i][idField]] = true;
    }
  }

  return dict;
};

var updateUniques = function(keyName, results, matchesFilter) {
  var prevArray = (localStorage[keyName] || "").split(",");

  var updatedArray = Object.keys(createUniqueIdsDict(prevArray, results, matchesFilter));
  localStorage[keyName] = updatedArray;
  return updatedArray;
}

// TODO: merge into definePosterCss???
var initCss = function(name, defaultVal) {
  var keysDict = {};
  keysDict[keyPrefix_ + name + "_style"] = defaultVal;
  fplib.syncGet(keysDict, function(items) {
    fplib.definePosterCss(name, items[keyPrefix_ + name + "_style"]);
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

fplib.showProgressBar("fade_rated");

initCss("fp_rated", "fade");
initCss("fp_rated_notinterested", "hide");

var keyName = keyPrefix_ + "ratingactivity";
extlib.checkForNewData([keyName, keyName + "_notinterested"],
  5 * 60, // five minutes
  7 * 24 * 60 * 60, // one week
  function(historyLastChecked, callback) { // request data if stale
    try {
      jQuery.ajax({
        url: window.location.protocol + "//www.netflix.com/WiViewingActivity",
        cache: false,
        success: function(html) {
          var netflixApiBase = "https://www.netflix.com/api" + fplib.parseEmbeddedJson(html, "API_BASE_URL");
          console.log("netflixApiBase = " + netflixApiBase);
          getHistory({ startTime: historyLastChecked,
                       netflixApiBase: netflixApiBase,
                       apiMethod: "ratinghistory" + '/' + fplib.parseEmbeddedJson(html, "/ratinghistory"),
                       authUrl: fplib.getAuthUrl()
                     }, function(results) {
                        console.log("concatenated results:");
                        console.log(results);

                        var notInterestedArray = updateUniques(keyName + "_notinterested", results, function(result) {
                          return ((result.yourRating === -3) || (result.yourRating === 1));
                        });
                        var uniqueArray = updateUniques(keyName, results, function(result) {
                          return true;
                        });

                        console.log(keyName + " counts = " + uniqueArray.length + ", " + notInterestedArray.length);

                        callback([uniqueArray.toString(), notInterestedArray.toString()]);
                    }
          );
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error(errorThrown);
        }
      });
    } catch (ex) {
      console.error(ex);
    }
  }, function(datas, callback) { // update UI based on data
    console.log(datas);

    // Remove class from existing elements in case something was removed
    $.each($(".fp_rated"), function(index, value) { this.classList.remove("fp_rated"); });

    var idsArray = datas[0].split(",");
    fplib.applyClassnameToPosters(idsArray, "fp_rated");
    fplib.applyClassnameToPostersOnArrive(idsArray, "fp_rated");

    idsArray = datas[1].split(",");
    fplib.applyClassnameToPosters(idsArray, "fp_rated_notinterested");
    fplib.applyClassnameToPostersOnArrive(idsArray, "fp_rated_notinterested");

    if (callback !== null)
      callback();
  }, function() {  // all done
    fplib.hideProgressBar("fade_rated");
  }
);
