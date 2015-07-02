// mylist_to_top userscript for Netflix
// Built by Jared Sohn as a part of Flix Plus by Lifehacker, 2014-2015
// http://www.github.com/jaredsohn/flixplus
// Depends on: jquery, arrive.js
//
// Moves MyList to the top of the page (as the second row)

var moveMyList = function() {
  if (!($(".fp_yourListRow")[0] === $(".lolomoRow:nth-child(2)")[0])) {
    console.log("moving MyList to second row...");
    $(".fp_yourListRow").detach().insertAfter($(".lolomoRow:first")[0]);
  }
};

document.body.arrive(".fp_yourListRow", { fireOnAttributesModification: true }, function() {
  console.log("checking if MyList should get moved");
  moveMyList();
});

fplib.idMrows();
moveMyList();

