var fadeEditor = fadeEditor || {};
var fadeEditor_ = function() {
  var self = this;
  var profileName_ = "undefined";

  this.init = function(profileName, configItems) {
    console.log("configItems");
    console.log(configItems);
    console.log("init");
    profileName_ = profileName;
    document.getElementById("save").addEventListener("click", self.onSave);
    document.getElementById("defaults").addEventListener("click", self.onRestoreDefaults);
    Object.keys(configItems).forEach(function(key) {
      if (configItems[key] === "hide")
        configItems[key] = "fade";
    });

    $("#fade_rated_select")[0].value = configItems["flix_plus " + profileName_ + " fp_rated_style"];
    $("#fade_rated_notinterested_select")[0].value = configItems["flix_plus " + profileName_ + " fp_rated_notinterested_style"];
    $("#fade_watched_select")[0].value = configItems["flix_plus " + profileName_ + " fp_watched_style"];
    $("#fade_duplicates_select")[0].value = configItems["flix_plus " + profileName_ + " fp_duplicates_style"];
    $("#notv")[0].checked = configItems["flix_plus " + profileName_ + " fp_ignore_tv"];
  };

  this.onSave = function(e) {
    e.preventDefault();

    var dict = {};
    dict["flix_plus " + profileName_ + " fp_rated_style"] = $("#fade_rated_select")[0].value;
    dict["flix_plus " + profileName_ + " fp_rated_notinterested_style"] = $("#fade_rated_notinterested_select")[0].value;
    dict["flix_plus " + profileName_ + " fp_watched_style"] = $("#fade_watched_select")[0].value;
    dict["flix_plus " + profileName_ + " fp_duplicates_style"] = $("#fade_duplicates_select")[0].value;
    dict["flix_plus " + profileName_ + " fp_ignore_tv"] = $("#notv")[0].checked;

    chrome.storage.sync.set(dict, function() {
      alert("Saved");
    });
  };

  this.onRestoreDefaults = function(e) {
    $("#fade_rated_select")[0].value = "fade";
    $("#fade_rated_notinterested_select")[0].value = "fade";
    $("#fade_watched_select")[0].value = "tint";
    $("#fade_duplicates_select")[0].value = "fade";
    $("#notv")[0].checked = true;

    e.preventDefault();
  };
};
fadeEditor_.call(fadeEditor);

$(document).ready(function() {
  chrome.storage.local.get("flix_plus profilename", function(items) {
    profileName_ = items["flix_plus profilename"];
    console.log(profileName_);

    keyPrefix = "flix_plus " + profileName_ + " ";

    var keysDict = {};
    keysDict[keyPrefix + "fp_rated_style"] = "fade";
    keysDict[keyPrefix + "fp_rated_notinterested_style"] = "hide";
    keysDict[keyPrefix + "fp_watched_style"] = "tint";
    keysDict[keyPrefix + "fp_duplicates_style"] = "hide";
    keysDict[keyPrefix + "fp_ignore_tv"] = true;

    chrome.storage.sync.get(keysDict, function(items) {
      fadeEditor.init(profileName_, items);
    });
  });
});
