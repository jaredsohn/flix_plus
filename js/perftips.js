// Make changes to configuration to speed up Flix Plus performance
// See ../perftips.html for an explanation of what it does

"use strict";

var profileName_ = "_unknown";
var keyName_ = "flix_plus " + profileName_ + " prefs";
var defaults_ = "$DEFAULT_SCRIPTS";
var enabledScripts_ = null;
var keyboardIdToShortcutDict_;

$(document).ready(function() {
  document.getElementById("speed_up_homepage").addEventListener("click", function(e) {
    var text = "Speed up homepage.\n\nThis will disable the following" +
               "scripts: {hide sections, remove scrollbars, fade/tint/hide " +
               "duplicates, fade/tint/hide watched, fade/tint/hide " +
               "rated, clicking on poster shows details instead of playing}" +
               "and remove the keyboard navigation keys.\n\nAre you sure you" +
               " want to do this?";

    if (confirm(text) === true) {
      var scriptNames = ["id_detail_view", "id_scrollbuster", "id_sectionhider",
                         "id_fade_rated", "id_fade_watched", "id_remove_dupes"];

      scriptNames.forEach(function(scriptName) {
        delete enabledScripts_[scriptName];
      });

      saveScriptList();

      // Update keyboard commands to clear out navigation keys

      var commandsToClear = ["prev_section", "next_section", "section_home",
                             "section_end", "move_right", "move_left",
                             "move_home", "move_end"];

      var keyboardShortcuts = [];
      Object.keys(keyboardIdToShortcutDict_).forEach(function(cmd) {
        var obj = {};
        obj[cmd] = (commandsToClear.indexOf(cmd) >= 0) ? "None" : keyboardIdToShortcutDict_[cmd];
        keyboardShortcuts.push(obj);
      });

      fplib.syncSet("flix_plus " + profileName_ + " keyboard_shortcuts", keyboardShortcuts, function() {
        console.log("saved");
        alert("Done making performance improvements for Netflix homepage.");
      });
    }
  });

  document.getElementById("speed_up_mylist").addEventListener("click", function(e) {
    var scriptNames = ["id_detail_view", "id_granulizer", "id_boximages_in_queue"];
    console.log(enabledScripts_);

    var text = "Speed up My List in manual mode.\n\nThis will disable the " +
               "following scripts: {clicking on poster shows details instead" +
               " of playing, show box images, allow rating by half star}." +
               "\n\nAre you sure you want to do this?";

    if (confirm(text) === true) {
      scriptNames.forEach(function(scriptName) {
        delete enabledScripts_[scriptName];
      });
      saveScriptList();
      alert("Done making performance improvements for My List.");
    }
  });

  $("#back_to_options")[0].href = (chrome.extension.getURL("src/options.html"));

  var loadSettings = function() {
    chrome.storage.sync.get(keyName_, function(items) {
      var allPrefs = items[keyName_] || defaults_;

      enabledScripts_ = {};
      allPrefs.split(",").forEach(function(prefName) {
        if (prefName !== "")
          enabledScripts_[prefName] = "true";
      });
    });

    var keyboardShortcutsKey = "flix_plus " + profileName_ + " keyboard_shortcuts";
    keyboardShortcutsInfo.loadShortcutKeys(keyboardShortcutsKey, function(keyboardShortcutToIdDict, keyboardIdToShortcutDict) {
      keyboardIdToShortcutDict_ = keyboardIdToShortcutDict;
    });
  };

  var saveScriptList = function() {
    var enabledScriptsStr = Object.keys(enabledScripts_).toString();
    console.log(enabledScriptsStr);

    var obj = {};
    obj[keyName_] = enabledScriptsStr;
    chrome.storage.sync.set(obj, function() {
      console.log("preferences updated");
    });
  };

  //// Actually do stuff /////
  chrome.storage.local.get("flix_plus profilename", function(items) {
    var profileName = items["flix_plus profilename"];

    console.log("profile name is blank");

    if ((profileName || null) === null) {
      // Just hide instead of telling the user to log in, etc. Shouldn't happen anyway.
      $("#speed_up_homepage").hide();
      $("#speed_up_mylist").hide();
      $("#back_to_options").hide();
      return;
    }
    console.log("profile name is " + profileName);
    profileName_ = profileName;

    keyName_ = "flix_plus " + profileName + " prefs";

    loadSettings();
  });
});
