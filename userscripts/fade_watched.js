// fade_watched userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib.js, extlib.js
//
// This script will make AJAX requests to get a Netflix user's watched history.
// When making changes to this code, consider also making them in fade_rated.js
//
// Note: this is a copy-paste of faderated right now with a few additions for
// watch-specific logic in the main code and a search/replace of ratingItems
// to viewedItems.

var keyPrefix_ = "flix_plus " + fplib.getProfileName() + " ";

// Make multiple async AJAX requests to get recent Netflix rating history
// Parameters for settings include:
//  startTime: earliest time to get data for
//  netflixApiBase: URL for Netflix API (extract from existing webpages)
//  authURL: authentication to use Netflix API (extract from existing webpages)
//  pageNo: used within next query.  Defaults to 0.
//  resultsJSON: results from a query.  viewedItems will get updated after multiple requests (but other fields will)
//               be data from first request.  Created after first call to method.
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
        console.log(settings.resultsJson.viewedItems);
        settings.resultsJson.viewedItems = settings.resultsJson.viewedItems.concat(json.viewedItems);
      }
      if (((json.viewedItems || []).length === 0) ||
          ((new Date(json.viewedItems[json.viewedItems.length - 1].date).getTime()) < settings.startTime))
        pastStartTime = true;  // This will be our last call.

      if ((!pastStartTime) && (json.size === json.viewedItems.length)) {
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

  console.log("createUniqueIdsDict");
  console.log(resultsJson);

  for (var i = 0; i < idArray.length; i++) {
    if (idArray[i].trim() !== "")
      dict[idArray[i]] = true;
  }

  if ((resultsJson === null) || (resultsJson.viewedItems === null))
    return dict;

  for (var i = 0; i < resultsJson.viewedItems.length; i++) {
    if (matchesFilter(resultsJson.viewedItems[i])) {
      var idField = ((resultsJson.viewedItems[i].series || null) !== null) ? "series" : "movieID";
      dict[resultsJson.viewedItems[i][idField]] = true;
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

var initCss = function(name, defaultVal) {
  var keysDict = {};
  keysDict[keyPrefix_ + name + "_style"] = defaultVal;
  fplib.syncGet(keysDict, function(items) {
    fplib.definePosterCss(name, items[keyPrefix_ + name + "_style"]);
  });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

fplib.showProgressBar("fade_watched");

initCss("fp_watched", "fade");

var ignoreTv_ = localStorage[keyPrefix_ + "fp_ignore_tv"] !== "false";
var obj = {};
obj[keyPrefix_ + "fp_ignore_tv"] = ignoreTv_;

chrome.storage.sync.get(obj, function(items) {
  var newIgnoreTv = items[keyPrefix_ + "fp_ignore_tv"];

  // If changed, clear out history
  if (ignoreTv_ !== newIgnoreTv) {
    delete localStorage[keyPrefix_ + "viewingactivity_last_checked"];
    console.log("viewing history changed since ignoreTv is now " + newIgnoreTv);
  }

  // We store the ignoreTv value used to load data in localStorage
  if (ignoreTv_ !== newIgnoreTv) {
    localStorage[keyPrefix_ + "fp_ignore_tv"] = newIgnoreTv;
    ignoreTv_ = newIgnoreTv;
  }

  var keyName = keyPrefix_ + "viewingactivity";
  extlib.checkForNewData([keyName],
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
                         apiMethod: "viewingactivity" + '/' + fplib.parseEmbeddedJson(html, "/viewingactivity"),
                         authUrl: fplib.getAuthUrl()
                       }, function(results) {
                          console.log("concatenated results:");
                          console.log(results);

                          var uniqueArray = updateUniques(keyName, results, function(result) {
                            return ignoreTv_ ? ((result.series || null) === null) : true;
                          });

                          console.log(keyName + " counts = " + uniqueArray.length);

                          callback([uniqueArray.toString()]);
                      }
            ); // getHistory
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
      $.each($(".fp_watched"), function(index, value) { this.classList.remove("fp_watched"); });

      var idsArray = datas[0].split(",");
      fplib.applyClassnameToPosters(idsArray, "fp_watched");
      fplib.applyClassnameToPostersOnArrive(idsArray, "fp_watched");

      if (callback !== null)
        callback();
    }, function() {  // all done
      fplib.hideProgressBar("fade_watched");
    }
  );
});
