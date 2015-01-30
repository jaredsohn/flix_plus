// Note that this module uses snakecase for variable and function names.

var shortcuts_editor = shortcuts_editor || {};
var shortcuts_editor_ = function() {
    var self = this;
    var profile_name_ = "undefined";

    var keyboard_id_to_shortcut_dict_ = {};
    var keyboard_shortcut_to_id_dict_ = {};

    this.clear_shortcuts = function()
    {
        var shortcuts_div = document.getElementById("shortcuts");
        shortcuts_div.innerText = "";
    };

    this.key_is_duplicate = function(keyCombo, id, category)
    {
        var is_duplicate = false;

        if (keyCombo === "None")
            return false;

        // look at ui
        var keys;

        console.log(keyCombo);
        console.log(id);
        console.log(category);

        switch (category)
        {
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

        console.log(keys.length);

        for (i = 0; i < keys.length; i++)
        {
            if (keys[i].id === id)
                continue;
            if ($("input", keys[i])[0].value === keyCombo)
            {
                is_duplicate = true;
                break;
            }
        }
        console.log(is_duplicate);

        return is_duplicate;
    };

    this.show_shortcuts = function(keyboard_shortcut_to_id_dict, keyboard_id_to_shortcut_dict)
    {
        keyboard_id_to_shortcut_dict_ = keyboard_id_to_shortcut_dict;
        keyboard_shortcut_to_id_dict_ = keyboard_shortcut_to_id_dict;

        var shortcuts_div = document.getElementById("shortcuts");

        var node = document.createElement("br");
        shortcuts_div.appendChild(node);

        var categories = keyboard_shortcuts_info.get_categories_in_order();
        //console.log(categories);
        var categories_len = categories.length;
        var id;

        for (category_index = 0; category_index < categories.length; category_index++)
        {
            var defs = keyboard_shortcuts_info.get_shortcuts_defs();

            node = document.createElement("div");
            node.innerText = categories[category_index];
            node.className = "shortcuts_category";
            node.style.innerText = "font-weight: bold";
            shortcuts_div.appendChild(node);
            var category_div = document.createElement("div");
            category_div.id = "category_" + categories[category_index].replace(new RegExp(" ", 'g'), "");
            shortcuts_div.appendChild(category_div);

            //console.log("For category '" + categories[category_index] + "'");
            var ids_for_category = keyboard_shortcuts_info.get_shortcuts_for_category(categories[category_index]);
            var ids_for_category_len = ids_for_category.length;
            var j;

            for (j = 0; j < ids_for_category_len; j++)
            {
                //console.log(ids_for_category[j] + " - " + keyboard_id_to_shortcut_dict[ids_for_category[j]]);

                var div_node = document.createElement("div");
                div_node.className = "shortcut_item";
                category_div.appendChild(div_node);

                node = document.createElement("div");
                node.innerText = defs[ids_for_category[j]].description;
                node.className = "shortcuts_desc";
                div_node.appendChild(node);

                node = document.createElement("input");
                node.type = "text";
                node.name = "fname";
                node.id = ids_for_category[j];
                node.className = "shortcuts_key";
                var val = keyboard_id_to_shortcut_dict[ids_for_category[j]];
                if (typeof(val) === "undefined")
                    val = "None";
                node.value = val;
                div_node.appendChild(node);

                node = document.createElement("br");
                category_div.appendChild(node);
            }
            var node = document.createElement("br");
            category_div.appendChild(node);
        }

        $(".shortcuts_key").each(function() { this.addEventListener("keydown", function(e) {
            console.log("keydown");
            console.log(e);

            id = this.id;
            keyCombo = "";
            if ((e.keyCode >= 33) && (e.keyCode <= 127))
            {
                keyCombo = String.fromCharCode(e.charCode || e.which).toLowerCase();
            }
            switch (e.keyCode)
            {
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

            ignoreShift = (keyboard_shortcuts_info.get_already_has_shift_chars().indexOf(keyCombo) !== -1);

            //if ((e.altKey)) keyCombo = "Alt-" + keyCombo;
            //if ((e.ctrlKey)) keyCombo = "Ctrl-" + keyCombo;
            if (!ignoreShift && (e.shiftKey))
            {
                return;
                //keyCombo = "Shift-" + keyCombo;
            }

            if ((keyCombo.length === 1) && e.shiftKey)
            {
                var dict = keyboard_shortcuts_info.get_shift_symbols_dict();
                if (keyCombo in dict)
                    keyCombo = dict[keyCombo];
                else
                    keyCombo = keyCombo.toLowerCase();
            }

            var defs = keyboard_shortcuts_info.get_shortcuts_defs();
            if (((defs[id].category === "Player") || (defs[id].category === "Jump to page") || (defs[id].category === "Misc")) &&
                ((keyCombo === "Left") || (keyCombo === "Right")))
                    return; // Don't allow left/right arrow keys for global or player keys


            // Make sure that key is unique (based on section)
            if (self.key_is_duplicate(keyCombo, this.id, defs[id].category))
            {
                return;
            }

            // Remove old key
            var old_shortcut = keyboard_id_to_shortcut_dict_[id];
            delete keyboard_id_to_shortcut_dict_[id];
            delete keyboard_shortcut_to_id_dict_[old_shortcut];

            // Save new key
            keyboard_shortcut_to_id_dict_[keyCombo] = id;
            keyboard_id_to_shortcut_dict_[id] = keyCombo;

            this.value = keyCombo;
        }, true); });

        $(".shortcuts_key").each(function() { this.addEventListener("keypress", function(e) {
            console.log("keypress");

            if ((e.altKey) || (e.ctrlKey) || (e.metaKey))
            {
                // We don't allow alt, ctrl, and comand keys right now (helps avoid breaking system keys)
                return;
            }
            e.preventDefault();

            id = this.id;
            keyCombo = String.fromCharCode(e.charCode || e.which).toLowerCase();
            //console.log("keycombo is");
            //console.log(keyCombo);

            ignoreShift = (keyboard_shortcuts_info.get_already_has_shift_chars().indexOf(keyCombo) !== -1);

            if (e.altKey || e.ctrlKey || (!ignoreShift && (e.shiftKey)))
                keyCombo = keyCombo.toUpperCase();

            if (e.altKey) keyCombo = "Alt-" + keyCombo;
            if (e.ctrlKey) keyCombo = "Ctrl-" + keyCombo;
            if (!ignoreShift && (e.shiftKey)) keyCombo = "Shift-" + keyCombo;
            if (keyCombo.length > 1)
                return; // alt, ctrl, shift not supported right now

            if (e.shiftKey && (keyCombo.length === 1))
            {
                var dict = keyboard_shortcuts_info.get_shift_symbols_dict();
                if (keyCombo in dict)
                    keyCombo = dict[keyCombo];
                else
                    keyCombo = keyCombo.toLowerCase();
            }

            // Don't allow duplicating key
            //if (typeof(keyboard_shortcut_to_id_dict_[keyCombo]) !== "undefined")
            //  return;

            // Remove old key
            var old_shortcut = keyboard_id_to_shortcut_dict_[id];
            delete keyboard_id_to_shortcut_dict_[id];
            delete keyboard_shortcut_to_id_dict_[old_shortcut];

            // Save new key
            keyboard_shortcut_to_id_dict_[keyCombo] = id;
            keyboard_id_to_shortcut_dict_[id] = keyCombo;

            this.value = keyCombo;

        }, true); });

        $('.shortcuts_key').bind("paste", function(e) {
            e.preventDefault();
        });
    };

    this.verify_shortcut_is_unique = function(shortcut_id, shortcut_key)
    {
        var existing_id = keyboard_shortcut_to_id_dict_[shortcut_key];
        if ((typeof(existing_id) !== "undefined") || (existing_id === shortcut_id))
        {
            keyboard_shortcut_to_id_dict_[shortcut_key] = shortcut_id; // just for during use of editor.  We rebuild data from scratch later.
            return true;
        } else
        {
            // shortcut used by something else
            return false;
        }
    };

    this.on_clear_all = function(e)
    {
        e.preventDefault();
        var clear = keyboard_shortcuts_info.generate_clear();
        var dicts = keyboard_shortcuts_info.create_keyboard_shortcut_dicts(clear);
        self.clear_shortcuts();
        self.show_shortcuts(dicts[0], dicts[1]);
    };

    this.on_save = function(e)
    {
        e.preventDefault();

        var keyboard_shortcuts = [];

        $(".shortcuts_key").each(function(index) {
            obj = {};
            obj[this.id] = this.value;
            keyboard_shortcuts.push(obj);
        });
        console.log("on_save");
        console.log(keyboard_shortcuts);

        fplib.syncSet("flix_plus " + profile_name_ + " keyboard_shortcuts", keyboard_shortcuts, function() {
            console.log("saved");
            alert("Saved!");
        });
    };

    this.on_restore_default_shortcuts = function(e)
    {
        e.preventDefault();

        var defaults = keyboard_shortcuts_info.generate_defaults();
        var dicts = keyboard_shortcuts_info.create_keyboard_shortcut_dicts(defaults);
        self.clear_shortcuts();
        self.show_shortcuts(dicts[0], dicts[1]);
    };

    this.on_clear_navigation = function(e)
    {
        e.preventDefault();

        if (window.confirm("If you clear the navigation keys (left, right, section beginning, section ending, next section, prev section, first section, last section) then borders will be removed and page load time will speed up but you lose access to the sections and posters keys.\n\nDo you want to do this?") === true)
        {
            var commands = ["prev_section", "next_section", "section_home", "section_end", "move_right", "move_left", "move_home", "move_end"];
            for (i = 0; i < commands.length; i++)
            {
                var keyName = $("#" + commands[i])[0].value;
                console.log(keyName);
                delete keyboard_id_to_shortcut_dict_[commands[i]];
                delete keyboard_shortcut_to_id_dict_[keyName];
                $("#" + commands[i])[0].value = "None";
                keyboard_id_to_shortcut_dict_[commands[i]] = 'None';
            }
            alert("Changes made.  Click save after reviewing.");
        }
    };

    this.init = function(profile_name)
    {
        console.log("init");
        profile_name_ = profile_name;
        document.getElementById("save").addEventListener("click", self.on_save);
        document.getElementById("clearall").addEventListener("click", self.on_clear_all);
        document.getElementById("defaults").addEventListener("click", self.on_restore_default_shortcuts);
        document.getElementById("clearnavigation").addEventListener("click", self.on_clear_navigation);
        keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + profile_name_ + " keyboard_shortcuts", self.show_shortcuts);
    };
};

$(document).ready(function()
{
    chrome.storage.local.get("flix_plus profilename", function(items)
    {
        profile_name_ = items["flix_plus profilename"];
        console.log(profile_name_);
        shortcuts_editor_.call(shortcuts_editor);

        shortcuts_editor.init(profile_name_);
    });
});
