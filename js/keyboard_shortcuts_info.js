"use strict";

var keyboardShortcutsInfo = keyboardShortcutsInfo_ || {};
var keyboardShortcutsInfo_ = function() {
  var self = this;

  this.DISABLE_NAV_KEYBOARD = false;

  var categoriesInOrder_ = ["Posters", "Sections", "Player", "Jump to page", "Misc"];

  // Any new keys created after Flix Plus 2.0 should be included here so that existing users
  // will have keys assigned to default value (if still available)
  var newerKeyIds_ = ["player_slower", "player_faster", "next_tab", "prev_tab",
                      "next_season", "prev_season", "next_episode", "prev_episode"];

  var obsoleteKeyIdsDict_ = { "jump_whos_watching" : true, "open_link": true };

  var keyboardShortcutsDefs_ = {
    reveal_spoilers: {
      defaultKey: 'e',
      description: 'Toggle Spoilers',
      category: 'Misc',
      order: 200 },
    jump_kids: {
      defaultKey: 'd',
      description: 'Kids',
      category: 'Jump to page',
      order: 3 },
/*  jump_whos_watching: {
      defaultKey: 'w',
      description: 'Who\'s Watching',
      category: 'Jump to page',
      order: 99 },*/
    section_show_random: {
      defaultKey: 'r',
      description: 'Random show/episode',
      category: 'Posters',
      order: 101 },
    player_toggle_audio: {
      defaultKey: 'u',
      description: 'Toggle audio tracks',
      category: 'Player',
      order: 103 },
    player_toggle_cc: {
      defaultKey: 'c',
      description: 'Toggle close captioning',
      category: 'Player',
      order: 102 },
    player_back_to_browse: {
      defaultKey: 'b',
      description: 'Back to browse',
      category: 'Player',
      order: 110 },
    update_rated_watched: {
      defaultKey: 'g',
      description: 'Update rated/watched',
      category: 'Misc',
      order: 101 },
    player_random_episode: {
      defaultKey: 'r',
      description: 'Random episode',
      category: 'Player',
      order: 101 },
    rate_clear: {
      defaultKey: '`',
      description: 'Rate Clear',
      category: 'Posters',
      order: 8 },
    jump_viewing_activity: {
      defaultKey: 'a',
      description: 'Viewing activity',
      category: 'Jump to page',
      order: 4 },
    your_account: {
      defaultKey: 'y',
      description: 'Your Account',
      category: 'Jump to page',
      order: 1 },
    move_right: {
      defaultKey: 'Right',
      description: 'Move right',
      category: 'Posters',
      order: 0 },
    remove_from_my_list: {
      defaultKey: '-',
      description: 'Remove from My List',
      category: 'Posters',
      order: 6 },
    open_section_link: {
      defaultKey: 'o',
      description: 'Open section link',
      category: 'Sections',
      order: 4 },
    help: {
      defaultKey: '?',
      description: 'Help',
      category: 'Misc',
      order: 500 },
    rate_1: {
      defaultKey: '1',
      description: 'Rate 1',
      category: 'Posters',
      order: 10 },
    rate_0: {
      defaultKey: '0',
      description: 'Rate 0',
      category: 'Posters',
      order: 9 },
    rate_3: {
      defaultKey: '3',
      description: 'Rate 3',
      category: 'Posters',
      order: 12 },
    rate_2: {
      defaultKey: '2',
      description: 'Rate 2',
      category: 'Posters',
      order: 11 },
    rate_5: {
      defaultKey: '5',
      description: 'Rate 5',
      category: 'Posters',
      order: 14 },
    rate_4: {
      defaultKey: '4',
      description: 'Rate 4',
      category: 'Posters',
      order: 13 },
    move_left: {
      defaultKey: 'Left',
      description: 'Move left',
      category: 'Posters',
      order: 1 },
    to_my_list: {
      defaultKey: '+',
      description: 'To My List',
      category: 'Posters',
      order: 5 },
    zoom_into_details: {
      defaultKey: 'Enter',
      description: 'Zoom into details',
      category: 'Posters',
      order: 7 },
    rate_4_5: {
      defaultKey: '9',
      description: 'Rate 4.5',
      category: 'Posters',
      order: 18 },
    jump_new_arrivals: {
      defaultKey: 'v',
      description: 'New arrivals',
      category: 'Jump to page',
      order: 2 },
    play: {
      defaultKey: 'p',
      description: 'Play',
      category: 'Posters',
      order: 4 },
    move_end: {
      defaultKey: 'End',
      description: 'Go to section ending',
      category: 'Posters',
      order: 3 },
    jump_instant_home: {
      defaultKey: 'i',
      description: 'Instant Home',
      category: 'Jump to page',
      order: 0 },
    section_end: {
      defaultKey: 'Ctrl-End',
      description: 'Last section',
      category: 'Sections',
      order: 3 },
    jump_my_list: {
      defaultKey: 'q',
      description: 'My List',
      category: 'Jump to page',
      order: 1 },
    move_home: {
      defaultKey: 'Home',
      description: 'Go to section beginning',
      category: 'Posters',
      order: 2 },
    prev_section: {
      defaultKey: 'Up',
      description: 'Previous section',
      category: 'Sections',
      order: 1 },
    search: {
      defaultKey: '/',
      description: 'Search',
      category: 'Misc',
      order: 0 },
    toggle_hiding: {
      defaultKey: 'h',
      description: 'Toggle hiding',
      category: 'Sections',
      order: 6 },
    rate_3_5: {
      defaultKey: '8',
      description: 'Rate 3.5',
      category: 'Posters',
      order: 17 },
    jump_your_ratings: {
      defaultKey: 't',
      description: 'Your Ratings',
      category: 'Jump to page',
      order: 5 },
    section_home: {
      defaultKey: 'Ctrl-Home',
      description: 'First section',
      category: 'Sections',
      order: 2 },
/*  open_link: {
      defaultKey: 'o', // Note: key now used for open section link
      description: 'Open link',
      category: 'Posters',
      order: 19 },*/
    rate_2_5: {
      defaultKey: '7',
      description: 'Rate 2.5',
      category: 'Posters',
      order: 16 },
    toggle_scrollbars: {
      defaultKey: 's',
      description: 'Toggle scrollbars',
      category: 'Sections',
      order: 5 },
    rate_1_5: {
      defaultKey: '6',
      description: 'Rate 1.5',
      category: 'Posters',
      order: 15 },
    next_section: {
      defaultKey: 'Down',
      description: 'Next section',
      category: 'Sections',
      order: 0 },
    close_window: {
      defaultKey: 'Escape',
      description: 'Close window',
      category: 'Misc',
      order: 2 },
    player_mute: {
      defaultKey: 'None',
      description: 'Mute',
      category: 'Player',
      order: 0 },
    player_faster: {
      defaultKey: ']',
      description: 'Faster',
      category: 'Player',
      order: 200 },
    player_slower: {
      defaultKey: '[',
      description: 'Slower',
      category: 'Player',
      order: 202 },
    player_unmute: {
      defaultKey: 'None',
      description: 'Unmute',
      category: 'Player',
      order: 1 },
    player_toggle_mute: {
      defaultKey: 'm',
      description: 'Toggle mute',
      category: 'Player',
      order: 2 },
    player_volume_up: {
      defaultKey: 'Up',
      description: 'Volume up',
      category: 'Player',
      order: 3 },
    player_volume_down: {
      defaultKey: 'Down',
      description: 'Volume down',
      category: 'Player',
      order: 4 },
    player_fastforward: {
      defaultKey: 'None',
      description: 'Fast forward',
      category: 'Player',
      order: 5 },
    player_rewind: {
      defaultKey: 'None',
      description: 'Rewind',
      category: 'Player',
      order: 6 },
    player_goto_beginning: {
      defaultKey: 'Home',
      description: 'Goto beginning',
      category: 'Player',
      order: 7 },
    player_goto_ending: {
      defaultKey: 'End',
      description: 'Goto ending',
      category: 'Player',
      order: 8 },
    player_playpause: {
      defaultKey: 'Space',
      description: 'Play/pause',
      category: 'Player',
      order: 9 },
    player_play: {
      defaultKey: 'None',
      description: 'Play',
      category: 'Player',
      order: 10 },
    player_pause: {
      defaultKey: 'None',
      description: 'Pause',
      category: 'Player',
      order: 11 },
    player_nextepisode: {
      defaultKey: 'n',
      description: 'Next episode',
      category: 'Player',
      order: 12 },
    player_fullscreen: {
      defaultKey: 'f',
      description: 'Fullscreen',
      category: 'Player',
      order: 13 },
    next_tab: {
      defaultKey: 'j',
      description: 'Next tab',
      category: 'Posters',
      order: 200 },
    prev_tab: {
      defaultKey: 'k',
      description: 'Previous Tab',
      category: 'Posters',
      order: 201 },
    next_season: {
      defaultKey: 'z',
      description: 'Next season',
      category: 'Posters',
      order: 202 },
    prev_season: {
      defaultKey: 'x',
      description: 'Previous season',
      category: 'Posters',
      order: 203 },
    next_episode: {
      defaultKey: 'n',
      description: 'Next episode',
      category: 'Posters',
      order: 204 },
    prev_episode: {
      defaultKey: 'm',
      description: 'Previous episode',
      category: 'Posters',
      order: 205 }
  };

  this.generateDefaults = function() {
    var newDefaults = [];
    Object.keys(keyboardShortcutsDefs_).forEach(function(id) {
      var obj = {};
      obj[id] = keyboardShortcutsDefs_[id]["defaultKey"];
      newDefaults.push(obj);
    });

    return newDefaults;
  };

  this.generateClear = function() {
    var newDefaults = [];
    Object.keys(keyboardShortcutsDefs_).forEach(function(id) {
      var obj = {};
      obj[id] = "None";
      newDefaults.push(obj);
    });

    return newDefaults;
  };

  this.getAlreadyHasShiftChars = function() {
    return ["~", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+", "{", "}", "|", ":", "\"", "<", ">", "?", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  };

  this.getShiftSymbolsDict = function() {
    return {"1": "!", "2": "@", "3": "#", "4": "$", "5": "%", "6": "^", "7": "&", "8": "*", "9": "(", "0": ")"};
  };

  // Create dictionaries to look up keys and commands
  // Handle conflicts by making a preference based on the shortcuts group and the webpage
  this.createKeyboardShortcutDicts = function(origShortcutsList) {
    var keyboardShortcutToIdDict = {};
    var keyboardIdToShortcutDict = {};

    var dicts = [];

    var origShortcuts = Object.keys(origShortcutsList);
    var len = origShortcutsList.length;

    var isPlayer = (location.pathname.indexOf("/watch") === 0);

    origShortcutsList.forEach(function(origShortcut) {
      var id = Object.keys(origShortcut)[0];
      var key = origShortcut[id];

      if ((obsoleteKeyIdsDict_[id] || null) !== null)
        return;

      var category = keyboardShortcutsDefs_[id]["category"];
      var shouldAdd = false; // this only indicates if the shortcut->id mapping should take place or not.
      // We still want the mapping to show in editor UI and shortcuts help

      switch (category) {
        case "Posters":
        case "Sections":
          shouldAdd = !isPlayer;
          if (self.DISABLE_NAV_KEYBOARD)
            shouldAdd = false;
          break;
        case "Player":
          shouldAdd = isPlayer;
          break;
        case "Jump to page":
        case "Misc":
          shouldAdd = true;
          break;
      }
      if (shouldAdd)
        keyboardShortcutToIdDict[key] = id;
      keyboardIdToShortcutDict[id] = key;
    });
    dicts.push(keyboardShortcutToIdDict);
    dicts.push(keyboardIdToShortcutDict);

    return dicts;
  };

  // key is the storage.sync key
  this.loadShortcutKeys = function(key, callback) {
    console.log("loadshortcutkeys key = ");
    console.log(key);
    chrome.storage.sync.get(key, function(items) {
      var keyboardShortcuts = "";

      //console.log(items[key]);

      if ((items[key] || null) === null) {
        //console.log("generating default shortcut keys");
        keyboardShortcuts = self.generateDefaults();
        //console.log(keyboardShortcuts);
      } else {
        //console.log("shortcut keys found");
        keyboardShortcuts = items[key];

        //console.log(keyboardShortcuts);
      }

      var dicts = self.createKeyboardShortcutDicts(keyboardShortcuts);
      //console.log("dicts");
      //console.log(keyboardShortcuts);
      //console.log(dicts);

      // If newer keys are not defined, then set to default values (so long as keys aren't assigned to something else already)
      newerKeyIds_.forEach(function(newerKeyId) {
        if ((dicts[1][newerKeyId] || null) === null) {
          var defaultKey = keyboardShortcutsDefs_[newerKeyId].defaultKey;
          if ((dicts[0][defaultKey] || null) === null) {
            dicts[0][defaultKey] = newerKeyId;
            dicts[1][newerKeyId] = defaultKey;
          }
        }
      });

      callback(dicts[0], dicts[1]);
    });
  };

  this.getShortcutsForCategory = function(category) {
    var idsForCategory = [];
    Object.keys(keyboardShortcutsDefs_).forEach(function(id) {
      var thisCategory = keyboardShortcutsDefs_[id]["category"];
      if (thisCategory === category)
        idsForCategory.push(id);
    });

    // sort idsForCategory ids by 'order'
    idsForCategory.sort(function(a, b) {
      return (keyboardShortcutsDefs_[a].order - keyboardShortcutsDefs_[b].order);
    });

    return idsForCategory;
  };

  this.getCategoriesInOrder = function() {
    return categoriesInOrder_;
  };

  this.getShortcutsDefs = function() {
    return keyboardShortcutsDefs_;
  };

  // Groups together or ignores 'None'
  this.getKeysString = function(shortcutKeys) {
    if ((shortcutKeys || null) === null)
      return "None";

    var keys = [];
    shortcutKeys.forEach(function(shortcutKey) {
      var key = shortcutKey || null;
      if ((key !== null) && (key !== "None"))
        keys.push(key);
    });

    var str = keys.join(", ");
    return (str !== "") ? str : "None";
  };

  // Note that the first parameter here is different than the output of generateDefaults
  // context should be one of {"player", "nonplayer", "all"}
  this.getHelpText = function(idToKeyDict, context) {
    var s = idToKeyDict; // s is for shortcut and is short to make it easy to reference the dict a lot
    //console.log(idToKeyDict);

    //console.log("get help text");
    var text = "Cursor and section are highlighted by borders (unless navigation keys are set to None).  Press '" + s["help"] + "' for list of commands or see below.  ";
    if (context === "all")
      text += "Click 'configure' to the left to change shortcuts.";
    else
      text += "<br><br>This list only shows the keys that work on this page (selection pages, show details, and the player are different.)  The complete list of shortcut keys can be viewed and changed in options.";

    if (!self.DISABLE_NAV_KEYBOARD) {
      if ((context !== "player") && (context !== "nonplayer-no-navigation") && (context !== "show_details")) {
        text += "<br><br>";
        text += "Move around items: " + self.getKeysString([s["move_right"], s["move_left"], s["move_home"], s["move_end"]]);
        text += "<br>&nbsp;&nbsp;&nbsp;Play: " + s["play"];
        text += "<br>&nbsp;&nbsp;&nbsp;Zoom into details: " + s["zoom_into_details"];
        text += "<br>&nbsp;&nbsp;&nbsp;To My List: " + s["to_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;Remove from My List: " + s["remove_from_my_list"];
        text += "<br>&nbsp;&nbsp;&nbsp;Rate: " + s["rate_clear"] + " to clear, 0-5: " + s["rate_0"] + ", " + s["rate_1"] + ", " + s["rate_2"] + ", " + s["rate_3"] + ", " + s["rate_4"] + ", " + s["rate_5"] + "; half stars: " + s["rate_1_5"] + ", " + s["rate_2_5"] + ", " + s["rate_3_5"] + ", " + s["rate_4_5"];
        text += "<br>&nbsp;&nbsp;&nbsp;Random show/episode: " + s["section_show_random"];
        text += "<br>&nbsp;&nbsp;&nbsp;Next tab: " + s["next_tab"] + ", prev tab: " + s["prev_tab"];
        text += "<br>&nbsp;&nbsp;&nbsp;Next season: " + s["next_season"] + ", prev season: " + s["prev_season"];
        text += "<br>&nbsp;&nbsp;&nbsp;Next episode: " + s["next_episode"] + ", prev episode: " + s["prev_episode"];

        text += "<br><br>Move around sections: " + self.getKeysString([s["next_section"], s["prev_section"], s["section_home"], s["section_end"]]) + "<BR>&nbsp;&nbsp;&nbsp;Open section link: " + s["open_section_link"] + "<br>&nbsp;&nbsp;&nbsp;Toggle scrollbars: " + s["toggle_scrollbars"] + "<br>";
        text += "&nbsp;&nbsp;&nbsp;Toggle hiding: " + s["toggle_hiding"];
      } else if (context === "nonplayer-no-navigation") {
        text += "<br><br>Many commands are not shown here because navigation is disabled.";
      }

      if (context === "show_details") {
        text += "<br><br>Show details";
        text += "<br>&nbsp;&nbsp;&nbsp;Play: " + s["play"];
        text += "<br>&nbsp;&nbsp;&nbsp;To My List: " + s["to_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;Remove from My List: " + s["remove_from_my_list"];
        text += "<br>&nbsp;&nbsp;&nbsp;Rate: " + s["rate_clear"] + " to clear, 0-5: " + s["rate_0"] + ", " + s["rate_1"] + ", " + s["rate_2"] + ", " + s["rate_3"] + ", " + s["rate_4"] + ", " + s["rate_5"] + "; half stars: " + s["rate_1_5"] + ", " + s["rate_2_5"] + ", " + s["rate_3_5"] + ", " + s["rate_4_5"];
        text += "<br>&nbsp;&nbsp;&nbsp;Random episode: " + s["section_show_random"];
      }
    } else {
      text += "<br><br>Navigation commands have been temporarily removed since they are not yet supported for Netflix's June 2015 update.";
    }

    if ((context === "player") || (context == "all")) {
      text += "<br><br>Player (Must be configured to use HTML5)<br>";
      text += "&nbsp;&nbsp;&nbsp;Muting: " + self.getKeysString([s["player_toggle_mute"], s["player_mute"], s["player_unmute"]]) + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Change volume: " + self.getKeysString([s["player_volume_up"], s["player_volume_down"]]) + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Jump to time: Right/Left (built-in), " + self.getKeysString([s["player_fastforward"], s["player_rewind"], s["player_goto_beginning"], s["player_goto_ending"]]) + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Play/Pause: " + self.getKeysString([s["player_playpause"], s["player_play"], s["player_pause"]]) + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Next episode: " + s["player_nextepisode"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Fullscreen: " + s["player_fullscreen"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Random episode: " + s["player_random_episode"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Toggle closed captioning: " + s["player_toggle_cc"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Toggle audio tracks: " + s["player_toggle_audio"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Back to browse: " + s["player_back_to_browse"] + "<br>";
      text += "&nbsp;&nbsp;&nbsp;Slower/faster: " + self.getKeysString([s["player_slower"], s["player_faster"]]) + "<br>";
    }

    text += "<br><br>Jump to page<br>&nbsp;&nbsp;&nbsp;Home: " + s["jump_instant_home"] + "<BR>&nbsp;&nbsp;&nbsp;My List : " + s["jump_my_list"] + "<BR>&nbsp;&nbsp;&nbsp;New arrivals: " + s["jump_new_arrivals"] + "<br>&nbsp;&nbsp;&nbsp;Kids: " + s["jump_kids"] + "<br>&nbsp;&nbsp;&nbsp;Your Account: " + s["your_account"];
    text += "<BR>&nbsp;&nbsp;&nbsp;Viewing activity: " + s["jump_viewing_activity"] + "<br>&nbsp;&nbsp;&nbsp;Your Ratings: " + s["jump_your_ratings"] + "<BR><br>Search: " + s["search"] + "<BR>Updated rated/watched: " + s["update_rated_watched"] + "<BR>Toggle spoilers: " + s["reveal_spoilers"] + "<BR>Close window: " + s["close_window"] + "<BR>"; + "<BR>Help: " + s["help"] + "<BR>";

    return text;
  };
};
keyboardShortcutsInfo_.call(keyboardShortcutsInfo);
