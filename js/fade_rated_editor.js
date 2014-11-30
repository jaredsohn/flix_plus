var fade_editor = fade_editor || {};
var _fade_editor = function() {
  	var self = this;
  	var _profilename = "undefined";

	this.init = function(profilename, config_items)
	{
		console.log("config_items");
		console.log(config_items);
		console.log("init");
		_profilename = profilename;
		document.getElementById("save").addEventListener("click", self.onSave);
		document.getElementById("defaults").addEventListener("click", self.onRestoreDefaults);

		$("#fade_rated_select")[0].value = config_items["flix_plus " +  _profilename + " fp_rated_style"]
		$("#fade_rated_notinterested_select")[0].value = config_items["flix_plus " +  _profilename + " fp_rated_notinterested_style"];
		$("#fade_watched_select")[0].value = config_items["flix_plus " +  _profilename + " fp_watched_style"];
		$("#fade_duplicates_select")[0].value = config_items["flix_plus " +  _profilename + " fp_duplicates_style"];
	}

	this.onSave = function(e)
	{
		e.preventDefault();

		var dict = {};
		dict["flix_plus " + _profilename + " fp_rated_style"] = $("#fade_rated_select")[0].value;
		dict["flix_plus " + _profilename + " fp_rated_notinterested_style"] = $("#fade_rated_notinterested_select")[0].value;
		dict["flix_plus " + _profilename + " fp_watched_style"] = $("#fade_watched_select")[0].value;
		dict["flix_plus " + _profilename + " fp_duplicates_style"] = $("#fade_duplicates_select")[0].value;

	    chrome.storage.sync.set(dict, function() {
	    	alert("Saved");
	    });
	};

	this.onRestoreDefaults = function(e)
	{
		$("#fade_rated_select")[0].value = "fade";
		$("#fade_rated_notinterested_select")[0].value = "hide";
		$("#fade_watched_select")[0].value = "tint";
		$("#fade_duplicates_select")[0].value = "hide";

		e.preventDefault();
	}
}
_fade_editor.call(fade_editor);


$(document).ready(function()
{
	chrome.storage.local.get("flix_plus profilename", function(items)
	{
		_profilename = items["flix_plus profilename"];
		console.log(_profilename);

		key_prefix = "flix_plus " + _profilename + " ";

		var keys_dict = {};
		keys_dict[key_prefix + "fp_rated_style"] = "fade";
		keys_dict[key_prefix + "fp_rated_notinterested_style"] = "hide";
		keys_dict[key_prefix + "fp_watched_style"] = "tint";
		keys_dict[key_prefix + "fp_duplicates_style"] = "hide";

		chrome.storage.sync.get(keys_dict, function(items)
		{
			fade_editor.init(_profilename, items);
		});
	});
});