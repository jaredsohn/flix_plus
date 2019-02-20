// expiring userscript for Netflix
// Was found at http://userscripts.org:8080/scripts/show/159166
// Modified (slightly) for Flix Plus by Lifehacker, 2014-2015
// to work with Netflix after My List was updated in November 2015.
//
// http://www.github.com/jaredsohn/flixplus
// Depends on: (none)

// ==UserScript==
// @name          Netflix Expiring
// @namespace     http://www.freespiritedsoftware.com/
// @description   List expiring titles at top of Netflix Instant Queue page
// @version       1.0
// @match         http://*.netflix.com/*
// @match         http://netflix.com/*
// @match         https://*.netflix.com/*
// @match         https://netflix.com/*
// @grant         none
// ==/UserScript==

/** This script was written in response to titles disappearing from my queue due to
 ** Netflix's licensing of the titles expiring, without my being aware.
 **
 ** The script parses the Instant Queue page, and if any titles in your queue have
 ** notes indicating that the title will expiring, a list of expiring titles will be
 ** shown below the Your Queue page title.
 **
 ** Report issues at https://github.com/SamStephens/netflix-expiring/issues
 **
 ** This is a greasemonkey script, intended for use with Greasemonkey.
 ** Firefox: http://greasemonkey.mozdev.org/
 ** Chrome: http://www.chromium.org/developers/design-documents/user-scripts
 **/

var rowListContainer_;
var rowList_

function getExpiring() {
  var expiring = [];
  var rows = rowList_.getElementsByClassName('rowListItem');
  for (var i = 0; i < rows.length; i++) {
    var note = rows[i].getElementsByClassName('notes');
    if (note.length == 1) note = note[0]; else return null;
    var until = note.textContent;
    if (!until) continue;
    if (until.indexOf('until ') == -1) continue;
    var title = rows[i].getElementsByClassName('title'); // was tt (Edited by jaredsohn-lifehacker to not conflict with netflixnotes)
    if (title.length == 1) title = title[0]; else return null;
    expiring.push(title.textContent + '- ' + until);
  }
  return expiring;
}

function setAlert(container) {
  container.style.marginTop = '20px';
  container.style.paddingTop = container.style.paddingBottom = '10px';
  container.style.paddingLeft = '20px';
  container.style.background = '#B9090B';
  container.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.5)';
  container.style.color = '#CCC9C4';
  container.style.textShadow = '0 1px 1px rgba(0, 0, 0, 0.5)';
}

function showError(container) {
  setAlert(container);
  var message = document.createElement('div');
  message.id = "fp_expiring";
  message.innerHTML = 'Error in "Netflix Expiring". <a style="color: #FFF" href="https://github.com/SamStephens/netflix-expiring/issues">Report issue</a>.';
  container.appendChild(message);
}

function showNoneExpiring(container) {
  setAlert(container);
  var message = document.createElement('div');
  message.id = "fp_expiring";
  message.textContent = 'None expiring';
  container.appendChild(message);
}

function showExpiring(container, expiring) {
  setAlert(container);
  var heading = document.createElement('h2');
  heading.textContent = 'Expiring';
  container.appendChild(heading);

  var list = document.createElement('ul');
  list.id = "fp_expiring";
  for (var i = 0; i < expiring.length; i++) {
    var el = document.createElement('li');
    el.textContent = expiring[i];
    list.appendChild(el);
  }
  container.appendChild(list);
}

fplib.addMutationAndNow("add expiring", {"element": ".rowListItem" }, function(summary) {
  if (summary.removed.length) {
    console.log("remove!");
    $fpExpiring = $(".fp_expiring");
    for (var i = 0; i < $fpExpiring.length; i++) {
      $fpExpiring[i].parentNode.removeChild($fpExpiring[i]);
    }
  }
  if (summary.added.length) {
    console.log("rowListItem found!");
    try {
      rowList_ = document.getElementsByClassName('rowList');
      rowListContainer_ = document.getElementsByClassName('rowListContainer');
      console.log(rowList_);
      console.log(rowListContainer_);
      console.log("rowlistitem count");
      console.log($(".rowListItem").length);

      if ((!rowListContainer_.length) || (!rowList_.length))
        return;

      if (rowList_.length)
        rowList_ = rowList_[rowList_.length - 1];
      if (rowListContainer_.length)
        rowListContainer_ = rowListContainer_[rowListContainer_.length - 1];

      // Clear out expiring info if something was already shown
      $fpExpiring = $(".fp_expiring");
      for (var i = 0; i < $fpExpiring.length; i++) {
        $fpExpiring[i].parentNode.removeChild($fpExpiring[i]);
      }

      var expiring = getExpiring();
      console.log(expiring);

      var container = document.createElement('div');
      if (expiring == null) {
        showError(container);
      } else if (expiring.length == 0) {
        showNoneExpiring(container);
      } else {
        showExpiring(container, expiring);
      }
    } catch (ex) {
      console.error(ex);
    }

    container.className = "fp_expiring";
    rowListContainer_.parentNode.parentNode.insertBefore(container, rowListContainer_.parentNode);
  }
});

