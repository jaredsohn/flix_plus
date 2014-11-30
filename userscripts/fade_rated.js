// written by jaredsohn-lifehacker

// This script will make AJAX requests to get a Netflix user's rating history.

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old MyList.")
    return;
}

var key_prefix = "flix_plus " + fplib.getProfileName() + " ";

var get_history = function(start_time, page_no, netflix_api_base, authUrl, results_json, callback)
{
	var past_start_time = false;

	var url = netflix_api_base + "/ratinghistory?pg=" + page_no + "&authURL=" + authUrl + "&_retry=0";

	console.log(url);

	$.ajax({
		url: url,
	  	cache: false,
	  	success: function(json){
	  		console.log(json);

  			if (results_json === null)
  				results_json = json;
  			else
  			{
  				console.log(results_json.ratingItems);
  				results_json.ratingItems = results_json.ratingItems.concat(json.ratingItems);
  			}

		  	if ((typeof(json.ratingItems) === "undefined") || (json.ratingItems.length === 0) || ((new Date(json.ratingItems[json.ratingItems.length - 1].date).getTime()) < start_time))
	  			past_start_time = true;  // This will be our last call.

	  		if ((!past_start_time) && (json.size === json.ratingItems.length))
			  	get_history(start_time, page_no + 1, netflix_api_base, authUrl, results_json, callback);
		  	else
	  			callback(results_json);
	  	}
	});
}

var create_unique_ids_dict = function(id_array, results_json, notinterested_only)
{	
	var unique_ids_dict = {};

	for (i = 0; i < id_array.length; i++)
		unique_ids_dict[id_array[i]] = true;

	for (i = 0; i < results_json.ratingItems.length; i++)
	{
		//console.log(results_json.ratingItems[i]);
		if ((notinterested_only === false) || (results_json.ratingItems[i].yourRating === -3))
		{
			if ((typeof(results_json.ratingItems[i].series) !== 'undefined') && (results_json.ratingItems[i].series != null))
				id = results_json.ratingItems[i].series;
			else
				id = results_json.ratingItems[i].movieID;
			unique_ids_dict[id] = true;
		}
	}

	return unique_ids_dict;
}

var update_history = function(keyname, results, callback)
{
	console.log("concatenated results:");
	console.log(results);

	var unique_movie_ids_str = localStorage[keyname];
	var unique_movie_ids_notinterested_str = localStorage[keyname + "_notinterested"];

	unique_movie_ids_array = [];
	if (typeof(unique_movie_ids_str) !== "undefined")
		unique_movie_ids_array = unique_movie_ids_str.split(",");

	unique_movie_ids_notinterested_array = [];
	if (typeof(unique_movie_ids_notinterested_str) !== "undefined")
		unique_movie_ids_notinterested_array = unique_movie_ids_notinterested_str.split(",");

	var unique_movie_ids_dict = create_unique_ids_dict(unique_movie_ids_array, results, false);
	var unique_movie_ids_array = Object.keys(unique_movie_ids_dict);
	localStorage[keyname] = unique_movie_ids_array;

	var unique_movie_ids_notinterested_dict = create_unique_ids_dict(unique_movie_ids_notinterested_array, results, true);
	var unique_movie_ids_notinterested_array = Object.keys(unique_movie_ids_notinterested_dict);
	localStorage[keyname + "_notinterested"] = unique_movie_ids_notinterested_array;


	console.log(keyname + " counts = " + unique_movie_ids_array.length + ", " + unique_movie_ids_notinterested_array.length);

	callback([unique_movie_ids_array.toString(), unique_movie_ids_notinterested_array.toString()]);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var keys_dict = {};
keys_dict[key_prefix + "fp_rated_style"] = "fade";
keys_dict[key_prefix + "fp_rated_notinterested_style"] = "hide";

fplib.syncGet(keys_dict, function(items)
{
	console.log(items);
	fplib.define_poster_css("fp_rated", items[key_prefix + "fp_rated_style"]);
	fplib.define_poster_css("fp_rated_notinterested", items[key_prefix + "fp_rated_notinterested_style"]);
});
//extlib.addGlobalStyle(".fp_rated { opacity: 0.2; -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");
////extlib.addGlobalStyle(".fp_rated_gp { display: none !important }");
//extlib.addGlobalStyle(".fp_rated_notinterested_gp { display: none !important }");


var keyname = "flix_plus " + fplib.getProfileName() + " ratingactivity";

extlib.checkForNewData([keyname, keyname + "_notinterested"],
	5 * 60, // five minutes
	28 * 60 * 60, // 28 hours
	function(history_last_checked, callback)
	{
		$.ajax({
			url: window.location.protocol + "//www.netflix.com/WiViewingActivity",
			cache: false,
			success: function(html)
			{
				var netflix_api_base = "https://www.netflix.com/api" + fplib.parseEmbeddedJson(html, "API_BASE_URL") + "/" + fplib.parseEmbeddedJson(html, "BUILD_IDENTIFIER");
				get_history(history_last_checked, 0, netflix_api_base, fplib.getAuthUrl(), null, function(results)
				{
					update_history(keyname, results, callback);
				});
			}
		});
	}, function(datas)
	{
		console.log("datas");
		console.log(datas);
		var ids_array = datas[0].split(",");
		fplib.applyClassnameToPosters(ids_array, "fp_rated");
		fplib.applyClassnameToPostersOnArrive(ids_array, "fp_rated");

		var ids_array = datas[1].split(",");
		fplib.applyClassnameToPosters(ids_array, "fp_rated_notinterested");
		fplib.applyClassnameToPostersOnArrive(ids_array, "fp_rated_notinterested");
	}
);
