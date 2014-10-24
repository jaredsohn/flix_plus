// written by jaredsohn-lifehacker

// This script will make AJAX requests to get a Netflix user's rating history.

if (fplib.isOldMyList())
{
    console.log("Script disabled since it does not work on old MyList.")
    return;
}

var key_prefix = "flix_plus " + fplib.getProfileName() + " ";

var get_history = function(start_time, page_no, authUrl, results_json, callback)
{
	var past_start_time = false;

	$.ajax({
		url: window.location.protocol + "https://www.netflix.com/WiViewingActivity",
		cache: false,
		success: function(html)
		{
			var url = "https://www.netflix.com/api" + fplib.parseEmbeddedJson(html, "API_BASE_URL") + "/" + fplib.parseEmbeddedJson(html, "BUILD_IDENTIFIER") + "/ratinghistory?pg=" + page_no + "&authURL=" + authUrl + "&_retry=0";

			console.log(url);

			$.ajax({
				url: url,
			  	cache: false,
			  	success: function(json){
			  		console.log(json);

		  			if (results_json === null)
		  				results_json = json;
		  			else
		  				results_json.ratingItems = results_json.ratingItems.concat(json.ratingItems);

				  	if ((json.ratingItems.length === 0) || ((new Date(json.ratingItems[json.ratingItems.length - 1].date).getTime()) < start_time))
			  			past_start_time = true;  // This will be our last call.

			  		if ((!past_start_time) && (json.size === json.ratingItems.length))
					  	get_history(start_time, page_no + 1, authUrl, results_json, callback);
				  	else
			  			callback(results_json);
			  	}
			});
		}
	});
}

var create_unique_ids_dict = function(id_array, results_json)
{	
	var unique_ids_dict = {};

	for (i = 0; i < id_array.length; i++)
		unique_ids_dict[id_array[i]] = true;

	for (i = 0; i < results_json.ratingItems.length; i++)
	{
		if ((typeof(results_json.ratingItems[i].series) !== 'undefined') && (results_json.ratingItems[i].series != null))
			id = results_json.ratingItems[i].series;
		else
			id = results_json.ratingItems[i].movieID;
		unique_ids_dict[id] = true;
	}

	return unique_ids_dict;
}

var update_history = function(keyname, results, callback)
{
	console.log("concatenated results:");
	console.log(results);

	var unique_movie_ids_str = localStorage[keyname];
	unique_movie_ids_array = [];
	if (typeof(unique_movie_ids_str) !== "undefined")
		unique_movie_ids_array = unique_movie_ids_str.split(",");

	var unique_movie_ids_dict = create_unique_ids_dict(unique_movie_ids_array, results);
	var unique_movie_ids_array = Object.keys(unique_movie_ids_dict);
	localStorage[keyname] = unique_movie_ids_array;

	console.log(keyname + " count = " + unique_movie_ids_array.length);

	callback(unique_movie_ids_array.toString());
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
extlib.addGlobalStyle(".fp_rated { opacity: 0.2; -webkit-filter: sepia(90%) hue-rotate(90deg); box-shadow: inset 0px 0px 64px 64px; cornflowerblue, 0px 0px 4px 4px cornflowerblue; }");

var keyname = "flix_plus " + fplib.getProfileName() + " ratingactivity";

extlib.checkForNewData(keyname,
	5 * 60, // five minutes
	28 * 60 * 60, // 28 hours
	function(history_last_checked, callback)
	{
		get_history(history_last_checked, 0, fplib.getAuthUrl(), null, function(results)
		{
			update_history(keyname, results, callback);
		});
	}, function(data)
	{
		var ids_array = data.split(",");
		fplib.applyClassnameToPosters(ids_array, "fp_rated");
		fplib.applyClassnameToPostersOnArrive(ids_array, "fp_rated");
	}
);
