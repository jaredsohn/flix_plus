// fplib - Flix Plus library
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js, fplib.js
//
// This library contains code that is useful to Netflix userscripts
//
// License: MIT, GPL

"use strict";

var fplib = fplib || {};
var fplib_ = function() {
  var self = this;
  var profileName_ = "";

  //////////////////////////////////////////////////////////////////////
  // Mutation Summaries
  //////////////////////////////////////////////////////////////////////
  // We run them via one mutation observer here which should have a
  // significant effect on performance. (When written, codebase had
  // 50 arrives so we only have to look through data once instead of
  // 50 times.)

  // For queries we store a name, query info, and a callback
  var mutationQueryMap_ = {};
  var mutationCallbackMap_ = {};
  var mutationSummaryObserver_ = null;

  this.restartMutationSummary = function() {
    try {
      //consolelog("restartmutationsummary!");
      var queries = [];
      var callbacks = [];
      var keys = Object.keys(mutationQueryMap_);
      keys.forEach(function(key) {
        queries.push(mutationQueryMap_[key] || null);
        callbacks.push(mutationCallbackMap_[key] || null);
      });
      //consolelog(queries);
      if (mutationSummaryObserver_ !== null)
        mutationSummaryObserver_.disconnect();

      //consolelog("creating mutation observer");
      //consolelog("queries is ");
      //consolelog(queries);

      mutationSummaryObserver_ = new MutationSummary({
        callback: function(summaries) {
          for (var i = 0; i < summaries.length; i++) {
            if ((callbacks[i] !== null) && (summaries[i].added.length)) {
              //consolelog("calling callback for '" + keys[i] + "'");
              //consolelog(summaries[i]);

              callbacks[i].call(this, summaries[i]);
            }
          }
        },
        queries: queries
      });
    } catch (ex) {
      console.error(ex);
    }
  };

  // This method will also update a mutation
  this.addMutation = function(mutationName, query, callback) {
    mutationQueryMap_[mutationName] = query;
    mutationCallbackMap_[mutationName] = callback;
    self.restartMutationSummary();
  };
  this.removeMutation = function(mutationName) {
    delete mutationQueryMap_[mutationName];
    delete mutationCallbackMap_[mutationName];
    self.restartMutationSummary();
  };

  // Returns zero if not able to get id
  this.getMovieIdFromField = function(attrStr) {
    if ((attrStr || null) === null)
      return "0";

    if (attrStr.indexOf("title-card-") === 0) {
      var parts = attrStr.split("-");
      return parts[parts.length - 1];
    }

    // logic for pre-June 2015 Netflix
    var parts = attrStr.split("_");
    var temp = parts[0].replace(/\D/g, '');
    var id = parseInt(temp, 10).toString();
    if (id === "NaN")
      id = "0";
    return id;
  };
  this.addMutationAndNow = function(mutationName, query, callback) {
    try {
      $(query.element).each(function(index) { callback({"added": [this]})});
    } catch (ex) {
      console.error(ex);
    }

    self.addMutation(mutationName, query, callback);
  }

  // Works for selection movie info.
  // Handles cases (like Bojack Horseman) where the title in the DOM is an image
  // and the text title is its alt tag.
  this.parseTitle = function(tw) {
    var movieName = "";

    try {
      var titleElem = tw.getElementsByClassName("title")[0];
      if (titleElem.getElementsByTagName("img").length) {
        movieName = titleElem.getElementsByTagName("img")[0].getAttribute("alt") || "(unknown)";
      } else {
        movieName = tw.getElementsByClassName("title")[0].innerHTML;
      }
    } catch (ex) {
      consolelog(tw);
      console.error(ex);
    }
    return movieName;
  };

  // the rating string here matches the keyboard code used by Flix Plus
  this.getRatingClass = function(rating) {
    var ratingClass = "";
    if ((window.location.pathname.indexOf("/WiGenre") === 0) || (window.location.pathname.indexOf("/MoviesYouveSeen") === 0)) {
      switch (rating) {
        case "rate_clear": ratingClass = "cta-clear"; break;
        case "rate_0": ratingClass = "cta-not-interested"; break;
        case "rate_1": ratingClass = "one"; break;
        case "rate_2": ratingClass = "two"; break;
        case "rate_3": ratingClass = "three"; break;
        case "rate_4": ratingClass = "four"; break;
        case "rate_5": ratingClass = "five"; break;
      }
    } else {
      switch (rating) {
        case "rate_0": ratingClass = "rvnorec"; break;
        case "rate_1": ratingClass = "rv1"; break;
        case "rate_2": ratingClass = "rv2"; break;
        case "rate_3": ratingClass = "rv3"; break;
        case "rate_4": ratingClass = "rv4"; break;
        case "rate_5": ratingClass = "rv5"; break;
        case "rate_clear": ratingClass = "clear"; break;
        case "rate_1_5": ratingClass = "rv1.5"; break;
        case "rate_2_5": ratingClass = "rv2.5"; break;
        case "rate_3_5": ratingClass = "rv3.5"; break;
        case "rate_4_5": ratingClass = "rv4.5"; break;
      }
    }

    return ratingClass;
  };

  this.getSelectorsForPath = function() {
    return self.getSelectors(window.location.pathname);
  };

  // Returns a dict that mostly contains selectors that are useful for various scripts (esp keyboard shortcuts, where this originated)
  this.getSelectors = function(pathname) {
    var selectors = {};
    // General selection used by keyboard shortcuts
    selectors["elementsList"] = null;
    selectors["elements"] = ".agMovie";
    selectors["borderedElement"] = ".boxShot"; // element to apply border css to; set to null to apply border to elements

    // add/remove queue, ratings
    selectors["elemContainer"] = "#odp-body, #displaypage-overview, #BobMovie-content, #bob-container"; // a jquery selector or [selected], used to get add/remove queue and ratings
    selectors["queueMouseOver"] = ".btnWrap";
    selectors["queueAdd"] = ".inr, .playListBtn, .playListBtnText";
    selectors["queueRemove"] = ".inr, .playListBtn, .delbtn, .playListBtnText";
    selectors["ratingMouseOver"] = ".stbrOl, .stbrIl";

    // get movie id relative to a selected element
    // Be careful about adding multiple entries; applyClassnameToPosters loops trhough for each unique prefix.
    selectors["id_info"] = {"selector": ".boxShot", "attrib": "id", "prefix": "dbs"}; // used at wiHome, wialtgenre, kids, ...

    // get popup (elemContainer is different to support the old search pages where buttons are on page itself instead of popup)
    selectors["bobPopup"] = ".bobMovieContent";

    if ((pathname.indexOf("/browse") === 0) || (pathname.indexOf("/title") === 0) || // Almost all of UI uses this instead of below logic
        (pathname.indexOf("/my-list") === 0) || (pathname.indexOf("/person") === 0) ||
        (pathname.indexOf("/search") === 0) || (pathname.indexOf("/watch") === 0))
    {
      selectors["id_info"] = {"selector": ".smallTitleCard", "attrib": "id", "prefix": "title-card-"};

//           selectors["elementsList"] = ".lolomoRow_title_card";
//            selectors["elements"] = ".lockup";
            selectors["borderedElement"] = ".smallTitleCard";
    } else if (pathname.indexOf("/KidsSearch") === 0) {
      selectors["elements"] = ".boxShot, .lockup";
      selectors["borderedElement"] = null;
      selectors["id_info"] = {"selector": null, "attrib": "id", "prefix": "dbs"}
      selectors["bobPopup"] = "#bob-container";
    } else if (pathname.indexOf("/KidsAltGenre") === 0) {
      selectors["bobPopup"] = null;
    } else if (pathname.indexOf("/KidsMovie") === 0) {
      selectors["elements"] = null;
      selectors["bobPopup"] = null;
    } else if (pathname.indexOf("/Kids") === 0) { // Always be careful of order since /KidsAltGenre and /KidsMovie will match /Kids if included later.
      selectors["elementsList"] = ".mrow";
      selectors["bobPopup"] = null;
    } else if (pathname.indexOf("/RateMovies") === 0) { // We don't support this very much
      selectors["borderedElement"] = null;
      selectors["elements"] = null;
    } else if ((pathname.indexOf("/WiViewingActivity") === 0) || (pathname.indexOf("/MoviesYouveSeen") === 0)) {
      selectors["elements"] = ".retable li";
      selectors["id_info"] = {"selector": null, "attrib": "data-movieid", "prefix": ""}
      selectors["borderedElement"] = null;
    } else if (pathname.indexOf("/WiPlayer") === 0) {
      // do nothing
    } else if (pathname.indexOf("/ProfilesGate") === 0) {
      selectors["elements"] = ".profile";
      selectors["elemContainer"] = "[selected]";
      selectors["elementsList"] = null;
      selectors["borderedElement"] = null;
      selectors["id_info"] = {};
      selectors["bobPopup"] = null;
    } else {
      consolelog("getSelectorsForPath: unexpected pathname: " + pathname);
    }

    return selectors;
  };


  // Iterate over movies that are not a member of a class in ignoreClassesList. Ensure we have loaded at least n images per row.
  //
  // Required that idMrows() was called beforehand; rewrite to not need it
  // TODO: have this work with class names properly; .agMovie might not always be right (check on other urls, too)
  this.rolloverVisibleImages = function(ignoreClassesList) {
    var start = new Date();
    var numAcross = getNumAcross_();
    consolelog("num across = " + numAcross);
    $(".mrow").each(function() {
      if (this.id === "")
        return true;

      var posters = $("#" + this.id + " .agMovie");
      var count = 0;

      for (var i = 0; i < posters.length; i++) {
        var ignore = false;
        var ignoreLen = ignoreClassesList.length;
        for (j = 0; j < ignoreLen; j++) {
          if (posters[i].classList.contains(ignoreClassesList[j])) {
            ignore = true;
            break;
          }
        }

        if (!ignore) {
          consolelog(".");
          count++;

          var imgs = (posters[i].getElementsByTagName("img"));
          if (imgs || [] === []) {
            if ((imgs[0].src === "") && (imgs[0].getAttribute("hsrc") !== null)) {
                imgs[0].src = imgs[0].getAttribute("hsrc");
            }
          }
        }

        if (count >= numAcross)
          break;
      }
    });
    consolelog("rolloverVisibleImages took " + Math.abs(new Date() - start) + " ms");
  };


  // Calculate how many posters are shown across.
  // Since this can vary per row, just make sure that
  // we are overestimating.  We use row 1 as an example row.
  var getNumAcross_ = function() {
    var numAcross = 100;

    var movies = $("#fp_mrow_id_1 .agMovie, #fp_mrow_id_1 .smallTitleCard");

    var firstOffset = -1;
    var moviesLength = movies.length;
    for (var i = 0; i < moviesLength; i++) {
      var imgElems = movies[i].getElementsByTagName("img") || movies[i].getElementsByClassName("video-artwork");
      if (imgElems === null)
        continue;

      var temp = extlib.cumulativeOffset(imgElems[0]).left;
      if (temp !== 0) {
        if (firstOffset === -1)
          firstOffset = temp;
        else {
          numAcross = Math.ceil(window.innerWidth / Math.abs(firstOffset - temp)) + 1;
          break;
        }
      }
    }
    return numAcross;
  };


  // Call this from a page that has a signout button (basically any)
  this.getAuthUrl = function() {
    var start = document.documentElement.outerHTML.indexOf("authURL") + 10;
    var shorterString = document.documentElement.outerHTML.substring(start, start + 100)
    var length = shorterString.indexOf("\"");
    return shorterString.substring(0, length);
  };

  // Determine profile name from active page and store it if found; otherwise retrieve value cached in localStorage
  // This should only be used by contentscripts, since it retrieves from the active page or localStorage
  //
  // This will actually reload the webpage if the profile name is different than before (in case some userscripts ran before they could detect the current profile name)
  // At the moment, the reason we do this is so that darker netflix is properly enabled/disabled.  Ideally, we would check if darker is enabled/disabled
  // in each of the two profiles; if it is the same, no need for a refresh. TODO
  this.getProfileName = function() {
    var profileName = "_unknown";

    if (self.profileName_ || "" !== "")
      return self.profileName_;

    var storedProfileName = localStorage["flix_plus profilename"];
    var elems = $(".account-menu-item .profile-name, .accountMenuItem .profileName, .acct-menu-dropdown-trigger, #account-tools .current-profile .name, #profilesLauncher .profileImg");
    if (elems.length) {
      if ($("#profilesLauncher .profileImg").length === 1)
        profileName = $(".profileImg")[0].title
      else
        profileName = elems[0].innerText;

      self.profileName_ = profileName;
    }

    if (profileName !== "_unknown") {
      localStorage["flix_plus profilename"] = profileName;
      chrome.storage.local.set({"flix_plus profilename" : profileName }, function() {
//        consolelog("written to storage.local");

        if (profileName !== storedProfileName) {
          //consolelog("mismatch");
          //consolelog(profileName);
          //consolelog(storedProfileName);
                //window.location.reload(); // We would reload in case the profile name changed which would sometimes
                //cause a restart to happen to properly set Darker Netflix, but Darker Netflix is gone now.
        }
      });
    } else
      profileName = storedProfileName;

    if ((profileName || null) === null)
      profileName = "_unknown";

    return profileName;
  };

  // Apply some classes to all posters that correspond with ids in an array.
  this.applyClassnameToPosters = function(idsArray, className) {
    consolelog("applyClassnameToPosters(" + className + "):");
    consolelog(idsArray);

    var selectors = fplib.getSelectorsForPath();
    if (!selectors)
      return;

    var selector = selectors["borderedElement"];
    var infoSelector = selectors["id_info"];

    idsArray.forEach(function(movieId) {
      try {
        var elems = $("#" + infoSelector["prefix"] + movieId);
        [].slice.call(elems).forEach(function(elem) {
          elem.classList.add(className);
          elem.parentNode.classList.add(className + "_p");
        });
      } catch (ex) {
        console.error(ex);
      }
    });
  };

  this.applyClassnameToPostersOnArrive = function(idsArray, className) {
    var dataDict = {};
    idsArray.forEach(function(elem) {
      dataDict[elem] = true;
    });

    var selectors = fplib.getSelectorsForPath();
    if (!selectors)
      return;

    var selector = selectors["borderedElement"];

    document.arrive(selector, function() {
      //consolelog("arrive (applyClassnameToPostersOnArrive)");
      var movieId = fplib.getMovieIdFromField(this.id);
      if (dataDict.hasOwnProperty(movieId)) {
        this.parentNode.classList.add(className + "_p");
        this.classList.add(className);
      }
    });
  };

  // 'old mylist' is really 'manual' order
  this.isOldMyList = function() {
    var val = false;
    try {
      val = ((window.location.pathname.indexOf("/MyList") === 0) && ($("#queue-page-content").length > 0));
    } catch (ex) {
      consolelog(ex);
    }
    return val;
  };

  // 'new mylist' uses Netflix June 2015 design
  this.isNewMyList = function() {
    var val = false;
    try {
      val = ((window.location.pathname.indexOf("/my-list") === 0) && ($("#queue-page-content").length === 0));
    } catch (ex) {
      consolelog(ex);
    }
    return val;
  };

  this.syncSet = function(varname, val, callback) {
    var obj = {};
    obj[varname] = val;
    chrome.storage.sync.set(obj, callback);
  };

  this.syncGet = function(varname, callback) {
    chrome.storage.sync.get(varname, callback);
  };

  // Use this to parse JSON embedded in an HTML page
  this.parseEmbeddedJson = function(html, param) {
    var val = "";
    try {
      var start = html.indexOf(param + "\":\"");
      var end = html.indexOf("\"", start + param.length + 3);

      val = html.substring(start + param.length + 3, end);
    } catch (ex) {
      consolelog("Error in parseEmbeddedJson");
      consolelog(param);
      consolelog(ex);
    }

    return val;
  };

  this.definePosterCss = function(className, behavior) {
    consolelog("posterCss " + className + " " + behavior);
    if (behavior === "hide") {
        extlib.addGlobalStyle("." + className + "_p { display: none !important }");
    } else if (behavior === "tint") {
        extlib.addGlobalStyle("." + className + "{ -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");
    } else if (behavior === "fade") {
        extlib.addGlobalStyle("." + className + "{ opacity: 0.2; -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");
    } else if (behavior == "normal") {
        extlib.addGlobalStyle("." + className + "{ }");
    }
  };

  this.hideProgressBar = function(scriptId) {
    if ($("#fp_progress").length === 1) {
      var elem = $("#fp_progress")[0];
      elem.classList.remove("fp_active_" + scriptId);
      if (elem.classList.length === 1) { // leave navitem
        elem.style.display = "none";
      }
    }
  };

  this.showProgressBar = function(scriptId) {
    if ($("#fp_progress").length === 1) {
      $("#fp_progress")[0].classList.add("fp_active_" + scriptId);
      return;
    }

    var elem = document.createElement("li");
    elem.innerHTML = "<div class='fp_button_text'>Flix Plus <img class='fp_button' title='Getting rated and/or watched history; try to let it finish (should take at most 30 seconds) so it does not have to start over on next page load.' width='100' height='15px' src='" + chrome.extension.getURL('../src/img/ajax-loader.gif') + "'></div>";
    elem.id = 'fp_progress';

    var progressParents = $("#hdPinTarget ul, #global-header") || [];
    if (progressParents.length) {
      progressParents[0].appendChild(elem);
      $("#fp_progress")[0].classList.add('nav-item');
      $("#fp_progress")[0].classList.add('fp_active_' + scriptId);
    }
  };

  this.changeMenuPointerLogic = function(elem) {
    consolelog("changeMenuPointerLogic");
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

  // Hide elements within a jawbone-overview-info as necessary
  // so that the most important content fits
  this.ensureEverythingFits = function(overviewInfo) {
    consolelog("ensureEverythingFits");

    Element.prototype.documentOffsetTop = function() {
      return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
    };

    var jawBoneElems = $(overviewInfo).closest(".jawBone");
    if (jawBoneElems.length === 0)
      return;
    var menuElems = jawBoneElems[0].getElementsByClassName("menu");
    if (menuElems.length === 0)
      return;

    // We make use of the menubar's vertical space as well (but leave a 5 pixel margin)
    var allowedHeight = menuElems[0].documentOffsetTop() - overviewInfo.documentOffsetTop() + menuElems[0].offsetHeight - 5;
    var actualHeight = overviewInfo.scrollHeight;

      consolelog("allowed1: " + menuElems[0].documentOffsetTop());
      consolelog("allowed2: " + overviewInfo.documentOffsetTop());
      consolelog("allowed3: " + menuElems[0].offsetHeight || 0);
  //    consolelog(".fp_links: ");
  //    consolelog($(".fp_links"));

    consolelog("allowedHeight = " + allowedHeight);
    consolelog("actualHeight = " + actualHeight);

    if (actualHeight > allowedHeight) {
      var elems = overviewInfo.getElementsByClassName("user-evidence");
      if (elems.length) {
        actualHeight = actualHeight - elems[0].outerHeight;
        elems[0].style.display = "none";
  //      consolelog("hid user-evidence");
  //      consolelog("new actualheight is " + actualHeight);
      }
    }

    if (actualHeight > allowedHeight) {
      var elems = overviewInfo.getElementsByClassName("listMeta");
      if (elems.length > 0) {
        var tagElems = elems[0].getElementsByTagName("p");
        if (tagElems.length) {
          var elemsArray = [].slice.call(tagElems);
          for (var tagIndex = elemsArray.length - 1; tagIndex >= 0; tagIndex--) {
            if (actualHeight > allowedHeight) {
              actualHeight -= tagElems[tagIndex].offsetHeight;
  //            consolelog("new actualheight is " + actualHeight);
              tagElems[tagIndex].style.display = "none";
  //            consolelog("hid listmeta p");
            }
          }
          var tags = elems[0].getElementsByTagName("p");
          if (tags.length === 0) {
            actualHeight -= elems[0].outerHeight;
  //          consolelog("new actualheight is " + actualHeight);
            elems[0].style.display = "none";
  //          consolelog("hid all listmeta");
          }
        }
      }
    }

    if (actualHeight > allowedHeight) {
      var elems = overviewInfo.getElementsByClassName("fp_external_ratings");
      if (elems.length) {
  //      consolelog("hid fp_external_ratings");
  //      consolelog(elems[0].outerHeight);
        actualHeight = actualHeight - elems[0].outerHeight;
  //      consolelog("new actualheight is " + actualHeight);
        elems[0].style.display = "none";
      }
    }
  }

  function consolelog(msg) {
    if ((localStorage["fplib debug"] || null) === "true")
      console.log(msg);
  }
};

fplib_.call(fplib);
