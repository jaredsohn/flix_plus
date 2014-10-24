// written by jaredsohn-lifehacker

// This script will make AJAX requests to import a Netflix user's rating history.

// Add a button
var createA = document.createElement("a");
var createAText = document.createTextNode("Import JSON");
createA.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_import_ratings_cmd"; div.style="display:none"; document.body.appendChild(div);');
createA.appendChild(createAText);
createA.className = "extlib_button";
createA.style = "align:right;"

var header = document.getElementsByClassName("account-header")[0];

if ($(".account-header br").length === 0)
	header.appendChild(document.createElement("br"));
header.appendChild(createA);

extlib.initButtonCss();

document.body.arrive(" .fp_import_ratings_cmd", function() {

	console.log("import ratings clicked");

	var form = document.createElement("form");
	form.innerHTML = '<input id="fp_import_ratings_file_chooser" type="file" name="Import ratings" accept=".json,application/json"></form>';
	document.body.appendChild(form);
	document.getElementById('fp_import_ratings_file_chooser').addEventListener('change', function(evt) {
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
	document.getElementById("fp_import_ratings_file_chooser").click();
	$("#fp_import_ratings_file_chooser").remove();	
});

var set_ratings = function(ratings, index, authURL, callback)
{
	if ((index < 0) || (index >= ratings.length))
	{
		callback();
		return;
	}

//	var url = window.location.protocol + "//www.netflix.com/AddToQueue?movieid=" + ratings[index].netflixid + "&qtype=INSTANT&authURL=" + getAuthUrl();
	var url = window.location.protocol + "//www.netflix.com/SetRating?value=" + ratings[index].yourrating + "&widgetid=M" + ratings[index].netflixid + "_0_0" + "&authURL=" + authURL;

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
	var authUrl = fplib.parseEmbeddedJson(document.body.innerHTML, "authURL");
	console.log(authUrl);
	return authUrl;
}