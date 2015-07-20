// links userscript for Netflix
// Script originally written by Ricardo Mendonça Ferreira (see original comments below)
// Included as a part of Flix Plus by Lifehacker, 2014-2015.
// http://www.github.com/jaredsohn/flixplus
// Depends on: mutation-summary.js, fplib.js
//
// Changes made to Flix Plus were minimal.  They include:
// * changed Spanish text to English
// * removing less relevant links
// * removing an Amazon referral
// * updating for newer versions of Netflix
// * matching project coding standards
// * adding a link the title page on Netflix

// File encoding: UTF-8
//{
// Este script funciona nas páginas do Netflix, adicionando links para
// vários sites com informações sobre o vídeo.
//
// Copyright (c) 2011, Ricardo Mendonça Ferreira (ric@mpcnet.com.br)
// Released under the GPL license - http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Netflix Links
// @description   Em páginas de filmes no Netflix, adiciona links para sites como IMDB, Rotten Tomatoes, Wikipedia, etc.
// @namespace     http://userscripts.org/scripts/show/114148
// @include       http://*.netflix.com/WiMovie/*
// @include       http://*.netflix.com/Movie/*
// @match         http://*.netflix.com/WiMovie/*
// @match         http://*.netflix.com/Movie/*
// @version       1.3
// ==/UserScript==
//
// --------------------------------------------------------------------
//
// Para usar este script, é preciso usar o navegador Google Chrome, ou
// o navegador Firefox com o add-on Greasemonkey: http://www.greasespot.net/
//
// --------------------------------------------------------------------
//
// History:
// --------
// 2012.12.06  [1.3] Inclui também Filmow
// 2011.10.03  [1.2] Busca também no IMDb.pt; usando @match (p/ Google Chrome)
// 2011.09.30  [1.1] Acrescentado include p/ /Movie/*
// 2011.09.28  [1.0] 1ª versão
//}

"use strict";

var getData = function(src, className, regex) {
  var result = "";
  var objs = src.getElementsByClassName(className);
  if (objs && objs.length) {
    var match = objs[0].innerHTML.match(regex);
    if (match && match[1])
      result = match[1];
    else result = "";
  }
  return result;
};

