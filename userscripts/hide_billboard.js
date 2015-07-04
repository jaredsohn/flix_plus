// hide_billboard userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js

/*
$.each($(".billboard-row"), function() { this.style.display = "none"; });
$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });

document.body.arrive(".is-fullbleed", {fireOnAttributesModification: true}, function() {
	this.classList.remove("is-fullbleed");
});

document.body.arrive(".billboard-row", function() {
	this.style.display = "none";
	$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });
});*/


// Some newer code that uses mutation-summary instead of arrive.js.  Don't
// want to include overhead of mutation-summary yet.

var lolomoObserver_ = null;

var hideBillboardAndFixBleed = function() {
	var $lolomos = $(".lolomo");
	if ($lolomos.length) {
		$lolomos[0].classList.remove("is-fullbleed");

		var billboardRows = $lolomos[0].getElementsByClassName(".billboard-row");
		[].slice.apply(billboardRows).forEach(function(billboardRow) {
			billboardRow.style.display = "none";
		});
	} else {
		console.log("no lolomos");
	}
};

// Hide the billboard and remove the bleed on page load
$.each($(".billboard-row"), function() { this.style.display = "none"; });
$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });


var createLolomoObserver = function() {
	console.log(".lolomo found");

	if (lolomoObserver_ !== null)
		lolomoObserver_.disconnect();

	lolomoObserver_ = new MutationObserver(function(mutations) {
		console.log("lolomoobserver called!");
		hideBillboardAndFixBleed();
	});
	lolomoObserver_.observe($(".lolomo")[0], {
		subtree: false,
		childList: false,
		characterData: false,
		attributes: true,
		attributeFilter: ["class"]
	});
};

document.body.arrive(".billboard-row", function() {
	this.style.display = "none";
	$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });
});

// We do an arrive for .lolomo and then use raw observers to check for
// when the attribute changes on just that element
document.body.arrive(".lolomo", null, function() {
	hideBillboardAndFixBleed();
	createLolomoObserver();
});

if ($(".lolomo").length)
	createLolomoObserver();

