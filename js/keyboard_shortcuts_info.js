var keyboard_shortcuts_info = _keyboard_shortcuts_info || {};
var _keyboard_shortcuts_info = function(){
    var self = this;

    var _categories_in_order = ["Posters", "Sections", "Jump to page", "Misc"];

    var _keyboard_shortcuts_defs = {
      jump_kids: 
       { 
         default_key: 'd',
         description: 'Kids',
         category: 'Jump to page',
         order: 3 },
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
         category: 'Misc',
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
         order: 3 },
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
         default_key: 'z',
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
         default_key: 'r',
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
         order: 2 } }

    this.generate_defaults = function()
    {
        var new_defaults = [];
        var ids = Object.keys(_keyboard_shortcuts_defs);
        for (i = 0; i < ids.length; i++)
        {
            var obj = {};
            obj[ids[i]] =  _keyboard_shortcuts_defs[ids[i]]["default_key"];
            new_defaults.push(obj);
        }

        return new_defaults;
    }

    // Create dictionaries to look up keys and commands
    this.create_keyboard_shortcut_dicts = function(orig_shortcuts_list)
    {
        var keyboard_shortcut_to_id_dict = {};
        var keyboard_id_to_shortcut_dict = {};

        var dicts = [];

        var orig_shortcuts = Object.keys(orig_shortcuts_list);
        var len = orig_shortcuts_list.length;

        for (i = 0; i < len; i++)
        {
            var id = Object.keys(orig_shortcuts_list[i])[0];
            var key = orig_shortcuts_list[i][id];
            keyboard_shortcut_to_id_dict[key] = id;
            keyboard_id_to_shortcut_dict[id] = key;
        }
        dicts.push(keyboard_shortcut_to_id_dict);
        dicts.push(keyboard_id_to_shortcut_dict);

        return dicts;
    }

    // key is the storage.sync key
    this.load_shortcut_keys = function(key, callback)
    {
        chrome.storage.sync.get(key, function(items)
        {
            var keyboard_shortcuts = "";

            console.log(items[key]);

            if (typeof(items[key]) === "undefined")
            {
                console.log("generating default shortcut keys");
                keyboard_shortcuts = self.generate_defaults();
                console.log(keyboard_shortcuts);
            }
            else
            {
                console.log("shortcut keys found");
                keyboard_shortcuts = items[key];
                console.log(keyboard_shortcuts);
            }

            var dicts = self.create_keyboard_shortcut_dicts(keyboard_shortcuts);
            console.log("dicts");
            console.log(keyboard_shortcuts);
            console.log(dicts);
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
        ids_for_category.sort(function(a,b)
        {
            return (_keyboard_shortcuts_defs[a].order - _keyboard_shortcuts_defs[b].order);
        });

        return ids_for_category;
    }

    this.get_categories_in_order = function()
    {
        return _categories_in_order;
    };

    this.get_shortcuts_defs = function()
    {
        return _keyboard_shortcuts_defs;
    }

    // Note that the parameter here is different than the output of generate_defaults
    this.get_help_text = function(id_to_key_dict, link_to_editor)
    {        
        var s = id_to_key_dict; // s is for shortcut and is short to make it easy to reference the dict a lot 
        console.log(id_to_key_dict);

        console.log("get help text");
        var text = "Cursor and section are highlighted by borders.  Press '" + s["help"] + "' for list of commands or see below.<br><br>";
        text += "Move around items: " + s["move_right"] + ", " + s["move_left"] + ", " + s["move_home"] + ", " + s["move_end"] + "<BR>&nbsp;&nbsp;&nbsp;Play: " + s["play"] + "<BR>&nbsp;&nbsp;&nbsp;To My List: " + s["to_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;Remove from My List: " + s["remove_from_my_list"] + "<BR>";
        text += "&nbsp;&nbsp;&nbsp;Zoom into details: " + s["zoom_into_details"] + "<BR>&nbsp;&nbsp;&nbsp;Rate: " + s["rate_clear"] + " to clear, 0-5: " + s["rate_0"] + ", " + s["rate_1"] + ", " + s["rate_2"] + ", " + s["rate_3"] + ", " + s["rate_4"] + ", " + s["rate_5"] + "; half stars: " + s["rate_1_5"] + ", " + s["rate_2_5"] + ", " + s["rate_3_5"] + ", " + s["rate_4_5"]
        text += "<BR>&nbsp;&nbsp;&nbsp;Open link: " + s["open_link"];
        text += "<br><br>Move around sections: " + s["next_section"] + ", " + s["prev_section"] + ", " + s["section_home"] + ", " + s["section_end"] + "<BR>&nbsp;&nbsp;&nbsp;Open section link: " + s["open_section_link"] + "<br>&nbsp;&nbsp;&nbsp;Toggle scrollbars: " + s["toggle_scrollbars"] + "<br>";
        text += "&nbsp;&nbsp;&nbsp;Toggle hiding: " + s["toggle_hiding"] + "<br><br>Jump to page<br>&nbsp;&nbsp;&nbsp;Home: " + s["jump_instant_home"] + "<BR>&nbsp;&nbsp;&nbsp;My List : " + s["jump_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;New arrivals: " + s["jump_new_arrivals"] + "<br>&nbsp;&nbsp;&nbsp;Kids: " + s["jump_kids"];
        text += "<BR>&nbsp;&nbsp;&nbsp;Viewing activity: " + s["jump_viewing_activity"] + "<br>&nbsp;&nbsp;&nbsp;Your Ratings: " + s["jump_your_ratings"] + "<BR><br>Search: " + s["search"] + "<BR>Your Account: " + s["your_account"] + "<BR>Help: " + s["help"] + "<BR>";
        if (link_to_editor)
          text += "<br>Click 'configure' to the left to change shortcuts.";
        else
          text += "<br>Shortcut keys can be changed in options.";
        return text;
    }    
};
_keyboard_shortcuts_info.call(keyboard_shortcuts_info);
