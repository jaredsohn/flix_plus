// written by jaredsohn-lifehacker

// This script will make AJAX requests to import a Netflix user's My List history.

// Add a button
/*
var import_button = document.createElement("a");
var createAText = document.createTextNode("Import JSON");
import_button.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_import_cmd"; div.style="display:none"; document.body.appendChild(div);');
import_button.appendChild(createAText);
import_button.className = "extlib_button";
import_button.style = "align:right;"
*/

var exportButton = document.createElement("a");
var createAText = document.createTextNode("Export JSON");
exportButton.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_export_cmd"; div.style="display:none"; document.body.appendChild(div);');
exportButton.appendChild(createAText);
exportButton.className = "extlib_button";
exportButton.style = "align:right;";

if (fplib.isOldMyList())
{
    var header = document.getElementsByClassName("listQueueHead")[0];
    if ($(".listQueueHead br").length === 0)
        header.appendChild(document.createElement("br"));
// header.appendChild(import_button);
    header.appendChild(exportButton);

} else if (fplib.isNewMyList())
{
    $(".main-content").prepend(exportButton);
// $(".main-content").prepend(import_button);
    $(".main-content").prepend(document.createElement("br"));
}

extlib.initButtonCss();
/*
document.body.arrive(" .fp_import_cmd", function() {

    console.log("import clicked");

    var form = document.createElement("form");
    form.innerHTML = '<input id="fp_import_file_chooser" type="file" name="Import ratings" accept=".json,application/json"></form>';
    document.body.appendChild(form);
    document.getElementById('fp_import_file_chooser').addEventListener('change', function(evt) {
        console.log(evt.target.files[0].name);
        // TODO: read file and parse json

        var reader = new FileReader();
        reader.onload = function(e)
        {
            console.log(e.target);
            var ratings = JSON.parse(e.target.result);
            setRatings(ratings, 0, getAuthUrl(), function() {
                alert("Done!")
            });
        }
        reader.readAsText(evt.target.files[0]);
    }, false);
    document.getElementById("fp_import_file_chooser").click();
    $("#fp_import_file_chooser").remove();
});
*/
document.body.arrive(".fp_export_cmd", function() {
    console.log("export clicked");
    var exportData = {};

    if (fplib.isOldMyList())
        exportData = getListOldMyList();
    else
        exportData = getListNewMyList();

    // from stackoverflow
    var saveData = (function() {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function(data, fileName) {
            var json = JSON.stringify(data),
                blob = new Blob([json], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    saveData(exportData, "mylist_" + fplib.getProfileName() + ".json");
});

var getListOldMyList = function()
{
    var exportData = [];
    var entries = ($("#queue .qtbl tr"));
    var len = entries.length;
    for (i = 1; i < len; i++) // first row is column titles
    {
        var obj = {};

        var titleElems = $(".mdpLink", $(entries[i]));
        if (titleElems.length === 0)
            continue;

        obj.netflixid = fplib.getMovieIdFromField(titleElems[0].id);
        obj.title = titleElems[0].innerText;
        obj.yourRating = "";
        obj.suggestedRating = "";

        if ($(".fp_notes").length > 0)
            obj.customNote = $(".fp_notes", $(entries[i]))[0].innerText.trim();
            if (obj.customNote === "add note")
                obj.customNote = "";
        else
            obj.customNote = "";

        obj.genre = $(".gn a", ($("tr")[10]))[0].text.trim();

        var ratingElems = $(".stbrMaskFg", $(entries[i]));
        if (ratingElems.length === 0)
            continue;
        console.log(ratingElems);

        var classes = ratingElems[0].classList;
        var rating = null;
        for (classIndex = 0; classIndex < classes.length; classIndex++)
        {
            try
            {
                if (classes[classIndex].indexOf("sbmf-") === 0)
                {
                    var temp = classes[classIndex].substring(classes[classIndex].indexOf("-") + 1);
                    rating = parseInt(temp) / 10;
                }
            } catch (ex)
            {
                console.log(ex);
            }
        }
        if ((classes.contains("sbmfpr")) && (rating !== null))
        {
            obj.suggestedRating = rating.toString();
        } else if (classes.contains("sbmfrt"))
        {
            obj.yourRating = rating.toString();
        }

        exportData.push(obj);
    }

    return exportData;
};

var getListNewMyList = function()
{
    var exportData = [];

    var titles = $(".agMovie .boxShot");
    var len = titles.length;
    for (i = 0; i < len; i++)
    {
        var obj = {};
        obj.netflixid = fplib.getMovieIdFromField(titles[i].id);
        obj.title = $("img", titles[i])[0].alt;
        obj.yourRating = "";
        obj.suggestedRating = "";
        obj.customNote = "";
        obj.genre = "";

        exportData.push(obj);
    }

    return exportData;
};
/*
var setRatings = function(ratings, index, authURL, callback)
{
    if ((index < 0) || (index >= ratings.length))
    {
        callback();
        return;
    }

    var url = window.location.protocol + "//www.netflix.com/AddToQueue?movieid=" + ratings[index].netflixid + "&qtype=INSTANT&authURL=" + getAuthUrl();
//  var url = window.location.protocol + "//www.netflix.com/SetRating?value=" + ratings[index].yourrating + "&widgetid=M" + ratings[index].netflixid + "_0_0" + "&authURL=" + authURL;

    console.log(url);
    $.ajax({
        url: url,
        cache: false,
        success: function(html)
        {
            set_ratings(ratings, index + 1, authURL, callback)
        }
    });
}

// Required because page has newer HTML that doesn't append authURL to the signout button
this.getAuthUrl = function()
{
    return fplib.getAuthUrl();

//  var authUrl = fplib.parseEmbeddedJson(document.body.innerHTML, "authURL");
//  console.log(authUrl);
//  return authUrl;
}*/
