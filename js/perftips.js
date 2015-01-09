var profileName_ = "_unknown";
var KEY_NAME = "flix_plus " + profileName_ + " prefs"; // Note: even though in all caps, this is a 'constant' that is initialized later on
var defaults_ = "$DEFAULT_SCRIPTS";
var enabledScripts_ = null;
var keyboard_id_to_shortcut_dict_;

$(document).ready(function() {
        console.log("1");
    document.getElementById("speed_up_homepage").addEventListener("click", function(e)
    {
        var text = "Speed up homepage.\n\nThis will disable the following scripts: {hide sections, remove scrollbars, fade/tint/hide duplicates, fade/tint/hide watched, fade/tint/hide rated, clicking on poster shows details instead of playing} and remove the keyboard navigation keys.\n\nAre you sure you want to do this?";
        if (confirm(text) === true)
        {
            var scriptNames = ["id_detail_view", "id_scrollbuster", "id_sectionhider", "id_fade_rated", "id_fade_watched", "id_remove_dupes"];

            for (i = 0; i < scriptNames.length; i++)
                delete enabledScripts_[scriptNames[i]];

            saveScriptList();


            // Update keyboard commands to clear out navigation keys

            var commandsToClear = ["prev_section", "next_section", "section_home", "section_end", "move_right", "move_left", "move_home", "move_end"];

            var keyboard_shortcuts = [];
            var commands = Object.keys(keyboard_id_to_shortcut_dict_);
            for (i = 0; i < commands.length; i++)
            {
                var obj = {};
                if (commandsToClear.indexOf(commands[i]) >= 0)
                    obj[commands[i]] = "None";
                else
                    obj[commands[i]] = keyboard_id_to_shortcut_dict_[commands[i]];

                keyboard_shortcuts.push(obj);
            }

            fplib.syncSet("flix_plus " + profile_name_ + " keyboard_shortcuts", keyboard_shortcuts, function() {
                console.log("saved");
                alert("Done making performance improvements for Netflix homepage.");
            });
        }
    });

    document.getElementById("speed_up_mylist").addEventListener("click", function(e)
    {
        var scriptNames = ["id_detail_view", "id_granulizer", "id_boximages_in_queue"];
        console.log(enabledScripts_);

        var text = "Speed up My List in manual mode.\n\nThis will disable the following scripts: {clicking on poster shows details instead of playing, show box images, allow rating by half star}.\n\nAre you sure you want to do this?";
        if (confirm(text) === true)
        {
            for (i = 0; i < scriptNames.length; i++)
            {
                console.log(scriptNames[i]);
                delete enabledScripts_[scriptNames[i]];
            }
            saveScriptList();
            alert("Done making performance improvements for My List.");
        }
    });

    $("#back_to_options")[0].href = (chrome.extension.getURL("src/options.html"));

    var loadSettings = function()
    {
        chrome.storage.sync.get(KEY_NAME, function(items)
        {
            //var all_prefs = localStorage["$EXTSHORTNAME " + profile_name_ + " prefs"];
            var allPrefs = items[KEY_NAME];
            if (typeof(allPrefs) === 'undefined')
                allPrefs = defaults_;

            var enabledScripts = {};
            var allPrefsArray = allPrefs.split(",");
            for (i = 0; i < allPrefsArray.length; i++)
            {
                if (allPrefsArray[i] !== "")
                    enabledScripts[allPrefsArray[i]] = "true";
            }
            //console.log("enabled_scripts = ");
            //console.log(enabled_scripts);
            enabledScripts_ = enabledScripts;
        });

        keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + profile_name_ + " keyboard_shortcuts", function(keyboard_shortcut_to_id_dict, keyboard_id_to_shortcut_dict)
        {
            keyboard_id_to_shortcut_dict_ = keyboard_id_to_shortcut_dict;
        });
    };

    var saveScriptList = function()
    {
        var enabledScriptsStr = Object.keys(enabledScripts_).toString();
        console.log(enabledScriptsStr);

        var obj = {};
        obj[KEY_NAME] = enabledScriptsStr;
        chrome.storage.sync.set(obj, function()
        {
            console.log("preferences updated");
        });
    };

    //// Actually do stuff /////
    chrome.storage.local.get("flix_plus profilename", function(items)
    {
        var profileName = items["flix_plus profilename"];

        console.log("profile name is blank");

        if (typeof(profileName) === "undefined")
        {
            // Just hide instead of telling the user to log in, etc.  Shouldn't happen anyway.
            $("#speed_up_homepage").hide();
            $("#speed_up_mylist").hide();
            $("#back_to_options").hide();
            return;
        }
        console.log("profile name is " + profileName);
        profileName_ = profileName;

        KEY_NAME = "flix_plus " + profileName + " prefs";

        loadSettings();
    });
});

