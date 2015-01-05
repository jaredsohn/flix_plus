// source: https://userstyles.org/styles/77414/darker-netflix

// ==UserScript==
// @name          Darker Netflix
// @namespace     http://userstyles.org
// @description   Netflix styled in dark grays. Clean, modern and easy on the eyes.
// @author        zigboom
// @homepage      http://userstyles.org/styles/77414
// @include       http://netflix.com/*
// @include       https://netflix.com/*
// @include       http://*.netflix.com/*
// @include       https://*.netflix.com/*
// @run-at        document-start
// ==/UserScript==

// Changes made by jaredsohn-lifehacker for Flix Plus:
// * fix subtitles by not running on WiPlayer
// * image folders
// * modifying a margin
// * linting


var css = "* { color: #999999 !important; \n }\n \n* { border-color: #333333 !important; \n }\n\n/* Background Color */\n\nhtml, body, .mrow, .mrows, .hr-wiOnlyIntro, #fground #bd.main-content, form.acctchange h2, \n#page-SubscriptionAdd .planlist li .formcol, #displaypage-overview-container, #memberReviews, \n.mrow-rating .hd, .mrow-rating .svf-u, .mrow-rating .clearfix, .certRating, .certRating .value, \n.dropdown-menu .inner1 .inner2, .profiles-menuBody > ul:nth-child(2), .manage {\n    background-color: #181818 !important;\n}\n\n/* Second Background Color */\n\n .mresult, .pbw-density .progress-bar, .pbw-density .mini-progress-bar, \n#bd > DIV > DIV:nth-child(8) > DIV:nth-child(2), #BobMovie .bobMovieContent, .bobMovieHeader,\n #BobMovie .interactive .title, #unavailable-result, .ui-autocomplete .ac-item.selected, .dmbr, #seasonsNav, \n    .ebob-content, .ebob-foot, .ebob-content .heading, .ebob-head {\n    background: #282828 !important;\n}\n\n/* Third Background Color */\n\n#searchResultsPrimary .oddrow, #evo-message-layer,\n#episodeColumn ul.episodeList li:hover, #episodeColumn ul.episodeList li.current, .taste-container .taste-ribbon  {\n     background: #333333 !important;\n}\n\n.fixedHeaderLayer, .opaque-top-bar, .account-tools, .yourListRow.withTemplate .agMovieSet, #fixedHeaderLayer, \n.starbar .stbrOl .rvnorec, .starbar .rvnoseen, .starbar .rvclear, \n #descriptor, #ratedMoviesBadge .numMoviesRatedBox, .mrows .mrow .recentlyWatched, \n #displaypage-body hr.faded, #globalHeaderGradient {\nbackground: transparent !important;  \n }\n\n\n.playBtn .btnWrap {\nbackground-color: transparent !important;  \n }\n\n.profileImg {\n    transform: scale(1);\n    transition: transform .5s;\n    border-radius: 5px !important; \n}\n    \n.profileImg:hover {\n    transform: scale(1.125);\n    transition: transform .5s;\n}\n    \n/* Tooltip Arrow */\n\n#evo-message-layer:after {\n    border-color: transparent #333333 transparent transparent !important;\n}\n\n#ratedMoviesBadge  {\n background: linear-gradient(#444444, #181818) !important;  \n border: none !important; \n }\n\n/* info popup arrow */\n\n#BobMovie-arrow, .ebob-arrow {\n background: url(\"../img/9863801315_689aa3e748_o.png\") no-repeat !important;\n }\n\n/* Instant Cue Closer */\n\n#evo-message-layer .closer, #evo-message-layer .closer {\n    background-image: url(\"../img/netflix_common_sprite.png\")!important;\n    background-position: -43px -32px !important; \n    transform: rotate(0deg);\n    transition: transform .6s;\n}\n \n#evo-message-layer .closer:hover, #evo-message-layer .closer:focus {\n    background-image: url(\"../img/netflix_common_sprite.png\")!important;\n    background-position: -43px -32px !important; \n    transform: rotate(180deg);\n    transition: transform .6s;\n}\n\n/* Try these next Close Button */\n\n .close-button {\n    background-position: 0px 29px !important;\n}\n\n .close-button:hover {\n    transform: rotate(180deg);\n    transition: transform .6s;\n}\n\n/* Links */\n\na, #hd #profiles-menu li a .profileName, #hd #profiles-menu li.manage a div {\n color: #CCCCCC !important; \n text-shadow: none !important; \n  transition: color, text-shadow .5s !important; \n }\n \n a:hover, #hd #profiles-menu li a:hover .profileName, #hd #profiles-menu li.manage a:hover div {\n color: #EEEEEE !important; \n text-shadow: 0 0 4px rgba(255,255,255,.6) !important; \n text-decoration: none !important; \n transition: color, text-shadow .5s !important; \n }\n \n/* Header */\n \n#hd {\n background: linear-gradient(#444444, #181818) !important; \n border-radius: 6px !important; \n border: 1px solid #333333 !important; \n opacity: .98 !important; \n box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2) !important; \n }\n \n#global-search {\n background: linear-gradient(#181818, #333333) !important; \n border-radius: 6px !important; \n }\n \n #global-search div, .starbar .stbrOl .rvnorec, .starbar .rvnoseen, .starbar .rvclear, .bobMovieHeader {\n  border: none !important; \n  }\n  \n  #global-search button {\n    background: url(\"../img/toolbar_find-1.png\") center no-repeat !important;\n    margin-top : 0px !important; \n    opacity: .8 !important; \n     -moz-transition: opacity .5s !important; \n }\n \n #global-search button:hover { \n    opacity: 1 !important; \n     -moz-transition: opacity .5s !important; \n }\n  \n  .subnav-wrap {\n   background: #282828 !important; \n    border: 1px solid #333333 !important; \n    border-radius: 0 0 6px 6px !important; \n   }\n   \n .nav-item-current a {\n  color: #FFFFFF !important; \n  }\n\n .down-arrow, .boxShotDivider, .down-arrow-shadow {\n display: none !important; \n }\n \n .up-arrow, .right-arrow  {\n     opacity: 0 !important; \n    border-radius: 6px 6px 0 0 !important; \n   }\n   \n .mrow .triangleBtns .next .arrow, .mrow .slider-button.next .arrow {\n    border-left: medium none !important;\n}  \n\n.mrow .triangleBtns .previous .arrow, .mrow .slider-button.previous .arrow {\n      border-right: medium none !important;\n}  \n\n\n\n.mrow .triangleBtns .next .arrow, .mrow .slider-button.next .arrow, \n.mrow .triangleBtns .arrow, .mrow .slider-button .arrow {\n margin-left: 0px !important; \n }\n   \n   \n   \n   \nbody .ui-autocomplete {\n    text-align: left;\n    background: #181818 !important;\n    border: 1px solid #282828 !important;\n    box-shadow: 0px 4px 11px rgb(24, 24, 24);\n    border-radius: 0px 0px 6px 6px !important;\n    margin-top: 14px !important; \n}\n\n/* Buttons */\n\n.rvnoseen, .sc-strm .qdropdown-trigger a, .dp-btn, .svfb-silver, .svfb-default {\n background: linear-gradient(#444444, #181818) !important; \n margin: 4px !important; \n border-radius: 6px !important; \n box-shadow: none !important; \n transition: box-shadow .5s !important;\n }\n \n .rvnoseen:hover, .sc-strm .qdropdown-trigger a:hover, .dp-btn.svfb-active, .dp-btn:active, .svfb-silver:hover, .svfb-default:hover {\n background: linear-gradient(#666666, #282828) !important; \n box-shadow: 0 0 4px rgba(255,255,255,.2) !important; \n transition: box-shadow .5s !important;\n }\n\n\n.mrows .mrow .evidence, .mrows .mrow .facet-control {\n background-image: none !important; \n }\n\n/* Footer */\n\n#footer  {\n background: linear-gradient(#444444, #181818) !important; \n border-radius: 6px !important; \n border: 1px solid #333333 !important; \n opacity: 1 !important; \n box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2) !important; \n padding-bottom: 18px !important; \n }\n\n/* Border None */\n\n#footer .service-code, h1.page-title, #searchResultsPrimary, .control-t, .control-b, \n.sc-strm #bd .merch-vignette, .ebob-content .heading {\n border: none !important; \n }\n \n/* Box Shadow None */ \n\n.sc-strm #bd .merch-vignette, \n.ua-firefox #displaypage-overview #displaypage-overview-image .boxShotImg, .boxShot {\nbox-shadow : none !important; \n  }\n\n/* Border 1px */ \n\n.boxShot {\n border: 1px solid #333333 !important;\n}\n\n#memberReviews hr.faded {\n background: #282828 !important; \n border-top: 1px solid #000000 !important; \n height: 2px !important; \n}\n \n \n .logo {\n opacity: .7 !important; \n -moz-transition: opacity .5s !important; \n }\n \n .logo:hover {\n opacity: 1 !important; \n  -moz-transition: opacity .5s !important; \n }\n \n \n#BobMovie-content {background: #222;}\n\n.accountContent .svfDoc .main-content {background-color: #222;}\n\n.infoBox {background: #2e2e2e;}\n\n#footer {background-color: #2e2e2e;}\n\n.taste-cat-gp .name {background-color: #2e2e2e;}\n\n.taste-cat dl.odd {background-color: #2e2e2e;}\n\n.taste-cat dl.highlight, .ex-container {background-color: #ccc;}\n\n.custom-view-list .agMovieTable {background-color:#2e2e2e;}\n\n.custom-view-list .agMovieTable th {background-color: #2e2e2e;}\n\n.custom-view-list .agMovieTable tr {background-color: #3e3e3e;}\n\n.custom-view-list .agMovieTable tr.odd {background-color: #2f2f2f;} \n\n#pageContent {background-color: #2e2e2e;}\n\n\n\n\n\n/* ############# */";

css += "#displaypage-overview #displaypage-overview-details { margin-left: 25px;}";

if (location.pathname.indexOf("/WiPlayer") === 0) // Fix the subtitles
    return;

if (typeof GM_addStyle != "undefined") {
    GM_addStyle(css);
} else if (typeof PRO_addStyle != "undefined") {
    PRO_addStyle(css);
} else if (typeof addStyle != "undefined") {
    addStyle(css);
} else {
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
        heads[0].appendChild(node);
    } else {
        // no head yet, stick it whereever
        document.documentElement.appendChild(node);
    }
}

