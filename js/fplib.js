// Flix Plus library
//
// This library contains code that is useful to Netflix userscripts
//
// Requires extlib.js
// 
// License: Apache

var fplib = fplib || {};
var _fplib = function()
{
	var _made_visible_dict = {};
	var self = this;

	this.getMovieIdFromField = function(attr_str)
	{
	    var parts = attr_str.split("_");
	    return parts[0].replace(/\D/g,'');
	}

	this.getRatingClass = function(rating)
	{
	    var rating_class = "";
	    if ((location.pathname.indexOf("/WiGenre") === 0) || (location.pathname.indexOf("/MoviesYouveSeen") === 0))
	    {
	        switch (rating)
	        {
	            case "`": rating_class = "cta-clear"; break;
	            case "0": rating_class = "cta-not-interested"; break;
	            case "1": rating_class = "one"; break;
	            case "2": rating_class = "two"; break;
	            case "3": rating_class = "three"; break;
	            case "4": rating_class = "four"; break;
	            case "5": rating_class = "five"; break;                
	        }
	    } else
	    {
	        switch (rating) {
	            case "`": rating_class = "clear"; break;
	            case "0": rating_class = "rvnorec"; break;
	            case "6": rating_class = "rv1.5"; break;
	            case "7": rating_class = "rv2.5"; break;
	            case "8": rating_class = "rv3.5"; break;
	            case "9": rating_class = "rv4.5"; break;
	            default:
	                rating_class = "rv" + rating.toString();
	        }        
	    }

	    return rating_class;
	}

	// Returns a dict that mostly contains selectors that are useful for keyboard commands.
	// elemContainerId is simply a string to do a getElementById on; [selected] and [document] 
	// should be interpreted separately.
	this.getSelectorsForPath = function()
	{
	    var results = {};
	    results["elemContainerId"] = "[selected]"; // This field is not a jquery selector and can be [selected] or [document]
	    results["queueMouseOver"] = null;
	    results["queueRemove"] = ".inr";
	    results["queueAdd"] = ".inr";
	    results["ratingMouseOver"] = ".stbrOl";
	    results["elements"] = ".agMovie";
	    results["elementsList"] = null;
	    results["movieInfoSelector"] = ".boxShot";
	    results["movieIdAttribute"] = "id";
	    results["borderedElement"] = null; // this class is applied to what currently has keyboard focus
        results["posterImageIdPrefix"] = "dbs";

//	    consolelog("location.pathname = " + location.pathname);

	    if (location.pathname.indexOf("/WiHome") === 0)
	    {
	    	results["elementsList"] = ".mrow";
	        results["elemContainerId"] = "BobMovie";
	        results["queueMouseOver"] = ".btnWrap";
	        results["ratingMouseOver"] = ".stbrOl";
		    results["borderedElement"] = ".boxShot";
	    } else if ((location.pathname.indexOf("/WiRecentAdditions") === 0) || (location.pathname.indexOf("/NewReleases") === 0))  // NewReleases seems to be a rename
	    {
	       results["elementsList"] = ".mrow";
	       results["elemContainerId"] = "BobMovie";
	       results["queueMouseOver"] = ".btnWrap";
	       results["ratingMouseOver"] = ".stbrOl";
		   results["borderedElement"] = ".boxShot";	       
	    } else if ((location.pathname.indexOf("/WiAgain") === 0) || (location.pathname.indexOf("/WiSimilarsByViewType") === 0) ||
	    	(location.pathname.indexOf("/WiAltGenre") === 0))
	    {
	       results["elemContainerId"] = "BobMovie";
	       results["queueMouseOver"] = ".btnWrap";
	       results["ratingMouseOver"] = ".stbrOl";
		   results["borderedElement"] = ".boxShot";	       
	    } else if (location.pathname.indexOf("/WiGenre") === 0)
	    {
	        results["elements"] = ".lockup";
	        results["elemContainerId"] = "bob-container";
	        results["queueRemove"] = ".playListBtnText";
	        results["queueAdd"] = ".playListBtnText";
	        results["movieInfoSelector"] = null;
	        results["movieIdAttribute"] = "data-titleid";
	    } else if (location.pathname.indexOf("/KidsAltGenre") === 0)
	    {
		   results["borderedElement"] = ".boxShot";	       
	    } else if (location.pathname.indexOf("/Kids") === 0)
	    {
	        results["elementsList"] = ".mrow";

	    } else if (location.pathname.indexOf("/WiSearch") === 0)
	    {
	        results["elements"] = ".mresult";
	        results["elemContainerId"] = "[selected]";
	        results["queueMouseOver"] = ".btnWrap";
	        results["ratingMouseOver"] = ".stbrIl";
	    } else if (location.pathname.indexOf("/Search") === 0) // If DVD service is enabled
	    {
	        results["elements"] = ".mresult";
	        results["elemContainerId"] = "[selected]";
	        results["queueMouseOver"] = ".btnWrap";
	        results["ratingMouseOver"] = ".stbrIl";
	        results["queueRemove"] = null;
	        results["movieInfoSelector"] = ".agMovie";
	        results["posterImageIdPrefix"] = "ag";
	    } else if (location.pathname.indexOf("/WiMovie") === 0)
	    {
	        results["elements"] = null;        
	        results["queueMouseOver"] = ".btnWrap";
	        results["elemContainerId"] = "displaypage-overview";
	        results["movieInfoSelector"] = ".displayPagePlayable";
	        results["movieIdAttribute"] = "data-movieid";

	    } else if (location.pathname.indexOf("/MyList") === 0)
	    {
	        results["elements"] = "#queue tr";
	        results["elemContainerId"] = "[selected]";
	        results["queueAdd"] = null;
	        results["queueRemove"] = ".delbtn";
	        results["ratingMouseOver"] = ".stbrIl";
	        results["movieInfoSelector"] = null;
	        results["movieIdAttribute"] = "data-mid";

	    } else if (location.pathname.indexOf("/RateMovies") === 0)
	    {
	        results["elemContainerId"] = "[selected]";
	        results["ratingMouseOver"] = ".stbrOl";
	//        results["movieInfoSelector"] = ".title a";
	//        results["movieIdAttribute"] = "href";

	    } else if (location.pathname.indexOf("/WiViewingActivity") === 0)
	    {
	        results["elements"] = ".retable li";
	        results["movieInfoSelector"] = null;
	        results["movieIdAttribute"] = "data-movieid";
	    } else if (location.pathname.indexOf("/MoviesYouveSeen") === 0)
	    {
	        results["elements"] = ".retable li";
	        results["movieInfoSelector"] = null;
	        results["movieIdAttribute"] = "data-movieid";
	    } else if (location.pathname.indexOf("/WiPlayer") === 0)
	    {
	    	// do nothing
	    } else
	    {
	        consolelog("getSelectorsForPath: unexpected location.pathname: " + location.pathname);
	    }

	    return results;
	}

	this.idMrows = function()
	{
	    mrows = document.getElementsByClassName("mrow");
	    for (i = 0; i < mrows.length; i++)
	    {
	      if (extlib.hasClass(mrows[i], "characterRow")) // skips over characters on kids page
	        continue;

	      // Get relevant info
	      mrows[i].id = "mrow_id_" + i.toString()    
	    }
	}

	// Posters don't line up if video annotations are not consistent.
	this.addEmptyVideoAnnotations = function()
	{
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
//	            consolelog("videoannotation_appended!")
	            elements[i].appendChild(videoAnnotationElem);
	        }
	    }
	}

	// Ensure visible images are loaded
	this.mouseoverVisiblePosters = function()
	{
		$(".mrow").each(function() { 
		    if ((typeof(_made_visible_dict[this.id]) === "undefined") && ($(this).visible(true)))
		    {
		    	if (!$(this).hasClass("fb"))
		    	{
			    	consolelog("mouseoverVisiblePosters!");
			    	//consolelog(this);
		            _made_visible_dict[this.id] = true;
			        extlib.simulateEvent(this, "mouseover");
			    }
		    }
		});		
	}	

	// Call this from a page that has a signout button (basically any)
	this.getAuthUrl = function()
	{
		var href = document.getElementById("signout").getElementsByTagName("a")[0].href;
		var authUrlPos = href.indexOf("authURL=");

		return href.substring(authUrlPos + 8);
	}

	// Determine profile name from active page and store it if found; otherwise retrieve value cached in localStorage
	// This should only be used by contentscripts, since it retrieves from the active page or localStorage
	//
	// This will actually reload the webpage if the profile name is different than before (in case some userscripts ran before they could detect the current profile name)
	this.getProfileName = function()
	{
		var stored_profile_name = localStorage["flix_plus profilename"];
		var elems = document.getElementsByClassName("acct-menu-dropdown-trigger");
		if (elems.length)
			profile_name = elems[0].innerText
		else
			profile_name = "_unknown";

		if (profile_name !== "_unknown")
		{
			if (profile_name !== stored_profile_name)
			{
				consolelog("profilename loaded: ");
				consolelog(profile_name);
				localStorage["flix_plus profilename"] = profile_name;
				chrome.storage.local.set({"flix_plus profilename" : profile_name }, function() 
				{
					consolelog("written to storage.local");

					location.reload();
				});				
			}
		}
		else
			profile_name = stored_profile_name;
	
		if (typeof(profile_name) === "unknown")
			profile_name = "_unknown";
		
		return profile_name;
	}

	// Apply a class to all posters that correspond with ids in an array
	// elem_prefix is usually dbs (although is ag if on search)
	this.applyClassnameToPosters = function(ids_array, class_name)
	{
		var selectors = self.getSelectorsForPath();
		var elem_prefix = selectors["posterImageIdPrefix"];
		//consolelog("elem prefix is ");
		//consolelog(elem_prefix);

		var count = 0;
		consolelog("applyClassnameToPosters");
		consolelog(ids_array);
		consolelog(class_name);	
		for (i = 0; i < ids_array.length; i++)
		{
			var instance = 0;
			while (true)
			{
				var elem = document.getElementById(elem_prefix + ids_array[i] + "_" + instance);
				//consolelog("looking for " + elem_prefix + ids_array[i] + "_" + instance);
				if ((typeof(elem) !== "undefined") && (elem !== null))
				{
					//consolelog("found!");
					var img_elem = elem.getElementsByTagName("img")[0];

			     	if (!extlib.hasClass(img_elem, class_name)) // skips over characters on kids page
					{
						img_elem.className += " " + class_name;
						count += 1;
					}
				} else
					break;
				instance += 1;
			}
		}
		consolelog("applyclassname_to_posters count = " + count);
	}

	this.syncSet = function(varname, val, callback)
	{
		var obj = {};
		obj[varname] = val;
		chrome.storage.sync.set(obj, callback);
	}

	this.syncGet = function(varname, callback)
	{
		chrome.storage.sync.get(varname, callback);
	}

	// Use this to parse JSON embedded in the page at wiViewingActivity and MoviesYouveSeen
	this.parseEmbeddedJson = function(html, param)
	{
		var val = "";
		try
		{
			var start = html.indexOf(param + "\":\"");
			var end = html.indexOf("\"", start + param.length + 3)

			val = html.substring(start + param.length + 3, end)
		} catch (ex)
		{
			consolelog("Error in parseEmbeddedJson");
			consolelog(param);
			consolelog(ex);
		}

		return val;
	}


	function consolelog(msg)
	{
		if (typeof(localStorage["fplib debug"]) !== "undefined")
		    console.log(msg);
	}
}

_fplib.call(fplib);
