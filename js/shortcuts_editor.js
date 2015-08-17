// Flix Plus keyboard shortcuts editor
"use strict";

var shortcutsEditor = shortcutsEditor || {};
var shortcutsEditor_ = function() {
  var self = this;
  var profileName_ = "undefined";

  var keyboardIdToShortcutDict_ = {};
  var keyboardShortcutToIdDict_ = {};

  this.clearShortcuts = function() {
    var shortcutsDiv = document.getElementById("shortcuts");
    shortcutsDiv.innerText = "";
  };

  this.keyIsDuplicate = function(keyCombo, id, category) {
    var isDuplicate = false;

    if (keyCombo === "None")
      return false;

    // look at ui
    var keys;

    console.log(keyCombo);
    console.log(id);
    console.log(category);

    switch (category) {
      case "Misc":
      case "Jump to page":
        keys = $(
                "#category_Player .shortcut_item, " +
                "#category_Posters .shortcut_item, " +
                "#category_Sections .shortcut_item, " +
                "#category_Jumptopage .shortcut_item, " +
                "#category_Misc .shortcut_item"
            );
        break;
      case "Posters":
      case "Sections":
        keys = $(
                "#category_Posters .shortcut_item, " +
                "#category_Sections .shortcut_item, " +
                "#category_Jumptopage .shortcut_item, " +
                "#category_Misc .shortcut_item"
            );
        break;
      case "Player":
        keys = $(
                "#category_Player .shortcut_item, " +
                "#category_Jumptopage .shortcut_item, " +
                "#category_Misc .shortcut_item"
            );
        break;
    }

    for (var i = 0; i < keys.length; i++) {
      if (keys[i].id === id)
        continue;
      if ($("input", keys[i])[0].value === keyCombo) {
        isDuplicate = true;
        break;
      }
    }
    console.log(isDuplicate);

    return isDuplicate;
  };

  this.showShortcuts = function(keyboardShortcutToIdDict, keyboardIdToShortcutDict) {
    keyboardIdToShortcutDict_ = keyboardIdToShortcutDict;
    keyboardShortcutToIdDict_ = keyboardShortcutToIdDict;

    var shortcutsDiv = document.getElementById("shortcuts");

    var node = document.createElement("br");
    shortcutsDiv.appendChild(node);

    var categories = keyboardShortcutsInfo.getCategoriesInOrder();
    //console.log(categories);
    var id;

    for (var categoryIndex = 0; categoryIndex < categories.length; categoryIndex++) {
      var defs = keyboardShortcutsInfo.getShortcutsDefs();

      node = document.createElement("div");
      node.innerText = categories[categoryIndex];
      node.className = "shortcuts_category";
      node.style.innerText = "font-weight: bold";
      shortcutsDiv.appendChild(node);
      var categoryDiv = document.createElement("div");
      categoryDiv.id = "category_" + categories[categoryIndex].replace(new RegExp(" ", 'g'), "");
      shortcutsDiv.appendChild(categoryDiv);

      //console.log("For category '" + categories[categoryIndex] + "'");
      var idsForCategory = keyboardShortcutsInfo.getShortcutsForCategory(categories[categoryIndex]);
      var idsForCategoryLen = idsForCategory.length;

      for (var j = 0; j < idsForCategoryLen; j++) {
        //console.log(idsForCategory[j] + " - " + keyboardIdToShortcutDict[idsForCategory[j]]);

        var divNode = document.createElement("div");
        divNode.className = "shortcut_item";
        categoryDiv.appendChild(divNode);

        node = document.createElement("div");
        node.innerText = defs[idsForCategory[j]].description;
        node.className = "shortcuts_desc";
        divNode.appendChild(node);

        node = document.createElement("input");
        node.type = "text";
        node.name = "fname";
        node.id = idsForCategory[j];
        node.className = "shortcuts_key";
        var val = keyboardIdToShortcutDict[idsForCategory[j]];
        val = val || "None";
        node.value = val;
        divNode.appendChild(node);

        node = document.createElement("br");
        categoryDiv.appendChild(node);
      }
      var node = document.createElement("br");
      categoryDiv.appendChild(node);
    }

    $(".shortcuts_key").each(function() { this.addEventListener("keydown", function(e) {
      console.log("keydown");
      console.log(e);

      id = this.id;
      var keyCombo = "";
      if ((e.keyCode >= 33) && (e.keyCode <= 127)) {
        keyCombo = String.fromCharCode(e.charCode || e.which).toLowerCase();
      }
      switch (e.keyCode) {
        case 8: keyCombo = "None"; break;
        case 13: keyCombo = "Enter"; break;
        case 27: keyCombo = "Escape"; break;
        case 32: keyCombo = "Space"; break;
        case 33: keyCombo = "PgUp"; break;
        case 34: keyCombo = "PgDn"; break;
        case 35: keyCombo = e.ctrlKey ? "Ctrl-End" : "End"; break;
        case 36: keyCombo = e.ctrlKey ? "Ctrl-Home" : "Home"; break;
        case 37: keyCombo = "Left"; break;
        case 38: keyCombo = "Up"; break;
        case 39: keyCombo = "Right"; break;
        case 40: keyCombo = "Down"; break;
        case 45: keyCombo = "Insert"; break;
        case 46: keyCombo = "Delete"; break;
        case 79:
          if ((e.altKey) || (e.metaKey))
            return;
          if (e.ctrlKey)
            keyCombo = "Ctrl-O";
          break;
        default:
          if ((e.altKey) || (e.metaKey) || (e.ctrlKey))
            return; // don't allow for most keys
      }
      if (keyCombo === "")
        return;

      e.preventDefault();

      var ignoreShift = (keyboardShortcutsInfo.getAlreadyHasShiftChars().indexOf(keyCombo) !== -1);

      //if ((e.altKey)) keyCombo = "Alt-" + keyCombo;
      //if ((e.ctrlKey)) keyCombo = "Ctrl-" + keyCombo;
      if (!ignoreShift && (e.shiftKey)) {
        return;
        //keyCombo = "Shift-" + keyCombo;
      }

      if ((keyCombo.length === 1) && e.shiftKey) {
        var dict = keyboardShortcutsInfo.getShiftSymbolsDict();
        if (keyCombo in dict)
          keyCombo = dict[keyCombo];
        else
          keyCombo = keyCombo.toLowerCase();
      }

      var defs = keyboardShortcutsInfo.getShortcutsDefs();
      if ((["Player", "Jump to page", "Misc"].indexOf(defs[id].category) !== -1) &&
          ((["Left", "Right"].indexOf(keyCombo) !== -1)))
        return; // Don't allow left/right arrow keys for global or player keys

      // Make sure that key is unique (based on section)
      if (self.keyIsDuplicate(keyCombo, this.id, defs[id].category))
        return;

      // Remove old key
      var oldShortcut = keyboardIdToShortcutDict_[id];
      delete keyboardIdToShortcutDict_[id];
      delete keyboardShortcutToIdDict_[oldShortcut];

      // Save new key
      keyboardShortcutToIdDict_[keyCombo] = id;
      keyboardIdToShortcutDict_[id] = keyCombo;

      this.value = keyCombo;
    }, true); });

    $(".shortcuts_key").each(function() { this.addEventListener("keypress", function(e) {
      console.log("keypress");

      if ((e.altKey) || (e.ctrlKey) || (e.metaKey)) {
        // We don't allow alt, ctrl, and comand keys right now (helps avoid breaking system keys)
        return;
      }
      e.preventDefault();

      id = this.id;
      keyCombo = String.fromCharCode(e.charCode || e.which).toLowerCase();
      //console.log("keycombo is");
      //console.log(keyCombo);

      ignoreShift = (keyboardShortcutsInfo.getAlreadyHasShiftChars().indexOf(keyCombo) !== -1);

      if (e.altKey || e.ctrlKey || (!ignoreShift && (e.shiftKey)))
        keyCombo = keyCombo.toUpperCase();

      if (e.altKey) keyCombo = "Alt-" + keyCombo;
      if (e.ctrlKey) keyCombo = "Ctrl-" + keyCombo;
      if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift-" + keyCombo;
      if (keyCombo.length > 1)
        return; // alt, ctrl, shift not supported right now

      if (e.shiftKey && (keyCombo.length === 1)) {
        var dict = keyboardShortcutsInfo.getShiftSymbolsDict();
        if (keyCombo in dict)
          keyCombo = dict[keyCombo];
        else
          keyCombo = keyCombo.toLowerCase();
      }

      // Remove old key
      var oldShortcut = keyboardIdToShortcutDict_[id];
      delete keyboardIdToShortcutDict_[id];
      delete keyboardShortcutToIdDict_[oldShortcut];

      // Save new key
      keyboardShortcutToIdDict_[keyCombo] = id;
      keyboardIdToShortcutDict_[id] = keyCombo;

      this.value = keyCombo;

    }, true); });

    $('.shortcuts_key').bind("paste", function(e) {
      e.preventDefault();
    });
  };

  this.verifyShortcutIsUnique = function(shortcutId, shortcutKey) {
    var existingId = keyboardShortcutToIdDict_[shortcutKey];
    if (((existingId || null) !== null) || (existingId === shortcutId)) {
      keyboardShortcutToIdDict_[shortcutKey] = shortcutId; // just for during use of editor.  We rebuild data from scratch later.
      return true;
    } else {
      // shortcut used by something else
      return false;
    }
  };

  this.onClearAll = function(e) {
    e.preventDefault();
    var clear = keyboardShortcutsInfo.generateClear();
    var dicts = keyboardShortcutsInfo.createKeyboardShortcutDicts(clear);
    self.clearShortcuts();
    self.showShortcuts(dicts[0], dicts[1]);
  };

  this.onSave = function(e) {
    e.preventDefault();

    var keyboardShortcuts = [];

    $(".shortcuts_key").each(function(index) {
      var obj = {};
      obj[this.id] = this.value;
      keyboardShortcuts.push(obj);
    });
    console.log("onSave");
    console.log(keyboardShortcuts);

    fplib.syncSet("flix_plus " + profileName_ + " keyboard_shortcuts", keyboardShortcuts, function() {
      console.log("saved");
      alert("Saved!");
    });
  };

  this.onRestoreDefaultShortcuts = function(e) {
    e.preventDefault();

    var defaults = keyboardShortcutsInfo.generateDefaults();
    var dicts = keyboardShortcutsInfo.createKeyboardShortcutDicts(defaults);
    self.clearShortcuts();
    self.showShortcuts(dicts[0], dicts[1]);
  };

  this.onClearNavigation = function(e) {
    e.preventDefault();

    if (window.confirm(
        "If you clear the navigation keys (left, right, section beginning, " +
        "section ending, next section, prev section, first section, " +
        "last section) then borders will be removed and page load time will" +
        " speed up but you lose access to the sections and posters keys.\n\n" +
        "Do you want to do this?") === true) {

      var commands = ["prev_section", "next_section", "section_home",
                      "section_end", "move_right", "move_left", "move_home",
                      "move_end"];
      commands.forEach(function(command) {
        var keyName = $("#" + command)[0].value;
        console.log(keyName);
        delete keyboardIdToShortcutDict_[command];
        delete keyboardShortcutToIdDict_[keyName];
        $("#" + command)[0].value = "None";
        keyboardIdToShortcutDict_[command] = 'None';
      });
      alert("Changes made. Click save after reviewing.");
    }
  };

  this.init = function(profileName) {
    console.log("init");
    profileName_ = profileName;
    document.getElementById("save").addEventListener("click", self.onSave);
    document.getElementById("clearall").addEventListener("click", self.onClearAll);
    document.getElementById("defaults").addEventListener("click", self.onRestoreDefaultShortcuts);
    document.getElementById("clearnavigation").addEventListener("click", self.onClearNavigation);
    keyboardShortcutsInfo.loadShortcutKeys("flix_plus " + profileName_ + " keyboard_shortcuts", self.showShortcuts);
  };
};

$(document).ready(function() {
  chrome.storage.local.get("flix_plus profilename", function(items) {
    var profileName = items["flix_plus profilename"];
    shortcutsEditor_.call(shortcutsEditor);

    shortcutsEditor.init(profileName);
  });
});
