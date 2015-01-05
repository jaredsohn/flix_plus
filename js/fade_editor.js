var fadeEditor = fadeEditor || {};
var _fadeEditor = function() {
    var self = this;
    var _profileName = "undefined";

    this.init = function(profileName, configItems)
    {
        console.log("configItems");
        console.log(configItems);
        console.log("init");
        _profileName = profileName;
        document.getElementById("save").addEventListener("click", self.onSave);
        document.getElementById("defaults").addEventListener("click", self.onRestoreDefaults);

        $("#fade_rated_select")[0].value = configItems["flix_plus " + _profileName + " fp_rated_style"];
        $("#fade_rated_notinterested_select")[0].value = configItems["flix_plus " + _profileName + " fp_rated_notinterested_style"];
        $("#fade_watched_select")[0].value = configItems["flix_plus " + _profileName + " fp_watched_style"];
        $("#fade_duplicates_select")[0].value = configItems["flix_plus " + _profileName + " fp_duplicates_style"];
        $("#notv")[0].checked = configItems["flix_plus " + _profileName + " fp_ignore_tv"];
    };

    this.onSave = function(e)
    {
        e.preventDefault();

        var dict = {};
        dict["flix_plus " + _profileName + " fp_rated_style"] = $("#fade_rated_select")[0].value;
        dict["flix_plus " + _profileName + " fp_rated_notinterested_style"] = $("#fade_rated_notinterested_select")[0].value;
        dict["flix_plus " + _profileName + " fp_watched_style"] = $("#fade_watched_select")[0].value;
        dict["flix_plus " + _profileName + " fp_duplicates_style"] = $("#fade_duplicates_select")[0].value;
        dict["flix_plus " + _profileName + " fp_ignore_tv"] = $("#notv")[0].checked;

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
        $("#notv")[0].checked = true;

        e.preventDefault();
    };
};
_fadeEditor.call(fadeEditor);


$(document).ready(function()
{
    chrome.storage.local.get("flix_plus profilename", function(items)
    {
        _profileName = items["flix_plus profilename"];
        console.log(_profileName);

        key_prefix = "flix_plus " + _profileName + " ";

        var keys_dict = {};
        keys_dict[key_prefix + "fp_rated_style"] = "fade";
        keys_dict[key_prefix + "fp_rated_notinterested_style"] = "hide";
        keys_dict[key_prefix + "fp_watched_style"] = "tint";
        keys_dict[key_prefix + "fp_duplicates_style"] = "hide";
        keys_dict[key_prefix + "fp_ignore_tv"] = true;

        chrome.storage.sync.get(keys_dict, function(items)
        {
            fadeEditor.init(_profileName, items);
        });
    });
});
