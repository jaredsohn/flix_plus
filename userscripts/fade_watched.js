// written by jaredsohn-lifehacker

// This script will make AJAX requests to get a Netflix user's viewing history.

var key_prefix = "flix_plus " + fplib.getProfileName() + " ";

var get_history = function(start_time, page_no, authUrl, results_json, callback)
{
	console.log("get_history " + start_time + " " + page_no + " " + authUrl + " " + results_json);
	var past_start_time = false;

	$.ajax({
		url: "https://www.netflix.com/MoviesYouveSeen",
		cache: false,
		success: function(html)
		{
			var api_base_url =  fplib.parseEmbeddedJson(html, "API_BASE_URL");
			var build_identifier =  fplib.parseEmbeddedJson(html, "BUILD_IDENTIFIER");
			url2 = "https://www.netflix.com/api" + api_base_url + "/" + build_identifier + "/viewingactivity?pg=" + page_no + "&authURL=" + authUrl + "&_retry=0";

			console.log(url2);

			$.ajax({
				url: url2,
			  	cache: false,
			  	success: function(json){
			  		try
			  		{
				  		if (results_json === null)
				  			results_json = json;
				  		else
				  			results_json.viewedItems = results_json.viewedItems.concat(json.viewedItems);

					  	if ((json.viewedItems.length === 0) || ((json.viewedItems[json.viewedItems.length - 1].date) < start_time))
					  		past_start_time = true;  // This will be our last call.

					  	if ((!past_start_time) && (json.size === json.viewedItems.length))
						  	get_history(start_time, page_no + 1, authUrl, results_json, callback);
					  	else
					  		callback(results_json);
					} catch (ex)
					{
					  	consolelog("error getting watched history");
					  	consolelog(ex);
					}
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

	for (i = 0; i < results_json.viewedItems.length; i++)
	{
		if ((typeof(results_json.viewedItems[i].series) !== 'undefined') && (results_json.viewedItems[i].series != null))
			id = results_json.viewedItems[i].series;
		else
			id = results_json.viewedItems[i].movieID;
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

var keys_dict = {};
keys_dict[key_prefix + "fp_watched_style"] = "tint";

fplib.syncGet(keys_dict, function(items)
{
	console.log("define_poster_css1");
	console.log(items);
	console.log("key: ");
	console.log(key_prefix + "fp_watched_style");
	console.log(items[key_prefix + "fp_watched_style"]);
	fplib.define_poster_css("fp_watched", items[key_prefix + "fp_watched_style"]);
});

var keyname = "flix_plus " + fplib.getProfileName() + " viewingactivity";
extlib.checkForNewData(keyname, 
	5 * 60, // five minutes
	28 * 60 * 60, // 28 hours
	function(history_last_checked, callback)
	{
		console.log("!")
		get_history(history_last_checked, 0, fplib.getAuthUrl(), null, function(results)
		{
			update_history(keyname, results, callback);
		});
	}, function(data)
	{
		console.log("callback");
		console.log(data);
		var ids_array = data.split(",");
		fplib.applyClassnameToPosters(ids_array, "fp_watched");
		fplib.applyClassnameToPostersOnArrive(ids_array, "fp_watched");
	}
);