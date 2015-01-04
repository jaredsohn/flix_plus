// Written by jaredsohn-lifehacker.
// If page is interrupted with a 'Who's watching' prompt, just close it.
//
// One can test this easily by running this js from the console (after including jquery via a Chrome extension or converting the snippet to not require jquery)
//$.each($(".close"), function(index, value) { this.click()  })
//
// We do not use jquery below because including jquery on the page itself (when testing by copy-pasting) causes the dialog to not work.

MutationObserver2 = window.MutationObserver || window.WebKitMutationObserver;

var observer2 = new MutationObserver2(function(mutations) {
    if (document.getElementsByClassName("exitKidsContainer").length === 0)
    {
        if ((document.getElementById("profiles-gate")).style["display"] !== "none")
        {
            console.log('autoclosing dialog');
            // autoclose it
            setTimeout(function() {
                var profilesGate = document.getElementById("profiles-gate");
                var elems = profilesGate.getElementsByClassName("close");
                var len = elems.length;
                for (i = 0; i < len; i++)
                {
                    elems[i].click();
                }
            }, 100);
        }
    }
});
var elem = document.getElementById("profiles-gate");
if (typeof(elem) !== "undefined")
    observer2.observe(elem, { attributes: true });
