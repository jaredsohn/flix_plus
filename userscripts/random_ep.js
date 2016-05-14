// random_ep userscript for Netflix
// Code was originally random-flix v0.2 found at https://github.com/ayan4m1/random-flix/blob/master/src/main.js; MIT license
// Updated substantially (works with player, finds random episode across seasons, works with newer Netflix) by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js
//
// TODO: there is some code to allow advanced random options; it has been removed but available in github's history (look for July 2015)


var keyPrefix_ = "flix_plus " + fplib.getProfileName() + " ";

var randomInProgress_ = false;

var playRandomFromPlayer = function() {
  if (randomInProgress_) {
    console.log("Random already in progress...");
    return;
  }

  console.log("playing random...");

  var restrictToSeason = false;

  randomInProgress_ = true;

  var episodeCount = 0;
  var seasonEpisodeCounts = [];
  var seasonElems = Array.prototype.slice.call($(".season"));
  console.log("seasons are:");
  console.log(seasonElems);
  seasonElems.forEach(function(seasonElem) {
    seasonElem.click();
    var count = $(".episode-list-item-header").length;
    var seasonName = seasonElem.getElementsByTagName("span")[0].innerHTML;
    console.log("looking at season '" + seasonName + "'");
    if ((restrictToSeason === false) || (seasonName === restrictToSeason)) {
      episodeCount += count;
      seasonEpisodeCounts.push(count);
    }
  });
  if (episodeCount <= 1) {
    console.log("Not playing random since episode count is zero.");
    randomInProgress_ = false;
    return;
  }
  var rnd = Math.floor(Math.random() * episodeCount);
  var seasonElemsLength = seasonElems.length;
  for (var i = 0; i < seasonElemsLength; i++) {
    var seasonName = seasonElems[i].getElementsByTagName("span")[0].innerHTML;
    if ((restrictToSeason === false) || (seasonName === restrictToSeason)) {
      if (rnd >= seasonEpisodeCounts[i]) {
        rnd = rnd - seasonEpisodeCounts[i];
      } else {
        console.log(i);
        console.log(rnd);
        seasonElems[i].click();
        setTimeout(function() { // we wait until we can assume the episode list has loaded
          try {
            ($(".episode-list-title")[rnd]).click();
            ($(".episode-list-title")[rnd]).click(); // requires clicking twice for some reason

            //TODO: needs to wait until it actually starts playing
            //if (randomSettings_["rewindBeforePlaying"] || false)
            //  injectJs("netflix.cadmium.objects.videoPlayer().seek(0);");

          } catch (ex) {
          }
          randomInProgress_ = false;
        }, 1500); // wait after clicking the season before clicking the episode.  Could instead just save the list of URLs maybe.
        break;
      }
    }
  };
};

var injectJs = function(js) {
  var scriptNode = document.createElement("script");
  scriptNode.innerText = js; // "setTimeout(function() {" + js + "}, 2000);"
  document.body.appendChild(scriptNode);
};

/////////////////////////////////////////////////////////////////////////////////////

// Create a hidden div so that keyboard shortcuts can play a new random episode within player
var elem = document.createElement('div');
elem.id = "fp_random_episode";
document.body.appendChild(elem);
$(elem).on('click', function() {
  playRandomFromPlayer();
});

/////////////////////////////////////////////////////////////////////////////////////
// Details UI code

