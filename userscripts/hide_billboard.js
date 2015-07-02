// hide_billboard userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js

$.each($(".billboard-row"), function() { this.style.display = "none"; });
$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });

document.body.arrive(".is-fullbleed", {fireOnAttributesModification: true}, function() {
	this.classList.remove("is-fullbleed");
});

document.body.arrive(".billboard-row", function() {
	this.style.display = "none";
	$.each($(".is-fullbleed"), function() { this.classList.remove("is-fullbleed"); });
});
