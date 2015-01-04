// mylist_to_top.js
// Userscript written by Jared Sohn / Lifehacker to move MyList to the top of the page.
// Because this can change the order of posters, run it before any scripts that number the rows and expect them to be in some order.

if (!($(".yourListRow")[0] === $(".mrow:first")[0]))
{
    console.log("moving MyList to top...");

    //remove titles/sliders
    var orig_first_row_title = $(".mrow:first .hd h3:last").detach();
    var orig_first_row_contents = $(".mrow:first .bd .slider").detach();
    var orig_last_row_title = $(".yourListRow .hd h3").detach();
    var orig_last_row_contents = $(".yourListRow .bd .slider").detach();

    // Do a swap
    $(".mrow:first .bd").append(orig_last_row_contents);
    $(".mrow:first .hd").append(orig_last_row_title);
    $(".yourListRow .bd").append(orig_first_row_contents);
    $(".yourListRow .hd").append(orig_first_row_title);

    // Move MyList to the second row
    $(".yourListRow").detach().insertAfter($(".mrow:first"));

    // Clean up the classnames
    $(".mrow:first .hd h3:last").addClass("rowTitle");
    $(".yourListRow .hd h3").removeClass("rowTitle");
    $(".yourListRow").removeClass("yourListRow");
    $(".mrow:first").addClass("yourListRow");
}
