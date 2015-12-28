// netflixnotes userscript for Netflix
// Used (with minimal changes) in Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: (none)
//
// Local modifications include using fewer storage keys and using
// Chrome's sync storage. Also, updated for Netflix November 2015 My list update.
// Found at found at http://userscripts.org:8080/scripts/review/30744/


// Netflix Notes user script
// version 1.2.5
// 2014-01-04
// Copyright (c) 2008-2014, Mike Morearty
// Released under the MIT license
// http://www.opensource.org/licenses/mit-license.php
//
// --------------------------------------------------------------------
//
// This lets you add a short note to yourself for each movie in your
// Netflix queue.  Below each movie name, you will see the words
// "add note".
//
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.  To install it, you need
// Greasemonkey 0.3 or later: http://greasemonkey.mozdev.org/
// Then restart Firefox and revisit this script.
// Under Tools, there will be a new menu item to "Install User Script".
// Accept the default configuration and install.
//
// To uninstall, go to Tools/Greasemonkey/Manage User Scripts,
// select "Netflix Notes", and click Uninstall.
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Netflix Notes
// @namespace     http://www.morearty.com
// @description   Lets you add notes to your Netflix queue entries
// @include       http://*.netflix.com/Queue*
// @include       http://*.netflix.com/MyList*
// ==/UserScript==

var KEY_NAME = "flix_plus " + fplib.getProfileName() + " notes";

////////////////////////////////////////////////////////////////////////////////


var defaultNote = 'add note';  // displayed next to movies that don't have a note

var noteColor = 'yellow';       // text color for the note
var defaultNoteColor = 'dimgray'; // text color for "add note" default text

var all_notes = {};


// This is called when the user begins editing a note, by clicking on it.
// It turns the <span> of text into an edit box.
function onEditMovieNote(event)
{
    var elem = event.currentTarget;
    var noteText = elem.textContent;
    if (noteText == defaultNote)
        noteText = '';
    elem = elem.parentNode;
    var input = document.createElement("input");

    // If the user clicks outside the edit box, he is done editing:
    input.addEventListener('blur', onDoneEditingMovieNote, true);

/*  // This was removed in December 2015 since it conflicted with keyboard shortcuts
    // If the user presses Return, he is done editing:
    input.addEventListener('keydown',
        function(event) {
            if (event.keyCode == 13) {
                event.preventDefault();
                onDoneEditingMovieNote(event);
                return false;
            }
        }, true);
*/
    input.value = noteText;
    input.style.backgroundColor = "black";
    input.style.color = "yellow";

    elem.innerHTML = "";
    elem.appendChild(input);
    input.focus();
}

// This is called when the user is done editing a note, e.g. because they click
// outside of the note or they press Return.  It saves the new note, and turns
// the edit box back into a regular <span> of text.
function onDoneEditingMovieNote(event)
{
    var elem = event.currentTarget;

    // Figure out the movie title
    var title = null;
    for (var e = elem; title == null && e; e = e.parentNode)
    {
        var anchors = e.getElementsByTagName('a');
        if (anchors.length == 1)
        {
            title = anchors[0].text;
        }
    }

    var noteText = elem.value.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    if (noteText == '')
        noteText = defaultNote;

    // Save the note
    saveNote(title, noteText, function(items)
    {
        console.log("note saving complete.");
    });

    // Replace the edit box with a regular <span> of text
    elem = elem.parentNode;
    elem.innerHTML = "";
    elem.appendChild(makeNoteSpan(noteText));
}

// Given the text of a note (which might be the defaultNote text), return
// a <span> element representing that note, along with the proper
// color, click handler, etc.
function makeNoteSpan(noteText)
{
    var innerSpan = document.createElement("span");
    innerSpan.style.color = (noteText == defaultNote ? defaultNoteColor : noteColor);
    innerSpan.style.cursor = 'pointer';
    innerSpan.addEventListener('click', onEditMovieNote, true);
    innerSpan.innerHTML = noteText;
    innerSpan.className = "fp_notes";
    return innerSpan;
}

function loadAllNotes(callback)
{
    fplib.syncGet(KEY_NAME, function(items) {
        console.log(items);
        all_notes = {};
        if (typeof(items[KEY_NAME]) !== "undefined")
            all_notes = JSON.parse(items[KEY_NAME]);

        callback();
    });
}

function loadNote(movieTitle, defaultNote)
{
    var note = all_notes[movieTitle];
    if (typeof(note) === 'undefined')
        note = defaultNote;

    return note;
}

function saveNote(movieTitle, note, callback)
{
    all_notes[movieTitle] = note;
    fplib.syncSet(KEY_NAME, JSON.stringify(all_notes), callback);
}

// The main initialization function.  Loops through all the movies on the page,
// and for each one, adds a <span> to the page showing its note.
function initialize()
{
    loadAllNotes(function()
    {
        insertNotesByClass('title');
    });
}

function insertNotesByClass(className)
{
    var rowListElems = document.getElementsByClassName("rowList");
    if (rowListElems.length) {
        var q = rowListElems[0].getElementsByClassName(className, null, document);
        if (q)
        {
            for (var i = 0; i < q.length; i++)
            {
                insertNotesInElem(q[i]);
            }
        }
    }
}

function insertNotes(idOfSection)
{
    var q = document.getElementById(idOfSection);
    if (q)
        insertNotesInElem(q);
}

function insertNotesInElem(elem)
{
    var title = elem.innerText;
    var noteText = loadNote(title, defaultNote);

    // Create a <span> and insert it
    var innerSpan = makeNoteSpan(noteText);

    var outerSpan = document.createElement("span");
    outerSpan.appendChild(innerSpan);

    elem.appendChild(document.createElement("br"));
    elem.appendChild(outerSpan);
}

// The mutation observer is needed for the newer style My List because when a user goes
// to /my-list, there isn't necessary a page reload.
fplib.addMutationAndNow("add Neflix notes button", {"element": ".rowList" }, function(summary) {
    if (summary.added.length) {
        if (fplib.isOldMyList()) {
            initialize();
        }
    }
});
