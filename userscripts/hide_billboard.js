// hide_billboard userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js

var recentObserver_ = false;

var lolomoObserver_ = null;

var hideBillboardAndFixBleed = function() {
	var $lolomos = $(".lolomo");
	console.log("lolomos");
	console.log($lolomos);
	if ($lolomos.length) {
		console.log("lolomo 0 classlist");
		console.log($lolomos[0].classList);
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
		if (recentObserver_) {
			console.log("ignoring observer since one was recently called")
			return;
		}
		console.log("lolomoobserver called!");
		console.log(mutations);
		recentObserver_ = true;
		setTimeout(function() {
			recentObserver_ = false;
		}, 1000);
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
	console.log("billboard-row arrive");
	this.style.display = "none";
	$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });
});

// We do an arrive for .lolomo and then use raw observers to check for
// when the attribute changes on just that element
document.body.arrive(".lolomo", null, function() {
	console.log('lolomo arrive');
	hideBillboardAndFixBleed();
	createLolomoObserver();
});

if ($(".lolomo").length)
	createLolomoObserver();
