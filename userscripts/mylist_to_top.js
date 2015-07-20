// mylist_to_top userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, mutation-summary.js, fplib.js
//
// Moves Continue Watching and MyList to the top of the page
//
// Mutation observers only run when lolomoRows are added/removed.

var moveToTop = function(elem) {
	try {
		var attrType = elem.getAttribute("type") || "";
		if (attrType === "continueWatching") {
			var $firstRow = $(".lolomoRow:first")
			var $gp = $(elem).parent().parent();
			if ($firstRow[0] !== $gp[0]) {
				console.log("moving continueWatching");
		    $gp.detach().insertBefore($firstRow);
			} else {
				console.log("will not move continueWatching over itself");
			}
		} else if (attrType === "queue") {
			var $firstRow = $(".lolomoRow:first")
			var $continueWatchingRow = $(".lolomoRow span[type=continueWatching]");
			var $targetRow = ($firstRow[0] === $continueWatchingRow.parent().parent()[0])
		  	? $(".lolomoRow:nth-child(3)")
		  	: $firstRow;
			var $gp = $(elem).parent().parent();

			if ($targetRow[0] !== $gp[0]) {
				console.log("moving My List");
		    $gp.detach().insertBefore($targetRow);
			} else {
				console.log("will not move My List over itself");
			}
		}
	} catch (ex) {
		console.error(ex);
	}
};

// Move Continue Watching and My List to top if already present
$(".rowTitle").each(function() { moveToTop(this); });

// Do the same if they come later
fplib.addMutation("detect rowTitle for My List to Top", {"element": ".rowTitle"}, function(summary) {
	summary.added.forEach(function(elem) {
	  moveToTop(elem);
	});
});
