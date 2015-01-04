// sectionhider - by jaredsohn/Lifehacker
// Derived from Scrollbuster, but with different behavior (hides/shows sections instead of removing/adding scrollbars)
// Requires extlib.js, fplib.js


var KEY_NAME = "flix_plus " + fplib.getProfileName() + " sectionhider";

var show_template = "#MROWID .bd { display:block }";
var hide_template = "#MROWID .bd { display:none }";

var _hide_image_html = "<img class='flix_plus_hiddensectionbutton' src='" + chrome.extension.getURL("src/img/hide.png") + "' width=24 title='Section hidden; click to show.'>";
var _show_image_html = "<img class='flix_plus_shownsectionbutton' src='" + chrome.extension.getURL("src/img/show.png") + "' width=24 title='Section shown; click to hide.'>";


// Try to fix Recently Watched.  Might not do desired thing for all users.
try
{
  $(".controlTitle")[0].style["font-size"] = "125%";
} catch (ex)
{
  console.log(ex);
}

fplib.syncGet(KEY_NAME, function(items)
{
  defaults = items[KEY_NAME];
  defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

  fplib.idMrows();

  mrows = document.getElementsByClassName("mrow");
  for (i = 0; i < mrows.length; i++)
  {
    if (mrows[i].classList.contains("characterRow")) // skips over characters on kids page
      continue;

    var id = mrows[i].id;

    // Get relevant info
    showCssCode = show_template.replace(new RegExp("MROWID", 'g'), id);
    hideCssCode = hide_template.replace(new RegExp("MROWID", 'g'), id);
    var mrow_name = document.getElementById(id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
      document.getElementById(id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
      .textContent.trim();

    // Update UI now
    var show_hide_text = _show_image_html;
    if ((mrow_name in defaults) && (defaults[mrow_name] === true))
    {
      extlib.addGlobalStyle(hideCssCode);
      show_hide_text = _hide_image_html;
    }

    // Add a button
    var show_hide_node = document.createElement("a");
    show_hide_node.id = id + "_showhide";
    mrows[i].getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].insertBefore(show_hide_node, mrows[i].getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].firstChild);
    document.getElementById(id + "_showhide").innerHTML = show_hide_text;

    // Create event listener to update based on user interaction
    document.getElementById(id + "_showhide").addEventListener('click', function() {
      var _id = id;
      var _showCssCode = showCssCode;
      var _hideCssCode = hideCssCode;

      return function() // Toggles show/hide and saves to local Storage
      {
        var should_hide = (document.getElementById(_id + "_showhide").innerHTML.indexOf("click to hide") !== -1);
        extlib.addGlobalStyle(should_hide ? _hideCssCode : _showCssCode);
        document.getElementById(_id + "_showhide").innerHTML = should_hide ? _hide_image_html : _show_image_html;


        fplib.syncGet(KEY_NAME, function(items)
        {
          defaults = items[KEY_NAME];
          defaults = (typeof(defaults) === "undefined") ? {} : JSON.parse(defaults);

          var mrow_name = document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes[
            document.getElementById(_id).getElementsByClassName("hd")[0].getElementsByTagName("h3")[0].childNodes.length - 1]
            .textContent.trim();
          defaults[mrow_name] = should_hide;
          fplib.syncSet(KEY_NAME, JSON.stringify(defaults), function(items) {
          });
        });
      };
    }(), false);
  }

/*
  // Build 'all' buttons at top of page
  var create_add_all_button = function(id, class_name, button_text)
  {
    var button = document.createElement("a");
    button.id = id;
    button.innerHTML = button_text;
    button.className = "extlib_button";
    document.getElementsByClassName("mrows")[0].insertBefore(button, document.getElementById("mrow_id_0"));
    document.getElementById(id).addEventListener('click', function() {
      var _class_name = class_name;

      return function()
      {
        var elems = document.getElementsByClassName(_class_name);
        var elems_array = [];

        Array.prototype.forEach.call(elems, function(el) {
          elems_array.push(el);
        });
        for (i = 0; i < elems_array.length; i++)
          elems_array[i].click();
      }
    }(), false);
  }
  extlib.initButtonCss();

  create_add_all_button("hideall", "flix_plus_shownsectionbutton", "Hide all sections");
  create_add_all_button("showall", "flix_plus_hiddensectionbutton", "Show all sections");
*/
});