// from stackoverflow
var insertAfter = function(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

var getSeasonList = function(showId, callback) {
  var html = document.documentElement.outerHTML;
  var netflixApiBase = "https://www.netflix.com/api" + fplib.parseEmbeddedJson(html, "API_BASE_URL") + '/pathEvaluator/' + fplib.parseEmbeddedJson(html, "/pathEvaluator")
  var url = netflixApiBase + '?withSize=true&materialize=true&model=' + fplib.parseEmbeddedJson(html, "gpsModel") + '&esn=www';
  var postDataJson = {"paths":[],"authURL":fplib.getAuthUrl()};
  postDataJson.paths.push(["videos",showId,"seasonList",{"from":0,"to":20},"summary"])
  postData = JSON.stringify(postDataJson);

  console.log("url = ");
  console.log(url);
  jQuery.post(url, postData, function(json) {
    console.log("getseasonlist results = ");
    console.log(json);
    var seasons = Object.keys(json.value.seasons).filter(function(season) {
      return ((json.value.seasons[season].summary || null) !== null);
    });
    console.log("seasons are");
    console.log(seasons);
    callback(seasons);
  },"json");
};

// Here, seasonFilter is a method that takes the ajax query output and a season id returns true if the season's
// episodes should be included
var getEpisodeList = function(seasons, seasonFilter, callback) {
  var html = document.documentElement.outerHTML;
  var netflixApiBase = "https://www.netflix.com/api" + fplib.parseEmbeddedJson(html, "API_BASE_URL") + '/pathEvaluator/' + fplib.parseEmbeddedJson(html, "/pathEvaluator")
  var url = netflixApiBase + '?withSize=true&materialize=true&model=' + fplib.parseEmbeddedJson(html, "gpsModel") + '&esn=www';
  console.log("url = ");
  console.log(url);
  var postDataJson = {"paths":[],"authURL":fplib.getAuthUrl()};
  seasons.forEach(function(season) {
    var elem = (["seasons", season, "episodes",[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,"-1"], ["title","bookmarkPosition"]]);
    postDataJson.paths.push(elem);
  });
  console.log(postDataJson);
  postData = JSON.stringify(postDataJson);


  // Make request and collect episodes
  jQuery.post(url, postData, function(json) {
    var allEpisodes = [];
    seasons.forEach(function(season) {
      if ((seasonFilter === null) || (seasonFilter(json, season))) {
        var episodes = json.value.seasons[season].episodes;
        episodeKeys = Object.keys(episodes).filter(function(episodeIndex) {
          return Array.isArray(episodes[episodeIndex]);
        });
        console.log("episodekeys length = " + episodeKeys.length);
        console.log("all episodes length = " + allEpisodes.length);
        episodeKeys.forEach(function(episodeKey) {
          console.log(".");
          allEpisodes.push(episodes[episodeKey]);
        });
        console.log("all episodes length (updated) = " + allEpisodes.length);
      }
    });
    console.log("all episodes length (final?) = " + allEpisodes.length);
    console.log(allEpisodes);

    callback(allEpisodes);
  }, "json");
};

// TODO: also support .billboard-pane-episodes
document.body.arrive(".jawBone .episodeWrapper", function() {
  var showId = $(this).closest(".jawBoneContainer")[0].id;
  var self = this;
  console.log("arrived:");
  console.log(self);
  // We remove all other episodeWrappers for this title because our addition of random buttons causes Netflix
  // to remove them instead of the old episodeWrapper.
  self.classList.add("fp_temp");
  var episodeWrappers = self.parentNode.getElementsByClassName("episodeWrapper");
  [].slice.call(episodeWrappers).forEach(function(episodeWrapper) {
    if (!episodeWrapper.classList.contains("fp_temp")) {
      if (episodeWrapper !== this)
        self.parentNode.removeChild(episodeWrapper);
    }
  });
  self.classList.remove("fp_temp");

  if (this.parentNode.getElementsByClassName("fp_random_buttons").length === 0) {
    var divElem = document.createElement("div");
    divElem.classList.add("fp_random_buttons");

    var sameSeasonButton = extlib.createButton("fp_random_sameseason_button", "Play Random Episode (Same Season)", true, function(e) {
      e.preventDefault();
      e.stopPropagation();

      var firstLoadedEpisodeId = self.getElementsByClassName("episodePlay")[0].href.split("?")[0].split("/").pop();
      console.log('first loaded episode id is ' + firstLoadedEpisodeId);
      console.log("showid is " + showId);

      getSeasonList(showId, function(seasons) {
        console.log("seasons is");
        console.log(seasons);
        getEpisodeList(seasons, function(json, season) {
          console.log("season is");
          console.log(season);
          // Match the seasonFilter only if the first visible episode is found within the query results
          var matchFound = false;
          var episodes = json.value.seasons[season].episodes;
          console.log(episodes);
          episodeKeys = Object.keys(episodes);
          episodeKeys.some(function(episodeKey) {
            if (Array.isArray(episodes[episodeKey])) {
              console.log(episodes[episodeKey][1])
              if (episodes[episodeKey][1] === firstLoadedEpisodeId) {
                console.log("match found!!");
                matchFound = true;
                return true;
              }
            }
          });
          return matchFound;
        }, function(episodes) {
          playRandomEpisode(episodes, null);
        });
      });
    });

    var allSeasonsButton = extlib.createButton("fp_random_allseasons_button", "Play Random Episode (All Seasons)", true, function(e) {
      e.preventDefault();
      e.stopPropagation();

      getSeasonList(showId, function(seasons) {
        getEpisodeList(seasons, null, function(episodes) {
          playRandomEpisode(episodes, null);
        });
      });
    });

    var playRandomEpisode = function(episodes, callback) {
      console.log("episode count is " + episodes.length);
      if (episodes.length !== 0) {
        var randomIndex = Math.floor(Math.random() * episodes.length);
        var episodeId = episodes[randomIndex][1];
        console.log("random episode is " + episodeId);
        window.location.href = window.location.protocol + "//www.netflix.com/watch/" + episodeId;

        // This likely won't matter since the page will change.
        if (callback !== null)
          callback(episodeId);
      }
    };

    divElem.appendChild(sameSeasonButton);
    divElem.appendChild(allSeasonsButton);
    insertAfter(divElem, this.parentNode.getElementsByClassName("nfDropDown")[0]);
  }
});

