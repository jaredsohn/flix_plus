// ==UserScript==
// @name          Netflix Rating Granulizer
// @description   allows half star user ratings on Netflix
// @author        mabuse
// @include       http://*netflix.com/*
// ==/UserScript==

// Changes made by jaredsohn-lifehacker:
//
// -- cleaned up profanity in rating strings
// -- patches stars in many more places (Netflix pages tend to not have consistent HTML)
// -- now requires arrive.js, fplib.js

var unsafeWindow = this['unsafeWindow'] || window;
var document = unsafeWindow.document;


var ratingStrings = [];
ratingStrings[1.5] = "Hated it, but had some value";
ratingStrings[2.5] = "Mediocre";
ratingStrings[3.5] = "Pretty pretty good";
ratingStrings[4.5] = "Really, really like it";

var ratingWidthsNormal = [];
ratingWidthsNormal[1.5] = 27;
ratingWidthsNormal[2.5] = 46;
ratingWidthsNormal[3.5] = 65;
ratingWidthsNormal[4.5] = 84;

// within #headerRow stbrLg class
var ratingWidthsLarge = [];
ratingWidthsLarge[1.5] = 28 * 1.5;
ratingWidthsLarge[2.5] = 28 * 2.5;
ratingWidthsLarge[3.5] = 28 * 3.5;
ratingWidthsLarge[4.5] = 28 * 4.5;

var niOffset = 17;  /* rating width offset when not interested button is to the left */

// Patches anchor elements under the containing DIV of the given class name by adding child elements
// with half-star rating widths among the existing elements.
var patchAnchors = function(elem, offset, wrapInLi)
{
    var anchors = elem.getElementsByTagName('a');
    if ((typeof(anchors) === "undefined") || (anchors.length === 0))
        return;
    if (anchors[0].offsetWidth > 100)
        ratingWidths = ratingWidthsLarge;
    else
        ratingWidths = ratingWidthsNormal;
    if (anchors.length < 9)
    {
        var hrefRegex = new RegExp('value=.');
        for (var j = 4; j > 0; j--)
        {
            var rating = (5 - j) + 0.5;
            var oldAnchor = anchors[j];

            var newAnchor = document.createElement('a');
            newAnchor.href = oldAnchor.href.replace(hrefRegex, 'value=' + rating);
            newAnchor.rel = 'nofollow';
            newAnchor.title = 'Click to rate the movie "' + ratingStrings[rating] + '"';
            newAnchor.innerHTML = 'Rate ' + rating + ' stars';
            newAnchor.setAttribute('style', 'width:' + (ratingWidths[rating] + offset) + 'px');
            newAnchor.setAttribute('class', 'rv' + rating);   /* some netflix javascript parses this class name */
            if (wrapInLi)
            {
                var newli = document.createElement("li");
                newli.appendChild(newAnchor);
                newAnchor = newli;

                oldAnchor = oldAnchor.parentNode; // the li
            }

            elem.insertBefore(newAnchor, oldAnchor);
        }
    }
};

var patchAll = function(parentElem, className, wrapInLi)
{
    var starBars = parentElem.getElementsByClassName(className);
    if (typeof(starBars) !== 'undefined')
    {
        for (i = 0; i < starBars.length; i++)
        {
            patchAnchors(starBars[i], 0, wrapInLi);
        }
    }
};

// Note: First param here is a string rather than an element object
var patchAllArrive = function(selectorStr, classname, wrapInLi)
{
    document.body.arrive(selectorStr + " ." + classname, function() {
        patchAnchors(this, 0, wrapInLi);
    });
};

switch (window.location.pathname.split('/')[1])
{
    case "WiHome":
    case "WiRecentAdditions":
    case "NewReleases":
    case "WiAgain":
    case "WiSimilarsByViewType":
    case "WiAltGenre":
    case "RoleDisplay":
    case "WiRoleDisplay":
        patchAllArrive("#BobMovie-content", "strbrContainer", false); // popups
        break;
    case "WiMovie":
        patchAll($("#displaypage-overview-details")[0], "strbrContainer", false);
        patchAllArrive("#BobMovie-content", "strbrContainer", false); // popups
        break;
    case "MyList":
        if (fplib.isOldMyList())
            patchAll(document.body, "stbrIl", false);
        else
            patchAllArrive("#BobMovie-content", "strbrContainer", false);
        break;
    case "Search": // when DVDs are enabled
        patchAll(document.body, "stbrIl", true);
        break;
    case "WiSearch": // When DVDs are not enabled; likely deprecated with newer search page
        patchAll(document.body, "stbrIl", false);
        break;
    case "RateMovies":
        patchAll(document.body, "strbrContainer", false);
        patchAllArrive("", "strbrContainer", false);
        break;
    case "MoviesYouveSeen":
    case "WiGenre": // page gets redirected in Flix Plus to WiAltGenre anyway
        // not implemented; css is different
        break;
}

// Extra logic for WiHome
if ((window.location.pathname.split('/')[1]) === "WiHome")
{
    // handle rating viewed content at bottom of page (initial and arrivals)
    var ratingRows = document.getElementsByClassName("mrow-rating");
    if ((typeof(ratingRows) !== "undefined") && (ratingRows.length > 0))
        patchAll(ratingRows[0], "strbrContainer", false);
    patchAllArrive(".mrow-rating", "strbrContainer", false);

    patchAllArrive("#layerModalPanes", "strbrContainer", false); // related movies dialog

    // big stars to rate what you just watched
    var headerRow = document.getElementById("headerRow");
    if (headerRow !== null)
        patchAll(headerRow, "strbrContainer", false);
}