var newLink = function(name, addr, icon) {
  return '<a target="_blank" href="' + addr + '"><img src="' + icon + '" title="Find on ' + name + '" border="0"></a> &nbsp;'; 
}
var createPersonLinks = function(gh) {
  var personNames = gh.getElementsByClassName("title");
  if (personNames.length) {
    var personName = personNames[0].innerHTML;

    var newHTML = "";
    newHTML += newLink('IMDB',            'http://www.imdb.com/find?q='+personName,                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAIAAABiEdh4AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABQklEQVR42pWSu0oDURRF1zyiCWicSQoxKEqmsEkjaXx0Yuk/qB9gYSHaih9gE/wBbdJbCRGbNEJsDESIEi1UEMEQApnXzVjcZJxEJLqLw73n7LPPvg/l8nyO/0AHVtfG5EYIAOEB+D6A7/V4Tgeg3nD1n9Tf2BJKu2GNFO6JyuThrgkUCxnASKrvd5YsF46n5SKfi9dKWeDh2qqVsmr0QM1W977uRTPFQqZStU/PPgFPBIAuPUgYSXVn781Iqs1Wty+fCKtHJx/1J3dgQtrUHp+9tKkNXaV0n5rSKlV7oGF5KRFG4RPakNhYmQBUEfGcMrQwStzc2kPTBiZsrk9a87FoZmv/NZ+LS+3tgxdAaZSt0KU0IByl/5oB4Lvf/U4HbXYmtrgwPsQWIggComyng/Ap19r6SOHoY/c+38VV+++/9Qswi5SSSNxmuwAAAABJRU5ErkJggg==');
    newHTML += newLink('Wikipedia',       'http://en.wikipedia.org/wiki/Special:Search?search='+personName, 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAEAgQAhIOEAMjHyABIR0gA6ejpAGlqaQCpqKkAKCgoAPz9/AAZGBkAmJiYANjZ2ABXWFcAent6ALm6uQA8OjwAiIiIiIiIiIiIiI4oiL6IiIiIgzuIV4iIiIhndo53KIiIiB/WvXoYiIiIfEZfWBSIiIEGi/foqoiIgzuL84i9iIjpGIoMiEHoiMkos3FojmiLlUipYliEWIF+iDe0GoRa7D6GPbjcu1yIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'); // http://en.wikipedia.org/favicon.ico
    newHTML += newLink('Google',          'http://www.google.com/search?q='+personName,                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAACuElEQVR42gXBS2icVRQH8P85937zyuQxk5k0oY2NnZEGJYs2ohCkAattF9oKSnFhbUFQt+qy26rduFHctD5wE4uIIoIYJCDU1gc+mrbG6BQS0qbRMaYz6by+7957jr8fADivP9fWJk7O2Sc+euPTxaA+bt65ODvzOyFhDkAAdwhbAAD2To3BmQtLq71h2fHA2a/+XdnopPr7p989X+zLGREiAxIAArvKYGMRvL/+jyA/KMZsd6OPf1wFTGby/njmEQ8SDh6UqFHyKmAVWLI7hjKcCCNmMtdXPMiTQejPORgjsMqGQqJwbCyxADg8Vbr0x4ZNF0RiZiswHKO+tLw+xnf6C1GCkUarvO2cBntjrVG5p/jikercxZvLfzcHsnJqdheBzs2/d+Zw7+Z9+wylQpBsx+270X3q8hrtff7D1089/PTsZKPtvvhlfaYyWBkvnJ0/f/qnd8zoIESDBIDJkXJELUPl4xdc3No/kXt0evT0cwdA+m3t14PvH5fqCIRBoCQCoM6Tj+CJiybJpzKXa7235v5arbdVzZ7izmplP+IeC3OwCk+ihIgA5YRdY3NXNj76YOnEkcnGdlDC+PDYpWfPHSod0E5LlKBGCAqIAi6iuW+uPD49NVxg31za+q/W2b49Vn0mky+74I998urXGwuaGkAw7ESCQQBp0NbmYu37lwu4aqOOxtxykzsPfj5QrCzXbz30wcm7ucR4o4HEEzw4lvafCy/da3/YXe6NDuRKQ+kSLdW/e0XBe0u7R/tGELtAKgGRj8jDJs163t/KREN3W568kYBcthh66+TaXe7rtdqgiH1KyAUNKsrZoYl0+bH2ltdeTkPKUj50TXrsSU3lv/xt/nZzgwJTEHRZEoGkbGTZtTYbi+PavEau42wmXT2UmXrh2trKa5+9Hazh2AYQNAAR3lz4H5/FZqSBRAEUAAAAAElFTkSuQmCC'); // http://www.google.com/favicon.ico
    var div = document.createElement("div");
    div.innerHTML = newHTML;
    gh.appendChild(div);
  }
};

var createLinks = function() {
  var tws = document.getElementsByClassName("jawBoneContainer"); // tws was titlewrappers for an earlier version of Netflix
  Array.prototype.slice.call(tws).forEach(function(tw) {
    if (tw.getElementsByClassName("fp_links").length !== 0)
      return;

    var isTv = (tw.getElementsByClassName("Episodes").length !== 0);

    var title   = fplib.parseTitle(tw);
    var year    = getData(tw,       "year",      /(\d+)/   ); // Obtém ano de produção
    var searchM = title.replace(/ /g, '+').replace(/[^a-zA-Z0-9\s\+]/g,'').toLowerCase();
    var title   = encodeURIComponent(title);
    var search  = title;
    var searchY = isTv ? search : ((title) + ' ('+year+')'); // No year in query for tv shows

    var newHTML = "";
    newHTML += newLink('Netflix',         window.location.protocol + '//www.netflix.com/title/' + tw.id, 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAAALCbn/Cwm5/wsJuf8LCbn/Cwm5/xIRgP8WFWT/FRRu/xAOk/8QDpP/DQum/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/xgWW/8gHyP/IB8j/yAfI/8gHyP/IB8j/yAfI/8gHyP/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf9JSUz/x8fI/0lJTP9XV1r/gYGD/1dXWv8gHyP/IB8j/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/V1da//////9XV1r/q6us////////////IB8j/yAfI/8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/1dXWv//////V1da/8fHyP///////////yAfI/8gHyP/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf9XV1r//////1dXWv////////////////8gHyP/IB8j/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/V1da//////9lZWf//////+Pj4///////IB8j/yAfI/8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/1dXWv//////j4+R///////Hx8j//////yAfI/8gHyP/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf9XV1r//////7m5uv//////j4+R//////8gHyP/IB8j/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/V1da///////V1dX/8fHx/4+Pkf//////IB8j/yAfI/8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/1dXWv///////////8fHyP+Pj5H//////yAfI/8gHyP/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf9XV1r///////////+dnZ7/j4+R//////8gHyP/IB8j/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/V1da////////////j4+R/4+Pkf//////IB8j/yAfI/8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/1dXWv///////////1dXWv+Pj5H//////yAfI/8gHyP/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf9JSUz/x8fI/8fHyP87Oz7/c3N1/8fHyP8gHyP/EhGA/wsJuf8LCbn/Cwm5/wsJuf8LCbn/Cwm5/wsJuf8LCbn/FRRu/xUUbv8VFG7/FRRu/xUUbv8VFG7/EQ+K/wsJuf8LCbn/Cwm5/wsJuf8LCbn/AADy8gAA8vIAAPLyAADy8gAA8vIAAPLyAADy8gAA8vIAAPLyAADy8gAA8vIAAPLyAADy8gAA8vIAAPLyAADy8g==');
    newHTML += newLink('IMDB',            'http://www.imdb.com/find?q='+searchY,                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAIAAABiEdh4AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABQklEQVR42pWSu0oDURRF1zyiCWicSQoxKEqmsEkjaXx0Yuk/qB9gYSHaih9gE/wBbdJbCRGbNEJsDESIEi1UEMEQApnXzVjcZJxEJLqLw73n7LPPvg/l8nyO/0AHVtfG5EYIAOEB+D6A7/V4Tgeg3nD1n9Tf2BJKu2GNFO6JyuThrgkUCxnASKrvd5YsF46n5SKfi9dKWeDh2qqVsmr0QM1W977uRTPFQqZStU/PPgFPBIAuPUgYSXVn781Iqs1Wty+fCKtHJx/1J3dgQtrUHp+9tKkNXaV0n5rSKlV7oGF5KRFG4RPakNhYmQBUEfGcMrQwStzc2kPTBiZsrk9a87FoZmv/NZ+LS+3tgxdAaZSt0KU0IByl/5oB4Lvf/U4HbXYmtrgwPsQWIggComyng/Ap19r6SOHoY/c+38VV+++/9Qswi5SSSNxmuwAAAABJRU5ErkJggg==');
    newHTML += newLink('Rotten Tomatoes', 'http://www.rottentomatoes.com/search/?search='+searchY,      'data:image/png;base64,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');
    newHTML += newLink('Metacritic',      'http://www.metacritic.com/search/movie/'+searchM+'/results', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABFElEQVR42pWSoXLCQBCGN60ohpnVVVHULpMXSAwOD3WY8hgJvjPRwRwGnZlUoW5QNXSCpQZMpxhmmfQBUnHtcbkLgp0VN7v37X/z33oAAdwSd3BjtAOI3Tx/resNs0ySF6sbuClEURsh5QYx/O+2AfqeZspypxj7SUQ9oh4AJMk8iqb9/vN2+6nqUmaI3YaCOTJNl6qIGJblTutcgDjO6mYQjS3mAvj+UI1P06XWYa5MRogCMQTlCXPFXOW5tFwymb/0/SFzpdr7/ZfrrMNAQDTWjBCFxWhDG/9wjYnjrHk78PTymU4vFm+Tyax1a+4BHtXpeDytVu+j0aDTeSB6AoD1+sMFPGu9lc7h8B1F0/P5xwV+AeCi8O1vPWY7AAAAAElFTkSuQmCC'); // http://www.metacritic.com/favicon.ico
    newHTML += newLink('Wikipedia',       'http://en.wikipedia.org/wiki/Special:Search?search='+search, 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAEAgQAhIOEAMjHyABIR0gA6ejpAGlqaQCpqKkAKCgoAPz9/AAZGBkAmJiYANjZ2ABXWFcAent6ALm6uQA8OjwAiIiIiIiIiIiIiI4oiL6IiIiIgzuIV4iIiIhndo53KIiIiB/WvXoYiIiIfEZfWBSIiIEGi/foqoiIgzuL84i9iIjpGIoMiEHoiMkos3FojmiLlUipYliEWIF+iDe0GoRa7D6GPbjcu1yIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'); // http://en.wikipedia.org/favicon.ico
    newHTML += newLink('YouTube',         'http://www.youtube.com/results?search_query='+searchY,       'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABNklEQVR42o2RMUgCcRTGf++SIGiIs6VZoWa3BqlBERyDpvYbpSnaWrPRxamlyURscKlcWqIaoigKk3MSnDqdCgL1Ndx152VdfcP/8d7/fe99fA9VfaoX9vLzqpqxakeXXY0EXoDBsQL6F7yO55MC4I4/L+UAq3jjDvLfEOGtVwVaw/F7r+o3tYbjaYJBJA634y8jnazE3CAiAKpzS5tnpZyIWMXr5RkZrW2txIyMVfMJ4m78P2K02+RXXTJEkhVOr0QTJrbjlZJxfzP260QawABILoa7iVhlBN+pNLaDgu2QSgPYDuUKQLnCbYf6ReBSANcuX6HtsLNPNgtA9yfCb2I8wRImNJuBAXf32A6NBge7GILt8PDIxrpowhx89F0t0yf5uicCCAuzpgCaMAM3v0sKVaTT/wTQY9zll7taLwAAAABJRU5ErkJggg=='); // http://s.ytimg.com/yt/favicon-vflZlzSbU.ico
    newHTML += newLink('Google',          'http://www.google.com/search?q='+searchY,                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAACuElEQVR42gXBS2icVRQH8P85937zyuQxk5k0oY2NnZEGJYs2ohCkAattF9oKSnFhbUFQt+qy26rduFHctD5wE4uIIoIYJCDU1gc+mrbG6BQS0qbRMaYz6by+7957jr8fADivP9fWJk7O2Sc+euPTxaA+bt65ODvzOyFhDkAAdwhbAAD2To3BmQtLq71h2fHA2a/+XdnopPr7p989X+zLGREiAxIAArvKYGMRvL/+jyA/KMZsd6OPf1wFTGby/njmEQ8SDh6UqFHyKmAVWLI7hjKcCCNmMtdXPMiTQejPORgjsMqGQqJwbCyxADg8Vbr0x4ZNF0RiZiswHKO+tLw+xnf6C1GCkUarvO2cBntjrVG5p/jikercxZvLfzcHsnJqdheBzs2/d+Zw7+Z9+wylQpBsx+270X3q8hrtff7D1089/PTsZKPtvvhlfaYyWBkvnJ0/f/qnd8zoIESDBIDJkXJELUPl4xdc3No/kXt0evT0cwdA+m3t14PvH5fqCIRBoCQCoM6Tj+CJiybJpzKXa7235v5arbdVzZ7izmplP+IeC3OwCk+ihIgA5YRdY3NXNj76YOnEkcnGdlDC+PDYpWfPHSod0E5LlKBGCAqIAi6iuW+uPD49NVxg31za+q/W2b49Vn0mky+74I998urXGwuaGkAw7ESCQQBp0NbmYu37lwu4aqOOxtxykzsPfj5QrCzXbz30wcm7ucR4o4HEEzw4lvafCy/da3/YXe6NDuRKQ+kSLdW/e0XBe0u7R/tGELtAKgGRj8jDJs163t/KREN3W568kYBcthh66+TaXe7rtdqgiH1KyAUNKsrZoYl0+bH2ltdeTkPKUj50TXrsSU3lv/xt/nZzgwJTEHRZEoGkbGTZtTYbi+PavEau42wmXT2UmXrh2trKa5+9Hazh2AYQNAAR3lz4H5/FZqSBRAEUAAAAAElFTkSuQmCC'); // http://www.google.com/favicon.ico
    newHTML += newLink('Amazon',          'http://www.amazon.com/s?linkCode=ur2&camp=1789&creative=390957&field-keywords='+search, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7DAAAOwwHHb6hkAAABZElEQVR4nGP8//8/AymABY1/69atuXPn3rt/n5GR0dfHJzY2Fl3HfyRw5swZZlZWFiRUVlb2HxWgaEhLTwcqcnF1vXHjBoQtIyuLpoER2Q/Pnz9/9uzZx48fP33+vGzZsvXr1wMFf//6hdNJN2/eNDAyYkF1FT4nhYaFAVUA9QDtmTxlClYNTMi2QdwQEhIiKSl56dIliODnz59xOsnA0BBiKtDf8OACWoXhpK/P4MEqLSsLVAQkgepCwsKcXV0/v3v+78ai/6eKQAgaSlu0GWzWMQioY4/b/cEMPAoMbAIM1+sYIiA2PN3zfwXD/5NF/z8/+48Jvjz9f3/t//c3/q8VRoqHh+sZTgSBGAK2DBKuDKx8DEBhRkaGl/sZXm5gsFwHEnl9jEG/FiniXp9huNLK8GoDA1gApB5I8WgyGE5ikHZh+A0OK1ZelJgGgQ83GV4fZ/j9EaRDQIdB2hnNRxgaCAEAOXg/pIgPyAsAAAAASUVORK5CYII='); // http://www.amazon.com/favicon.ico
    var linksDiv = document.createElement("div");
    linksDiv.classList.add("fp_links");
    linksDiv.innerHTML = newHTML;
    var panesElem = tw.getElementsByClassName("jawBonePane");

    if (panesElem.length) {
      var $paneElem = $(panesElem[0]);
      $paneElem.prepend(linksDiv);
      var overviewInfos = $paneElem[0].getElementsByClassName(".jawbone-overview-info");
      if (overviewInfos.length)
        fplib.ensureEverythingFits(overviewInfos[0]);
    }
  });
  console.log("fp_links loaded");
}

console.log("going to add mutation events");
fplib.addMutation("detect movie info for links", {"element": ".jawbone-overview-info" }, function(summary) {
  createLinks();
});
createLinks();

fplib.addMutation("detect person for links", {"element": ".galleryHeader" }, function(summary) {
  if (window.location.pathname.startsWith("/browse/person/")) {
    summary.added.forEach(function(elem) {
      createPersonLinks(elem);
    });
  }
});
