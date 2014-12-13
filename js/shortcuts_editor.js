var shortcuts_editor = shortcuts_editor || {};
var _shortcuts_editor = function() {
    var self = this;
    var _profilename = "undefined";

	var _keyboard_id_to_shortcut_dict = {};
	var _keyboard_shortcut_to_id_dict = {};

	this.init = function(profilename)
	{
		console.log("init");
		_profilename = profilename;
		document.getElementById("save").addEventListener("click", self.onSave);
		document.getElementById("clearall").addEventListener("click", self.onClearAll);
		document.getElementById("defaults").addEventListener("click", self.onRestoreDefaultShortcuts);
		keyboard_shortcuts_info.load_shortcut_keys("flix_plus " + _profilename + " keyboard_shortcuts", self.show_shortcuts);
	}

	this.clear_shortcuts = function()
	{
		var shortcuts_div = document.getElementById("shortcuts");
		shortcuts_div.innerText = "";		
	}

	this.show_shortcuts = function(keyboard_shortcut_to_id_dict, keyboard_id_to_shortcut_dict)
	{
		_keyboard_id_to_shortcut_dict = keyboard_id_to_shortcut_dict;
		_keyboard_shortcut_to_id_dict = keyboard_shortcut_to_id_dict;

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

			//console.log("For category '" + categories[category_index] + "'");
			var ids_for_category = keyboard_shortcuts_info.get_shortcuts_for_category(keyboard_id_to_shortcut_dict, categories[category_index]);
			var ids_for_category_len = ids_for_category.length;
			var j;

			for (j = 0; j < ids_for_category_len; j++)
			{
				//console.log(ids_for_category[j] + " - " + keyboard_id_to_shortcut_dict[ids_for_category[j]]);			

				var div_node = document.createElement("div");
				div_node.className = "shortcut_item";
				shortcuts_div.appendChild(div_node);

				node = document.createElement("div");
				node.innerText = defs[ids_for_category[j]].description;
				node.className = "shortcuts_desc";
				div_node.appendChild(node);
				
				node = document.createElement("input");
				node.type = "text";
				node.name = "fname";
				node.id = ids_for_category[j];
				node.className = "shortcuts_key";
				node.value = keyboard_id_to_shortcut_dict[ids_for_category[j]];
				div_node.appendChild(node);

				node = document.createElement("br");
				shortcuts_div.appendChild(node);
			}
			var node = document.createElement("br");
			shortcuts_div.appendChild(node);			
		}

		$(".shortcuts_key").each(function() { this.addEventListener("keydown", function(e) {
			console.log("keydown");

		    id = this.id;
		    keyCombo = "";
		    if ((e.keyCode >= 33) && (e.keyCode <= 127))
		    {
			    keyCombo = String.fromCharCode(e.charCode||e.which).toLowerCase();
		    }
		    switch (e.keyCode)
		    {
		    	case 8: keyCombo = "None"; break;
		    	case 13: keyCombo = "Enter"; break;
		        case 27: keyCombo = "Escape"; break;
		    	case 32: keyCombo = "Space"; break;
		        case 37: keyCombo = "Left"; break;
		        case 39: keyCombo = "Right"; break;
		        case 38: keyCombo = "Up"; break;
		        case 40: keyCombo = "Down"; break;
		        case 36: keyCombo = "Home"; break;
		        case 37: keyCombo = "End"; break;
		        case 111: 
		        	if ((e.altKey) || (e.metaKey))
		        		return;
		        	break; // we'll allow ctro-o
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

		    // Don't allow duplicating key
			//if ((keyCombo !== "None") && (typeof(_keyboard_shortcut_to_id_dict[keyCombo]) !== "undefined"))
			//	return;

			// Remove old key
			var old_shortcut = _keyboard_id_to_shortcut_dict[id];
			delete _keyboard_id_to_shortcut_dict[id];
			delete _keyboard_shortcut_to_id_dict[old_shortcut];

			// Save new key
			_keyboard_shortcut_to_id_dict[keyCombo] = id;
			_keyboard_id_to_shortcut_dict[id] = keyCombo;

		    this.value = keyCombo;
		}, true); })

		$(".shortcuts_key").each(function() { this.addEventListener("keypress", function(e) {
			console.log("keypress");

			if ((e.altKey) || (e.ctrlKey) || (e.metaKey))
			{
				// We don't allow alt, ctrl, and comand keys right now (helps avoid breaking system keys)
				return;
			}
	        e.preventDefault();			

	        id = this.id;
		    keyCombo = String.fromCharCode(e.charCode||e.which).toLowerCase();
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
			//if (typeof(_keyboard_shortcut_to_id_dict[keyCombo]) !== "undefined")
			//	return;

			// Remove old key
			var old_shortcut = _keyboard_id_to_shortcut_dict[id];
			delete _keyboard_id_to_shortcut_dict[id];
			delete _keyboard_shortcut_to_id_dict[old_shortcut];

			// Save new key
			_keyboard_shortcut_to_id_dict[keyCombo] = id;
			_keyboard_id_to_shortcut_dict[id] = keyCombo;

		    this.value = keyCombo;

		}, true); })

	 	$('.shortcuts_key').bind("paste",function(e) {
	    	e.preventDefault();
	  	});
	};

	this.verify_shortcut_is_unique = function(shortcut_id, shortcut_key)
	{
		var existing_id = _keyboard_shortcut_to_id_dict[shortcut_key];
		if ((typeof(existing_id) !== "undefined") || (existing_id === shortcut_id))
		{
			_keyboard_shortcut_to_id_dict[shortcut_key] = shortcut_id; // just for during use of editor.  We rebuild data from scratch later.
			return true;
		} else
		{
			// shortcut used by something else
			return false;
		}
	}

	this.onClearAll = function(e)
	{
		e.preventDefault();
		var clear = keyboard_shortcuts_info.generate_clear();
		var dicts = keyboard_shortcuts_info.create_keyboard_shortcut_dicts(clear);
		self.clear_shortcuts();
		self.show_shortcuts(dicts[0], dicts[1]);
	}

	this.onSave = function(e)
	{
		e.preventDefault();

		var keyboard_shortcuts = [];

		$(".shortcuts_key").each(function(index) {    
			obj = {};
			obj[this.id] = this.value;
			keyboard_shortcuts.push(obj);
		});
		console.log("OnSave");
		console.log(keyboard_shortcuts);

		fplib.syncSet("flix_plus " + _profilename + " keyboard_shortcuts", keyboard_shortcuts, function() { 
			console.log("saved");
			alert("Saved!");
		});
	};

	this.onRestoreDefaultShortcuts = function(e)
	{
		e.preventDefault();

		var defaults = keyboard_shortcuts_info.generate_defaults();
		var dicts = keyboard_shortcuts_info.create_keyboard_shortcut_dicts(defaults);
		self.clear_shortcuts();
		self.show_shortcuts(dicts[0], dicts[1]);
	}
}

$(document).ready(function()
{
	chrome.storage.local.get("flix_plus profilename", function(items)
	{
		_profilename = items["flix_plus profilename"];
		console.log(_profilename);
		_shortcuts_editor.call(shortcuts_editor);

		shortcuts_editor.init(_profilename);
	});
});