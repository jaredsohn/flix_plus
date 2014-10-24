// written by jaredsohn-lifehacker

// This script will make AJAX requests to import a Netflix user's rating history.

// Add a button
var import_button = document.createElement("a");
var createAText = document.createTextNode("Import JSON");
import_button.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_import_cmd"; div.style="display:none"; document.body.appendChild(div);');
import_button.appendChild(createAText);
import_button.className = "extlib_button";
import_button.style = "align:right;"

var export_button = document.createElement("a");
var createAText = document.createTextNode("Export JSON");
export_button.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_export_cmd"; div.style="display:none"; document.body.appendChild(div);');
export_button.appendChild(createAText);
export_button.className = "extlib_button";
export_button.style = "align:right;"

if (fplib.isOldMyList())
{
	var header = document.getElementsByClassName("listQueueHead")[0];
	if ($(".listQueueHead br").length === 0)
		header.appendChild(document.createElement("br"));
	header.appendChild(import_button);
	header.appendChild(export_button);

} else if (fplib.isNewMyList())
{
	$(".main-content").prepend(export_button);
	$(".main-content").prepend(import_button);
	$(".main-content").prepend(document.createElement("br"));
}

extlib.initButtonCss();

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
			set_ratings(ratings, 0, getAuthUrl(), function() {
				alert("Done!")
			});
		}
		reader.readAsText(evt.target.files[0]);
	}, false);
	document.getElementById("fp_import_file_chooser").click();
	$("#fp_import_file_chooser").remove();	
});    

document.body.arrive(" .fp_export_cmd", function() {
	console.log("export clicked");
	var export_data = {};

	if (fplib.isOldMyList())
		export_data = get_list_old_mylist();
	else
		export_data = get_list_new_mylist();

	 // from stackoverflow
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var json = JSON.stringify(data),
                blob = new Blob([json], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());

    saveData(export_data, "mylist_" + fplib.getProfileName() + ".json");
});

var get_list_old_mylist = function()
{
	var export_data = [];
	var titles = ($("#queue .qtbl tr .mdpLink"))
	var len = titles.length;
	for (i = 0; i < len; i++)
	{
		var obj = {};
		obj.netflixid = fplib.getMovieIdFromField(titles[i].id);
		obj.title = titles[i].innerText
		obj.yourrating = "";
		obj.ratedate="";
		export_data.push(obj);
	}

	return export_data;
}

var get_list_new_mylist = function()
{
	var export_data = [];

	var titles = $(".agMovie .boxShot");
	var len = titles.length;
	for (i = 0; i < len; i++)
	{
		var obj = {};
		obj.netflixid = fplib.getMovieIdFromField(titles[i].id);
		obj.title = $("img", titles[i])[0].alt;
		obj.yourrating = "";
		obj.ratedate="";
		export_data.push(obj);		
	}

	return export_data;
}

var set_ratings = function(ratings, index, authURL, callback)
{
	if ((index < 0) || (index >= ratings.length))
	{
		callback();
		return;
	}

	var url = window.location.protocol + "//www.netflix.com/AddToQueue?movieid=" + ratings[index].netflixid + "&qtype=INSTANT&authURL=" + getAuthUrl();
//	var url = window.location.protocol + "//www.netflix.com/SetRating?value=" + ratings[index].yourrating + "&widgetid=M" + ratings[index].netflixid + "_0_0" + "&authURL=" + authURL;

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

//	var authUrl = fplib.parseEmbeddedJson(document.body.innerHTML, "authURL");
//	console.log(authUrl);
//	return authUrl;
}