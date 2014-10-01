//source: http://userscripts.org:8080/scripts/review/174044

// ==UserScript==
// @name        Netflix Remove FB
// @namespace   http://*.netflix.com/*
// @include     http://*.netflix.com/*
// @version     1
// @grant       none
// ==/UserScript==

(function()
{
    var fb = document.getElementsByClassName('fb');
    for (i=0; i<fb.length; i++)
    {
        var fbEl = fb[i];
        fbEl.style.display = "none";
//        fbEl.parentNode.removeChild(fbEl);  // Removing this can affect other userscripts that number the rows
    }
})();