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
// -- now requires arrive.js


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



/**
 * Patches anchor elements under the containing DIV of the given class name by adding child elements
 * with half-star rating widths among the existing elements.
 */
function patchAnchors(elem, offset, wrap_in_li)
{
    var anchors = elem.getElementsByTagName('a');
    if ((typeof(anchors) === "undefined") || (anchors.length === 0))
        return;
    if (anchors[0].offsetWidth > 100)
        rating_widths = ratingWidthsLarge;
    else
        rating_widths = ratingWidthsNormal;
    if (anchors.length < 9)
    {
        var hrefRegex = new RegExp('value=.');
        for (var j=4; j > 0; j--)
        {
            var rating = (5-j)+0.5;
            var oldAnchor = anchors[j];

            var newAnchor = document.createElement('a');
            newAnchor.href = oldAnchor.href.replace(hrefRegex, 'value='+rating);
            newAnchor.rel = 'nofollow';
            newAnchor.title = 'Click to rate the movie "'+ratingStrings[rating]+'"';
            newAnchor.innerHTML = 'Rate '+rating+' stars';
            newAnchor.setAttribute('style', 'width:'+(rating_widths[rating]+offset)+'px');
            newAnchor.setAttribute('class', 'rv'+rating);   /* some netflix javascript parses this class name */
            if (wrap_in_li)
            {
                var newli = document.createElement("li");
                newli.appendChild(newAnchor);
                newAnchor = newli;

                oldAnchor = oldAnchor.parentNode; // the li
            }

            elem.insertBefore(newAnchor, oldAnchor);
        }
    }
}

var patch_all = function(parent_elem, className, wrap_in_li)
{
    var star_bars = parent_elem.getElementsByClassName(className);
    if (typeof(star_bars) !== 'undefined')
    {
        for (i = 0; i < star_bars.length; i++)
        {
            patchAnchors(star_bars[i], 0, wrap_in_li);
        }
    }
}

// Note: First param here is a string rather than an element object
var patch_all_arrive = function(selector_str, classname, wrap_in_li)
{
    document.body.arrive(selector_str + " ." + classname, function() {
        patchAnchors(this, 0, wrap_in_li);
    });    
}

switch (window.location.pathname.split('/')[1])
{
    case "WiHome":
    case "WiRecentAdditions":
    case "NewReleases":
    case "WiAgain":
    case "WiSimilarsByViewType":
    case "WiAltGenre":
    case "WiMovie":
    case "RoleDisplay":
    case "WiRoleDisplay":
        patch_all_arrive("#BobMovie-content", "strbrContainer", false); // popups
        break;
    case "MyList":
        if (fplib.isOldMyList())
            patch_all(document.body, "stbrIl", false);
        else
        {
            patch_all_arrive("#BobMovie-content", "strbrContainer", false)
        }
        break;
    case "Search": // when DVDs are enabled
        patch_all(document.body, "stbrIl", true);
        break;
    case "WiSearch": // When DVDs are not enabled; likely deprecated with newer search page
        patch_all(document.body, "stbrIl", false);
        break;
    case "RateMovies":
        patch_all(document.body, "strbrContainer", false);
        patch_all_arrive("", "strbrContainer", false);
        break;
    case "MoviesYouveSeen":
    case "WiGenre": // page gets redirected in Flix Plus to WiAltGenre anyway
        // TODO: css is different
        break;   
}

// Extra logic for WiHome
if ((window.location.pathname.split('/')[1]) === "WiHome")
{
    // handle rating viewed content at bottom of page (initial and arrivals)
    var rating_rows = document.getElementsByClassName("mrow-rating");
    if ((typeof(rating_rows) !== "undefined") && (rating_rows.length > 0))
        patch_all(rating_rows[0], "strbrContainer", false);
    patch_all_arrive(".mrow-rating", "strbrContainer", false);

    patch_all_arrive("#layerModalPanes", "strbrContainer", false); // related movies dialog

    // big stars to rate what you just watched
    var headerRow = document.getElementById("headerRow");
    if (headerRow !== null)
        patch_all(headerRow, "strbrContainer", false);
}