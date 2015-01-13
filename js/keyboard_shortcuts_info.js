// Note that this module uses snakecase for variable and function names.

var keyboard_shortcuts_info = _keyboard_shortcuts_info || {};
var _keyboard_shortcuts_info = function() {
    var self = this;

    var _categories_in_order = ["Posters", "Sections", "Player", "Jump to page", "Misc"];

    var _keyboard_shortcuts_defs = {
        reveal_spoilers:
        {
             default_key: 'e',
             description: 'Toggle Spoilers',
             category: 'Misc',
             order: 200 },

        jump_kids:
        {
             default_key: 'd',
             description: 'Kids',
             category: 'Jump to page',
             order: 3 },
        jump_whos_watching:
        {
             default_key: 'w',
             description: 'Who\'s Watching',
             category: 'Jump to page',
             order: 99 },
        section_show_random:
        {
             default_key: 'r',
             description: 'Random show/episode',
             category: 'Posters',
             order: 101 },
        player_toggle_audio:
        {
             default_key: 'u',
             description: 'Toggle audio tracks',
             category: 'Player',
             order: 103 },
        player_toggle_cc:
        {
             default_key: 'c',
             description: 'Toggle close captioning',
             category: 'Player',
             order: 102 },
        player_back_to_browse:
        {
             default_key: 'b',
             description: 'Back to browse',
             category: 'Player',
             order: 110 },
        update_rated_watched:
        {
             default_key: 'g',
             description: 'Update rated/watched',
             category: 'Misc',
             order: 101 },
        player_random_episode:
        {
             default_key: 'r',
             description: 'Random episode',
             category: 'Player',
             order: 101 },
        rate_clear:
        {
             default_key: '`',
             description: 'Rate Clear',
             category: 'Posters',
             order: 8 },
        jump_viewing_activity:
        {
             default_key: 'a',
             description: 'Viewing activity',
             category: 'Jump to page',
             order: 4 },
        your_account:
        {
             default_key: 'y',
             description: 'Your Account',
             category: 'Jump to page',
             order: 1 },
        move_right:
        {
             default_key: 'Right',
             description: 'Move right',
             category: 'Posters',
             order: 0 },
        remove_from_my_list:
        {
             default_key: '-',
             description: 'Remove from My List',
             category: 'Posters',
             order: 6 },
        open_section_link:
        {
             default_key: 'Ctrl-O',
             description: 'Open section link',
             category: 'Sections',
             order: 4 },
        help:
        {
             default_key: '?',
             description: 'Help',
             category: 'Misc',
             order: 500 },
        rate_1:
        {
             default_key: '1',
             description: 'Rate 1',
             category: 'Posters',
             order: 10 },
        rate_0:
        {
             default_key: '0',
             description: 'Rate 0',
             category: 'Posters',
             order: 9 },
        rate_3:
        {
             default_key: '3',
             description: 'Rate 3',
             category: 'Posters',
             order: 12 },
        rate_2:
        {
             default_key: '2',
             description: 'Rate 2',
             category: 'Posters',
             order: 11 },
        rate_5:
        {
             default_key: '5',
             description: 'Rate 5',
             category: 'Posters',
             order: 14 },
        rate_4:
        {
             default_key: '4',
             description: 'Rate 4',
             category: 'Posters',
             order: 13 },
        move_left:
        {
             default_key: 'Left',
             description: 'Move left',
             category: 'Posters',
             order: 1 },
        to_my_list:
        {
             default_key: '+',
             description: 'To My List',
             category: 'Posters',
             order: 5 },
        zoom_into_details:
        {
             default_key: 'Enter',
             description: 'Zoom into details',
             category: 'Posters',
             order: 7 },
        rate_4_5:
        {
             default_key: '9',
             description: 'Rate 4.5',
             category: 'Posters',
             order: 18 },
        jump_new_arrivals:
        {
             default_key: 'v',
             description: 'New arrivals',
             category: 'Jump to page',
             order: 2 },
        play:
        {
             default_key: 'p',
             description: 'Play',
             category: 'Posters',
             order: 4 },
        move_end:
        {
             default_key: 'End',
             description: 'Go to section ending',
             category: 'Posters',
             order: 3 },
        jump_instant_home:
        {
             default_key: 'i',
             description: 'Instant Home',
             category: 'Jump to page',
             order: 0 },
        section_end:
        {
             default_key: 'Ctrl-End',
             description: 'Last section',
             category: 'Sections',
             order: 3 },
        jump_my_list:
        {
             default_key: 'q',
             description: 'My List',
             category: 'Jump to page',
             order: 1 },
        move_home:
        {
             default_key: 'Home',
             description: 'Go to section beginning',
             category: 'Posters',
             order: 2 },
        prev_section:
        {
             default_key: 'Up',
             description: 'Previous section',
             category: 'Sections',
             order: 1 },
        search:
        {
             default_key: '/',
             description: 'Search',
             category: 'Misc',
             order: 0 },
        toggle_hiding:
        {
             default_key: 'h',
             description: 'Toggle hiding',
             category: 'Sections',
             order: 6 },
        rate_3_5:
        {
             default_key: '8',
             description: 'Rate 3.5',
             category: 'Posters',
             order: 17 },
        jump_your_ratings:
        {
             default_key: 't',
             description: 'Your Ratings',
             category: 'Jump to page',
             order: 5 },
        section_home:
        {
             default_key: 'Ctrl-Home',
             description: 'First section',
             category: 'Sections',
             order: 2 },
        open_link:
        {
             default_key: 'o',
             description: 'Open link',
             category: 'Posters',
             order: 19 },
        rate_2_5:
        {
             default_key: '7',
             description: 'Rate 2.5',
             category: 'Posters',
             order: 16 },
        toggle_scrollbars:
        {
             default_key: 's',
             description: 'Toggle scrollbars',
             category: 'Sections',
             order: 5 },
        rate_1_5:
        {
             default_key: '6',
             description: 'Rate 1.5',
             category: 'Posters',
             order: 15 },
        next_section:
        {
             default_key: 'Down',
             description: 'Next section',
             category: 'Sections',
             order: 0 },
        close_window:
        {
             default_key: 'Escape',
             description: 'Close window',
             category: 'Misc',
             order: 2 },
        player_mute:
        {
             default_key: 'None',
             description: 'Mute',
             category: 'Player',
             order: 0 },
        player_unmute:
        {
             default_key: 'None',
             description: 'Unmute',
             category: 'Player',
             order: 1 },
        player_toggle_mute:
        {
             default_key: 'm',
             description: 'Toggle mute',
             category: 'Player',
             order: 2 },
        player_volume_up:
        {
             default_key: 'Up',
             description: 'Volume up',
             category: 'Player',
             order: 3 },
        player_volume_down:
        {
             default_key: 'Down',
             description: 'Volume down',
             category: 'Player',
             order: 4 },
        player_fastforward:
        {
             default_key: 'None',
             description: 'Fast forward',
             category: 'Player',
             order: 5 },
        player_rewind:
        {
             default_key: 'None',
             description: 'Rewind',
             category: 'Player',
             order: 6 },
        player_goto_beginning:
        {
             default_key: 'Home',
             description: 'Goto beginning',
             category: 'Player',
             order: 7 },
        player_goto_ending:
        {
             default_key: 'End',
             description: 'Goto ending',
             category: 'Player',
             order: 8 },
        player_playpause:
        {
             default_key: 'Space',
             description: 'Play/pause',
             category: 'Player',
             order: 9 },
        player_play:
        {
             default_key: 'None',
             description: 'Play',
             category: 'Player',
             order: 10 },
        player_pause:
        {
             default_key: 'None',
             description: 'Pause',
             category: 'Player',
             order: 11 },
        player_nextepisode:
        {
             default_key: 'n',
             description: 'Next episode',
             category: 'Player',
             order: 12 },
        player_fullscreen:
        {
             default_key: 'f',
             description: 'Fullscreen',
             category: 'Player',
             order: 13 }
    };

    this.generate_defaults = function()
    {
        var new_defaults = [];
        var ids = Object.keys(_keyboard_shortcuts_defs);
        for (i = 0; i < ids.length; i++)
        {
            var obj = {};
            obj[ids[i]] = _keyboard_shortcuts_defs[ids[i]]["default_key"];
            new_defaults.push(obj);
        }

        return new_defaults;
    };

    this.generate_clear = function()
    {
        var new_defaults = [];
        var ids = Object.keys(_keyboard_shortcuts_defs);
        for (i = 0; i < ids.length; i++)
        {
            var obj = {};
            obj[ids[i]] = "None";
            new_defaults.push(obj);
        }

        return new_defaults;
    };

    this.get_already_has_shift_chars = function() {
        return ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
    };

    this.get_shift_symbols_dict = function() {
        return {"1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")"};
    };

    // Create dictionaries to look up keys and commands
    // Handle conflicts by making a preference based on the shortcuts group and the webpage
    this.create_keyboard_shortcut_dicts = function(orig_shortcuts_list)
    {
        var keyboard_shortcut_to_id_dict = {};
        var keyboard_id_to_shortcut_dict = {};

        var dicts = [];

        var orig_shortcuts = Object.keys(orig_shortcuts_list);
        var len = orig_shortcuts_list.length;

        var isPlayer = (location.pathname.indexOf("/WiPlayer") === 0);

        for (i = 0; i < len; i++)
        {
            var id = Object.keys(orig_shortcuts_list[i])[0];
            var key = orig_shortcuts_list[i][id];
            var category = _keyboard_shortcuts_defs[id]["category"];
            var should_add = false; // this only indicates if the shortcut->id mapping should take place or not.
            // We still want the mapping to show in editor UI and shortcuts help

            switch (category)
            {
                case "Posters":
                case "Sections":
                    should_add = !isPlayer;
                    break;
                case "Player":
                    should_add = isPlayer;
                    break;
                case "Jump to page":
                case "Misc":
                    should_add = true;
                    break;
            }
            if (should_add)
                keyboard_shortcut_to_id_dict[key] = id;
            keyboard_id_to_shortcut_dict[id] = key;
        }
        dicts.push(keyboard_shortcut_to_id_dict);
        dicts.push(keyboard_id_to_shortcut_dict);

        return dicts;
    };

    // key is the storage.sync key
    this.load_shortcut_keys = function(key, callback)
    {
        chrome.storage.sync.get(key, function(items)
        {
            var keyboard_shortcuts = "";

            //console.log(items[key]);

            if (typeof(items[key]) === "undefined")
            {
                    //console.log("generating default shortcut keys");
                    keyboard_shortcuts = self.generate_defaults();
                    //console.log(keyboard_shortcuts);
            }
            else
            {
                    //console.log("shortcut keys found");
                    keyboard_shortcuts = items[key];
                    //console.log(keyboard_shortcuts);
            }

            var dicts = self.create_keyboard_shortcut_dicts(keyboard_shortcuts);
            //console.log("dicts");
            //console.log(keyboard_shortcuts);
            //console.log(dicts);
            callback(dicts[0], dicts[1]);
        });
    };

    this.get_shortcuts_for_category = function(keyboard_id_to_shortcut_dict, category)
    {
        var ids_for_category = [];
        var keys = Object.keys(keyboard_id_to_shortcut_dict);
        var len = keys.length;
        var i;
        for (i = 0; i < len; i++)
        {
            var id = keys[i];
            var this_category = _keyboard_shortcuts_defs[id]["category"];
            if (this_category === category)
                ids_for_category.push(id);
        }

        // sort ids by 'order'
        ids_for_category.sort(function(a, b)
        {
            return (_keyboard_shortcuts_defs[a].order - _keyboard_shortcuts_defs[b].order);
        });

        return ids_for_category;
    };

    this.get_categories_in_order = function()
    {
        return _categories_in_order;
    };

    this.get_shortcuts_defs = function()
    {
        return _keyboard_shortcuts_defs;
    };

    // Ignores 'None'
    this.get_keys_string = function(shortcut_keys)
    {
        var keys = [];

        var str = "";
        var len = shortcut_keys.length;
        for (i = 0; i < len; i++)
            if (shortcut_keys[i] !== "None")
                keys.push(shortcut_keys[i]);

        var len2 = keys.length;
        for (i = 0; i < len2; i++)
        {
            str += keys[i];
            if (i < (len2 - 1))
                str += ", ";
        }

        if (str === "")
            str = "None";

        return str;
    };

    // Note that the first parameter here is different than the output of generate_defaults
    // context should be one of {"player", "nonplayer", "all"}
    this.get_help_text = function(id_to_key_dict, context)
    {
        var s = id_to_key_dict; // s is for shortcut and is short to make it easy to reference the dict a lot
        //console.log(id_to_key_dict);

        //console.log("get help text");
        var text = "Cursor and section are highlighted by borders (unless navigation keys are set to None).  Press '" + s["help"] + "' for list of commands or see below.  ";
        if (context === "all")
            text += "Click 'configure' to the left to change shortcuts.";
        else
            text += "<br><br>This list only shows the keys that work on this page (selection pages, show details, and the player are different.)  The complete list of shortcut keys can be viewed and changed in options.";

        if ((context !== "player") && (context !== "nonplayer-no-navigation") && (context !== "show_details"))
        {
            text += "<br><br>";
            text += "Move around items: " + self.get_keys_string([s["move_right"], s["move_left"], s["move_home"], s["move_end"]]);
            text += "<br>&nbsp;&nbsp;&nbsp;Play: " + s["play"];
            text += "<br>&nbsp;&nbsp;&nbsp;Zoom into details: " + s["zoom_into_details"];
            text += "<br>&nbsp;&nbsp;&nbsp;To My List: " + s["to_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;Remove from My List: " + s["remove_from_my_list"];
            text += "<br>&nbsp;&nbsp;&nbsp;Rate: " + s["rate_clear"] + " to clear, 0-5: " + s["rate_0"] + ", " + s["rate_1"] + ", " + s["rate_2"] + ", " + s["rate_3"] + ", " + s["rate_4"] + ", " + s["rate_5"] + "; half stars: " + s["rate_1_5"] + ", " + s["rate_2_5"] + ", " + s["rate_3_5"] + ", " + s["rate_4_5"];
            text += "<br>&nbsp;&nbsp;&nbsp;Open link: " + s["open_link"];
            text += "<br>&nbsp;&nbsp;&nbsp;Random show/episode: " + s["section_show_random"];

            text += "<br><br>Move around sections: " + self.get_keys_string([s["next_section"], s["prev_section"], s["section_home"], s["section_end"]]) + "<BR>&nbsp;&nbsp;&nbsp;Open section link: " + s["open_section_link"] + "<br>&nbsp;&nbsp;&nbsp;Toggle scrollbars: " + s["toggle_scrollbars"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Toggle hiding: " + s["toggle_hiding"];
        } else if (context === "nonplayer-no-navigation")
        {
            text += "<br><br>Many commands are not shown here because navigation is disabled.";
        }

        if (context === "show_details")
        {
            text += "<br><br>Show details";
            text += "<br>&nbsp;&nbsp;&nbsp;Play: " + s["play"];
            text += "<br>&nbsp;&nbsp;&nbsp;To My List: " + s["to_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;Remove from My List: " + s["remove_from_my_list"];
            text += "<br>&nbsp;&nbsp;&nbsp;Rate: " + s["rate_clear"] + " to clear, 0-5: " + s["rate_0"] + ", " + s["rate_1"] + ", " + s["rate_2"] + ", " + s["rate_3"] + ", " + s["rate_4"] + ", " + s["rate_5"] + "; half stars: " + s["rate_1_5"] + ", " + s["rate_2_5"] + ", " + s["rate_3_5"] + ", " + s["rate_4_5"];
            text += "<br>&nbsp;&nbsp;&nbsp;Random episode: " + s["section_show_random"];
        }

        if ((context === "player") || (context == "all"))
        {
            text += "<br><br>Player (Must be configured to use HTML5)<br>";
            text += "&nbsp;&nbsp;&nbsp;Muting: " + self.get_keys_string([s["player_toggle_mute"], s["player_mute"], s["player_unmute"]]) + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Change volume: " + self.get_keys_string([s["player_volume_up"], s["player_volume_down"]]) + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Jump to time: Right/Left (built-in), " + self.get_keys_string([s["player_fastforward"], s["player_rewind"], s["player_goto_beginning"], s["player_goto_ending"]]) + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Play/Pause: " + self.get_keys_string([s["player_playpause"], s["player_play"], s["player_pause"]]) + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Next episode: " + s["player_nextepisode"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Fullscreen: " + s["player_fullscreen"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Random episode: " + s["player_random_episode"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Toggle closed captioning: " + s["player_toggle_cc"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Toggle audio tracks: " + s["player_toggle_audio"] + "<br>";
            text += "&nbsp;&nbsp;&nbsp;Back to browse: " + s["player_back_to_browse"];
        }

        text += "<br><br>Jump to page<br>&nbsp;&nbsp;&nbsp;Home: " + s["jump_instant_home"] + "<BR>&nbsp;&nbsp;&nbsp;My List : " + s["jump_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;New arrivals: " + s["jump_new_arrivals"] + "<br>&nbsp;&nbsp;&nbsp;Kids: " + s["jump_kids"] + "<br>&nbsp;&nbsp;&nbsp;Who's Watching: " + s["jump_whos_watching"] + "<br>&nbsp;&nbsp;&nbsp;Your Account: " + s["your_account"];
        text += "<BR>&nbsp;&nbsp;&nbsp;Viewing activity: " + s["jump_viewing_activity"] + "<br>&nbsp;&nbsp;&nbsp;Your Ratings: " + s["jump_your_ratings"] + "<BR><br>Search: " + s["search"] + "<BR>Updated rated/watched: " + s["update_rated_watched"] + "<BR>Toggle spoilers: " + s["reveal_spoilers"] + "<BR>Close window: " + s["close_window"] + "<BR>"; + "<BR>Help: " + s["help"] + "<BR>";

        return text;
    };
};
_keyboard_shortcuts_info.call(keyboard_shortcuts_info);
