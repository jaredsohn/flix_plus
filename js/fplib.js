// Flix Plus library
//
// This library contains code that is useful to Netflix userscripts
//
// Requires extlib.js
//
// License: MIT, GPL

var fplib = fplib || {};
var _fplib = function()
{
    var self = this;
    var profile_name_ = "";

    // Returns zero if not able to get id
    this.getMovieIdFromField = function(attr_str)
    {
        if (typeof(attr_str) === "undefined")
            return "0";

        var parts = attr_str.split("_");
        var temp = parts[0].replace(/\D/g, '');
        var id = parseInt(temp, 10).toString();
        if (id === "NaN")
            id = "0";
        return id;
    };

    // the rating string here matches the keyboard code used by Flix Plus
    this.getRatingClass = function(rating)
    {
        var rating_class = "";
        if ((location.pathname.indexOf("/WiGenre") === 0) || (location.pathname.indexOf("/MoviesYouveSeen") === 0))
        {
            switch (rating)
            {
                case "rate_clear": rating_class = "cta-clear"; break;
                case "rate_0": rating_class = "cta-not-interested"; break;
                case "rate_1": rating_class = "one"; break;
                case "rate_2": rating_class = "two"; break;
                case "rate_3": rating_class = "three"; break;
                case "rate_4": rating_class = "four"; break;
                case "rate_5": rating_class = "five"; break;
            }
        } else
        {
            switch (rating) {
                case "rate_0": rating_class = "rvnorec"; break;
                case "rate_1": rating_class = "rv1"; break;
                case "rate_2": rating_class = "rv2"; break;
                case "rate_3": rating_class = "rv3"; break;
                case "rate_4": rating_class = "rv4"; break;
                case "rate_5": rating_class = "rv5"; break;
                case "rate_clear": rating_class = "clear"; break;
                case "rate_1_5": rating_class = "rv1.5"; break;
                case "rate_2_5": rating_class = "rv2.5"; break;
                case "rate_3_5": rating_class = "rv3.5"; break;
                case "rate_4_5": rating_class = "rv4.5"; break;
            }
        }

        return rating_class;
    };

    this.getSelectorsForPath = function()
    {
        return self.getSelectors(location.pathname);
    };

    // Returns a dict that mostly contains selectors that are useful for various scripts (esp keyboard shortcuts, where this originated)
    this.getSelectors = function(pathname)
    {
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
        selectors["id_info"] = [{"selector": ".boxShot", "attrib": "id", "prefix": "dbs"}]; // used at wiHome, wialtgenre, kids, ...

        // get popup (elemContainer is different to support the old search pages where buttons are on page itself instead of popup)
        selectors["bobPopup"] = ".bobMovieContent";

        if (pathname.indexOf("/WiHome") === 0)
        {
            selectors["elementsList"] = ".mrow";
        } else if (pathname.indexOf("/search") === 0) // Note that HTML is different depending on how page is reached
        {
            selectors["elements"] = ".boxShot, .lockup";
            selectors["borderedElement"] = null;
            selectors["id_info"] = [
                                     {"selector": null, "attrib": "data-titleid", "prefix": ""}, // accessing /search directly, from /moviesyouveseen, /wiviewingactivity
                                     {"selector": ".popLink", "attrib": "data-id", "prefix": ""},
                                     {"selector": ".boxShot", "attrib": "id", "prefix": "dbs"} // must include last since id field could have other uses
                                 ];
            selectors["bobPopup"] = "#bob-container";
        } else if ((pathname.indexOf("/WiRecentAdditions") === 0) || (pathname.indexOf("/NewReleases") === 0))  // NewReleases seems to be a rename
        {
           selectors["elementsList"] = ".mrow";
        } else if ((pathname.indexOf("/WiAgain") === 0) || (pathname.indexOf("/WiSimilarsByViewType") === 0) ||
            (pathname.indexOf("/WiAltGenre") === 0))
        {
        } else if (pathname.indexOf("/WiGenre") === 0)
        {
            // should never run since we redirect to /WiAltGenre
        } else if (pathname.indexOf("/KidsSearch") === 0)
        {
            selectors["elements"] = ".boxShot, .lockup";
            selectors["borderedElement"] = null;
            selectors["id_info"] = [
                                     {"selector": null, "attrib": "data-titleid", "prefix": ""}, // accessing /search directly, from /moviesyouveseen, /wiviewingactivity
                                     {"selector": ".popLink", "attrib": "data-id", "prefix": ""},
                                     {"selector": ".boxShot", "attrib": "id", "prefix": "dbs"} // must include last since id field could have other uses
                                 ];
            selectors["bobPopup"] = "#bob-container";
        } else if (pathname.indexOf("/KidsAltGenre") === 0)
        {
           selectors["bobPopup"] = null;
        } else if (pathname.indexOf("/KidsMovie") === 0)
        {
            selectors["elements"] = null;
            selectors["bobPopup"] = null;
        } else if (pathname.indexOf("/Kids") === 0) // Always be careful of order since /KidsAltGenre and /KidsMovie will match /Kids if included later.
        {
            selectors["elementsList"] = ".mrow";
            selectors["bobPopup"] = null;
        } else if (pathname.indexOf("/Search") === 0) // maybe still search when DVD service is enabled; not tested recently
        {
            selectors["elements"] = ".mresult";
            selectors["id_info"] = [
                                    {"selector": ".agMovie", "attrib": "data-titleid", "prefix": "ag"}
                                 ];
        } else if (pathname.indexOf("/WiMovie") === 0)
        {
            selectors["elements"] = null;
            selectors["id_info"] = [
                                     {"selector": ".displayPagePlayable a", "attrib": "data-movieid", "prefix": ""}
                                 ];
            selectors["bobPopup"] = ".bobContent";
        } else if (pathname.indexOf("/MyList") === 0)
        {
            if (self.isOldMyList())
            {
                selectors["elements"] = "#queue tr";
                selectors["borderedElement"] = null;
                selectors["id_info"] = [
                                     {"selector": null, "attrib": "data-mid", "prefix": ""}
                                 ];
            } else
            {
                selectors["elementsList"] = ".list-items";
            }
        } else if (pathname.indexOf("/RateMovies") === 0) // We don't support this very much
        {
            selectors["borderedElement"] = null;
        } else if ((pathname.indexOf("/WiViewingActivity") === 0) || (pathname.indexOf("/MoviesYouveSeen") === 0))
        {
            selectors["elements"] = ".retable li";
            selectors["id_info"] = [
                                 {"selector": null, "attrib": "data-movieid", "prefix": ""}
                                ];
            selectors["borderedElement"] = null;
        } else if (pathname.indexOf("/WiPlayer") === 0)
        {
            // do nothing
        } else if (pathname.indexOf("/WiRoleDisplay") === 0)
        {
            selectors["bobPopup"] = ".bobContent";
        } else if (pathname.indexOf("/ProfilesGate") === 0)
        {
            selectors["elements"] = ".profile";
            selectors["elemContainer"] = "[selected]";
            selectors["elementsList"] = null;
            selectors["borderedElement"] = null;
            selectors["id_info"] = [];
            selectors["bobPopup"] = null;
        } else
        {
            consolelog("getSelectorsForPath: unexpected pathname: " + pathname);
        }

        return selectors;
    };

    this.idMrows = function()
    {
        this.idMrows = function() {}; // run only once

        consolelog("idMrows");
        mrows = document.getElementsByClassName("mrow");
        for (i = 0; i < mrows.length; i++)
        {
          if (mrows[i].classList.contains("characterRow")) // skips over characters on kids page
            continue;

          // Get relevant info
          mrows[i].id = "mrow_id_" + i.toString();
        }
    };

    // Posters don't line up if video annotations are not consistent.
    this.addEmptyVideoAnnotations = function()
    {
        this.addEmptyVideoAnnotations = function() {}; // run only once
        consolelog("addEmptyVideoAnnotations");

        // TODO: not using getSelectorsForPath here.  Change this?
        var elements = [];
        if (location.pathname.indexOf("/WiGenre") === 0)
            elements = document.getElementsByClassName("lockup");
        else
            elements = document.getElementsByClassName("agMovie");

        for (i = 0; i < elements.length; i++)
        {
            videoAnnotationElems = elements[i].getElementsByClassName("videoAnnotation");
            if (videoAnnotationElems.length === 0)
            {
                var videoAnnotationElem = document.createElement("span");
                videoAnnotationElem.className = "videoAnnotation";
                videoAnnotationElem.innerHTML = " ";
//              consolelog("videoannotation_appended!")
                elements[i].appendChild(videoAnnotationElem);
            }
        }
    };

    // Iterate over movies that are not a member of a class in ignore_classes_list. Ensure we have loaded at least n images per row.
    //
    // Requires that idMrows() is called beforehand
    // TODO: have this work with class names properly; .agMovie might not always be right (check on other urls, too)
    this.rolloverVisibleImages = function(ignore_classes_list)
    {
        var start = new Date();
        var num_across = _getNumAcross();
        consolelog("num across = " + num_across);
        $(".mrow").each(function() {
            if (this.id === "")
                return true;

            var posters = $("#" + this.id + " .agMovie");
            var count = 0;

            for (i = 0; i < posters.length; i++)
            {
                var ignore = false;
                var ignore_len = ignore_classes_list.length;
                for (j = 0; j < ignore_len; j++)
                {
                    if (posters[i].classList.contains(ignore_classes_list[j]))
                    {
                        ignore = true;
                        break;
                    }
                }

                if (!ignore)
                {
                    console.log(".");
                    count++;

                    var imgs = (posters[i].getElementsByTagName("img"));
                    if ((typeof(imgs) !== "undefined") && (imgs.length > 0))
                    {
                        if ((imgs[0].src === "") && (imgs[0].getAttribute("hsrc") !== null))
                        {
                            imgs[0].src = imgs[0].getAttribute("hsrc");
                        }
                    }
                }

                if (count >= num_across)
                    break;
            }
        });
        consolelog("rolloverVisibleImages took " + Math.abs(new Date() - start) + " ms");
    };


    // Calculate how many posters are shown across.
    // Since this can vary per row, just make sure that
    // we are overestimating.  We use row 1 as an example row.
    var _getNumAcross = function()
    {
        var num_across = 100;

        var movies = $("#mrow_id_1 .agMovie");

        var first_offset = -1;
        var len = movies.length;
        for (i = 0; i < len; i++)
        {
            var temp = extlib.cumulativeOffset(movies[i].getElementsByTagName("img")[0]).left;
                 if (temp !== 0)
                 {
                if (first_offset === -1)
                    first_offset = temp;
                else
                {
                    num_across = Math.ceil(window.innerWidth / Math.abs(first_offset - temp)) + 1;
                    break;
                }
            }
        }
        return num_across;
    };


    // Call this from a page that has a signout button (basically any)
    this.getAuthUrl = function()
    {
        var elem = document.getElementById("signout");
        if (elem === null)
            return "";

        var href = elem.getElementsByTagName("a")[0].href;
        var authUrlPos = href.indexOf("authURL=");

        return href.substring(authUrlPos + 8);
    };

    // Determine profile name from active page and store it if found; otherwise retrieve value cached in localStorage
    // This should only be used by contentscripts, since it retrieves from the active page or localStorage
    //
    // This will actually reload the webpage if the profile name is different than before (in case some userscripts ran before they could detect the current profile name)
    // At the moment, the reason we do this is so that darker netflix is properly enabled/disabled.  Ideally, we would check if darker is enabled/disabled
    // in each of the two profiles; if it is the same, no need for a refresh. TODO
    this.getProfileName = function()
    {
        if ((self.profile_name_ !== "") && (typeof(self.profile_name_) !== "undefined"))
            return self.profile_name_;

        var stored_profile_name = localStorage["flix_plus profilename"];

        var elems = document.getElementsByClassName("acct-menu-dropdown-trigger");
        if (elems.length)
        {
            profile_name = elems[0].innerText;
            self.profile_name_ = profile_name;
        }
        else
            profile_name = "_unknown";


        if (profile_name !== "_unknown")
        {
            localStorage["flix_plus profilename"] = profile_name;
            chrome.storage.local.set({"flix_plus profilename" : profile_name }, function()
            {
                consolelog("written to storage.local");

                if (profile_name !== stored_profile_name)
                    location.reload();
            });
        }
        else
            profile_name = stored_profile_name;

        if (typeof(profile_name) === "unknown")
            profile_name = "_unknown";

        return profile_name;
    };

    // Apply some classes to all posters that correspond with ids in an array.  We care about
    // two separate elements for tinting and applying a border.  We also care about a third element
    // (and attribute) for extracting the id.
    //
    // The following code lacks some flexibility (which causes it to not work on /search when accessed directly)
    // since the field name is not the 'id' field and there is not a concept of 'instances' within the id.
    //
    // However, because of low priority there (we also don't shown rotten scores or have buttons for trailer/play)
    // this simpler code that works for other cases will remain.
    // Apply a class to all posters that correspond with ids in an array
    // elem_prefix is usually dbs (although is ag if on search)
    this.applyClassnameToPosters = function(ids_array, class_name)
    {
        consolelog("applyClassnameToPosters(" + class_name + "):");
        consolelog(ids_array);

        selectors = self.getSelectorsForPath();
        var elem_prefix = selectors["posterImageIdPrefix"];
        //consolelog("elem prefix is ");
        //consolelog(elem_prefix);

        var count = 0;
        var grandparent_count = 0;

        var visited_prefixes = {};

        for (infoIndex = 0; infoIndex < selectors["id_info"].length; infoIndex++)
        {
            var no_gp = false;

            var elem_prefix = selectors["id_info"][infoIndex]["prefix"];
            if (typeof(visited_prefixes[elem_prefix]) !== "undefined")
                continue;
            visited_prefixes[elem_prefix] = true;

            consolelog("trying for prefix " + elem_prefix);

            var selector = selectors["borderedElement"];
            if (selector === null)
                no_gp = true;

            for (i = 0; i < ids_array.length; i++)
            {
                var instance = 0;
                while (true)
                {
                    if (ids_array[i] === "")
                        break;

                    var elem = document.getElementById(elem_prefix + ids_array[i] + "_" + instance);
                    //consolelog("looking for " + elem_prefix + ids_array[i] + "_" + instance);
                    if ((typeof(elem) !== "undefined") && (elem !== null))
                    {
                        //consolelog("found!");
                        var img_elem = elem.getElementsByTagName("img")[0];

                        if (!img_elem.classList.contains(class_name))
                        {
                            img_elem.classList.add(class_name);
                            count += 1;
                        }

                        // This grandparent node lets allows us to hide posters via CSS (We don't fade the full poster because we don't want to fade the border.)
                        var grandparentElem = (no_gp) ? img_elem.parentNode : img_elem.parentNode.parentNode;

                        if (!grandparentElem.classList.contains(class_name + "_gp"))
                        {
                            grandparentElem.classList.add(class_name + "_gp");
                            grandparent_count += 1;
                        }

                    } else
                        break;
                    instance += 1;
                }
            }
        }
        consolelog("applyClassnameToPosters count = " + count + ", " + grandparent_count);
    };

    this.applyClassnameToPostersOnArrive = function(ids_array, class_name) {
        var data_dict = {};
        var collapse_tree = false;
        var len = ids_array.length;
        var no_gp = false;
        for (i = 0; i < len; i++)
            data_dict[ids_array[i]] = true;

        var selectors = fplib.getSelectorsForPath();
        var selector = selectors["borderedElement"];
        if (selector === null)
        {
            no_gp = true;
            selector = selectors["elements"];
        }
        document.arrive(selector, function()
        {
            console.log("arrive (applyClassnameToPostersOnArrive)");
            var id = 0;
            if (this.id === "")
            {
                var elem = $("a", $(this));
                if ((typeof(elem) !== "undefined") && (elem !== null))
                    id = elem.attr("data-id"); // for search pages
            }
            else
                id = this.id;

            var movie_id = fplib.getMovieIdFromField(id);
            //console.log(movie_id);
            if (typeof(data_dict[movie_id]) !== "undefined")
            {
                var node = this;
                if (!no_gp)
                    node = this.parentNode;
                node.classList.add(class_name + "_gp");

                console.log(this);
                var imgs = this.getElementsByTagName("img");
//              console.log("marking as " + class_name + " - " + movie_id);
                imgs[0].classList.add(class_name);
            }
        });
    };

    this.syncSet = function(varname, val, callback)
    {
        var obj = {};
        obj[varname] = val;
        chrome.storage.sync.set(obj, callback);
    };

    this.syncGet = function(varname, callback)
    {
        chrome.storage.sync.get(varname, callback);
    };

    // 'old mylist' is really 'manual' order
    this.isOldMyList = function()
    {
        try
        {
            val = ((location.pathname.indexOf("/MyList") === 0) && ($("#queue-page-content").length > 0));
        } catch (ex)
        {
            console.log(ex);
        }
        return val;
    };

    // 'new mylist' is really 'netflix suggests' order
    this.isNewMyList = function()
    {
        try
        {
            val = ((location.pathname.indexOf("/MyList") === 0) && ($("#queue-page-content").length === 0));
        } catch (ex)
        {
            console.log(ex);
        }
        return val;
    };

    // Use this to parse JSON embedded in the page at wiViewingActivity and MoviesYouveSeen
    this.parseEmbeddedJson = function(html, param)
    {
        var val = "";
        try
        {
            var start = html.indexOf(param + "\":\"");
            var end = html.indexOf("\"", start + param.length + 3);

            val = html.substring(start + param.length + 3, end);
        } catch (ex)
        {
            consolelog("Error in parseEmbeddedJson");
            consolelog(param);
            consolelog(ex);
        }

        return val;
    };

    // Used for placing play and trailer buttons
    this.createPopupHeaderRow = function()
    {
        // Create Flix Plus header row if it doesn't exist (TODO: move to fplib?)
        if ($(".midBob .fp_header_row").length === 0)
        {
            var div = document.createElement("div");
            div.className = "fp_header_row";
            div.style.cssText = "position: absolute; bottom: 3px; left: 3px;";
            $(".midBob")[0].appendChild(div);
        }
    };

    this.definePosterCss = function(className, behavior)
    {
        if (behavior === "hide")
        {
            extlib.addGlobalStyle("." + className + "_gp { display: none !important }");
        } else if (behavior === "tint")
        {
            extlib.addGlobalStyle("." + className + "{ -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");
        } else if (behavior === "fade")
        {
            extlib.addGlobalStyle("." + className + "{ opacity: 0.2; -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");
        } else if (behavior == "normal")
        {
            extlib.addGlobalStyle("." + className + "{ }");
        }
    };

    this.hideProgressBar = function(script_id)
    {
        var elem = $("#fp_progress")[0];
        elem.classList.remove("active_" + script_id);

        if ($("#fp_progress")[0].classList.length === 1)
            $("#fp_progress")[0].style.display = "none";
    };

    this.showProgressBar = function(script_id)
    {
        if ($("#fp_progress").length === 1)
        {
            $("#fp_progress")[0].classList.add("active_" + script_id);
            return;
        }

        var elem = document.createElement("li");
        elem.innerHTML = "<div>Flix Plus <img title='Getting rated and/or watched history; try to let it finish (should take at most 30 seconds) so it does not have to start over on next page load.' width='100' height='15px' src='" + chrome.extension.getURL('../src/img/ajax-loader.gif') + "'></div>";
        elem.id = 'fp_progress';
        $("#global-header")[0].appendChild(elem);

        $("#fp_progress")[0].classList.add('nav-item');
        $("#fp_progress")[0].classList.add('active_' + script_id);
    };


    function consolelog(msg)
    {
        if (typeof(localStorage["fplib debug"]) !== "undefined")
            console.log(msg);
    }
};

_fplib.call(fplib);
