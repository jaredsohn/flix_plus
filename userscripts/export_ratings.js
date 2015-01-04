// export_ratings
//
// Written by Jared Sohn for Lifehacker as a part of Flix Plus.
// August 2014


// Add a button
var createA = document.createElement("a");
var createAText = document.createTextNode("Export as JSON");
createA.setAttribute("href", 'javascript:var div = document.createElement("div"); div.className="fp_export_ratings_cmd"; div.style="display:none"; document.body.appendChild(div);');
createA.appendChild(createAText);
createA.className = "extlib_button";
createA.style = "align:right;";

var header = document.getElementsByClassName("account-header")[0];
if ($(".account-header br").length === 0)
    header.appendChild(document.createElement("br"));

header.appendChild(createA);

extlib.initButtonCss();

document.body.arrive(" .fp_export_ratings_cmd", function() {
    var ratingsHistory = document.getElementById("ratingHistorySection");
    var elems = ratingsHistory.getElementsByTagName("li");
    if (elems.length === 100)
    {
        if (confirm("This only exports ratings that can be found on the page.  Because exactly 100 ratings were found, you probably need to scroll down if you want to export all ratings.\n\nAre you sure you want to export just these 100 ratings?"))
            export_ratings();
    } else
    {
        export_ratings();
    }
});

var export_ratings = function()
{
    var rated_data = [];

    var ratingsHistory = document.getElementById("ratingHistorySection");
    var elems = ratingsHistory.getElementsByTagName("li");

    for (i = 0; i < elems.length; i++)
    {
        var obj = {};
        obj.netflixid = elems[i].getAttribute("data-movieid");
        obj.yourrating = elems[i].getElementsByClassName("starbar")[0].getAttribute("data-your-rating");
        obj.titlename = elems[i].getElementsByClassName("title")[0].getElementsByTagName("a")[0].text;
        obj.ratedate = elems[i].getElementsByClassName("date")[0].innerHTML;

        rated_data.push(obj);
    }
    console.log(rated_data.append);

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

    saveData(rated_data, "netflix_ratings.json");
};
