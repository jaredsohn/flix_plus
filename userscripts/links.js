// links userscript for Netflix
// Script originally written by Ricardo Mendonça Ferreira (see original comments below)
// Included as a part of Flix Plus by Lifehacker, 2014-2015.
// http://www.github.com/jaredsohn/flixplus
// Depends on: arrive.js, fplib.js
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
    newHTML += newLink('Rotten Tomatoes', 'http://www.rottentomatoes.com/search/?search='+searchY,      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB3UlEQVR42nWSIWgcQRSG/7uuGLHQJ5YwhIqlHGXFUSKOsiJiKRERFSciTpyojIyoKKWiMqIiVEVWRkScCGVFxVGOEsqJo4SylBMjjrJiKY8wlJ8wouKOXJomTzxm4Pvm/QMPuKv2PgxxT7Vv3Zvfi/mvC9tw8v3sTqF1ffJ/fFXPyumJW1SudPmgyNJs+PzVvcLky+nR5MgIqguaSqUn1kohWd7d7Tx7cVtofkyPy0MuXG0NxNSeNja20tTRWSPdbL//Lt7srAT/bVK+3d+qKTFmqTkpJC911hMIXr+vDaEG5z3bP/wYP+60wqXXogDUpeY8NVVisoaDqWqD44EdfNZ0zlWaLJNyFPH0BF7RMVlistggAAFIjHj2S6W58d+q4nj84M3DjdA4sxnBxkjFJBKuCI9wyWQRfDuIXytB4ggkgNXDBEEEAKsYab1CCRAwnhFEQFBhlHCKCFBSAQ+ENUpAA0WkjZ0CBBrSEU7hlAuiJnRFK1CDLtAFym7RCldBd3bhHCIgXo9nWNLUAAVqUrbz4aezFoDwc657AzR6M+4yQ73sJNL0YDyON5I2gOhJR8qR2c7/z+ColVfb7x9MxvFG8s8uAfBfpzoa1dOZq50GwIrN863hy0dPu9fMX6BuBKLFtX0fAAAAAElFTkSuQmCC'); // http://images.rottentomatoescdn.com/images/icons/favicon.ico
    newHTML += newLink('Metacritic',      'http://www.metacritic.com/search/movie/'+searchM+'/results', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABFElEQVR42pWSoXLCQBCGN60ohpnVVVHULpMXSAwOD3WY8hgJvjPRwRwGnZlUoW5QNXSCpQZMpxhmmfQBUnHtcbkLgp0VN7v37X/z33oAAdwSd3BjtAOI3Tx/resNs0ySF6sbuClEURsh5QYx/O+2AfqeZspypxj7SUQ9oh4AJMk8iqb9/vN2+6nqUmaI3YaCOTJNl6qIGJblTutcgDjO6mYQjS3mAvj+UI1P06XWYa5MRogCMQTlCXPFXOW5tFwymb/0/SFzpdr7/ZfrrMNAQDTWjBCFxWhDG/9wjYnjrHk78PTymU4vFm+Tyax1a+4BHtXpeDytVu+j0aDTeSB6AoD1+sMFPGu9lc7h8B1F0/P5xwV+AeCi8O1vPWY7AAAAAElFTkSuQmCC'); // http://www.metacritic.com/favicon.ico
    newHTML += newLink('Wikipedia',       'http://en.wikipedia.org/wiki/Special:Search?search='+search, 'data:image/x-icon;base64,AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAEAgQAhIOEAMjHyABIR0gA6ejpAGlqaQCpqKkAKCgoAPz9/AAZGBkAmJiYANjZ2ABXWFcAent6ALm6uQA8OjwAiIiIiIiIiIiIiI4oiL6IiIiIgzuIV4iIiIhndo53KIiIiB/WvXoYiIiIfEZfWBSIiIEGi/foqoiIgzuL84i9iIjpGIoMiEHoiMkos3FojmiLlUipYliEWIF+iDe0GoRa7D6GPbjcu1yIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'); // http://en.wikipedia.org/favicon.ico
    newHTML += newLink('YouTube',         'http://www.youtube.com/results?search_query='+searchY,       'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAABNklEQVR42o2RMUgCcRTGf++SIGiIs6VZoWa3BqlBERyDpvYbpSnaWrPRxamlyURscKlcWqIaoigKk3MSnDqdCgL1Ndx152VdfcP/8d7/fe99fA9VfaoX9vLzqpqxakeXXY0EXoDBsQL6F7yO55MC4I4/L+UAq3jjDvLfEOGtVwVaw/F7r+o3tYbjaYJBJA634y8jnazE3CAiAKpzS5tnpZyIWMXr5RkZrW2txIyMVfMJ4m78P2K02+RXXTJEkhVOr0QTJrbjlZJxfzP260QawABILoa7iVhlBN+pNLaDgu2QSgPYDuUKQLnCbYf6ReBSANcuX6HtsLNPNgtA9yfCb2I8wRImNJuBAXf32A6NBge7GILt8PDIxrpowhx89F0t0yf5uicCCAuzpgCaMAM3v0sKVaTT/wTQY9zll7taLwAAAABJRU5ErkJggg=='); // http://s.ytimg.com/yt/favicon-vflZlzSbU.ico
    newHTML += newLink('Google',          'http://www.google.com/search?q='+searchY,                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAACuElEQVR42gXBS2icVRQH8P85937zyuQxk5k0oY2NnZEGJYs2ohCkAattF9oKSnFhbUFQt+qy26rduFHctD5wE4uIIoIYJCDU1gc+mrbG6BQS0qbRMaYz6by+7957jr8fADivP9fWJk7O2Sc+euPTxaA+bt65ODvzOyFhDkAAdwhbAAD2To3BmQtLq71h2fHA2a/+XdnopPr7p989X+zLGREiAxIAArvKYGMRvL/+jyA/KMZsd6OPf1wFTGby/njmEQ8SDh6UqFHyKmAVWLI7hjKcCCNmMtdXPMiTQejPORgjsMqGQqJwbCyxADg8Vbr0x4ZNF0RiZiswHKO+tLw+xnf6C1GCkUarvO2cBntjrVG5p/jikercxZvLfzcHsnJqdheBzs2/d+Zw7+Z9+wylQpBsx+270X3q8hrtff7D1089/PTsZKPtvvhlfaYyWBkvnJ0/f/qnd8zoIESDBIDJkXJELUPl4xdc3No/kXt0evT0cwdA+m3t14PvH5fqCIRBoCQCoM6Tj+CJiybJpzKXa7235v5arbdVzZ7izmplP+IeC3OwCk+ihIgA5YRdY3NXNj76YOnEkcnGdlDC+PDYpWfPHSod0E5LlKBGCAqIAi6iuW+uPD49NVxg31za+q/W2b49Vn0mky+74I998urXGwuaGkAw7ESCQQBp0NbmYu37lwu4aqOOxtxykzsPfj5QrCzXbz30wcm7ucR4o4HEEzw4lvafCy/da3/YXe6NDuRKQ+kSLdW/e0XBe0u7R/tGELtAKgGRj8jDJs163t/KREN3W568kYBcthh66+TaXe7rtdqgiH1KyAUNKsrZoYl0+bH2ltdeTkPKUj50TXrsSU3lv/xt/nZzgwJTEHRZEoGkbGTZtTYbi+PavEau42wmXT2UmXrh2trKa5+9Hazh2AYQNAAR3lz4H5/FZqSBRAEUAAAAAElFTkSuQmCC'); // http://www.google.com/favicon.ico
    newHTML += newLink('Amazon',          'http://www.amazon.com/s?linkCode=ur2&camp=1789&creative=390957&field-keywords='+search, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAACXBIWXMAAA7DAAAOwwHHb6hkAAABZElEQVR4nGP8//8/AymABY1/69atuXPn3rt/n5GR0dfHJzY2Fl3HfyRw5swZZlZWFiRUVlb2HxWgaEhLTwcqcnF1vXHjBoQtIyuLpoER2Q/Pnz9/9uzZx48fP33+vGzZsvXr1wMFf//6hdNJN2/eNDAyYkF1FT4nhYaFAVUA9QDtmTxlClYNTMi2QdwQEhIiKSl56dIliODnz59xOsnA0BBiKtDf8OACWoXhpK/P4MEqLSsLVAQkgepCwsKcXV0/v3v+78ai/6eKQAgaSlu0GWzWMQioY4/b/cEMPAoMbAIM1+sYIiA2PN3zfwXD/5NF/z8/+48Jvjz9f3/t//c3/q8VRoqHh+sZTgSBGAK2DBKuDKx8DEBhRkaGl/sZXm5gsFwHEnl9jEG/FiniXp9huNLK8GoDA1gApB5I8WgyGE5ikHZh+A0OK1ZelJgGgQ83GV4fZ/j9EaRDQIdB2hnNRxgaCAEAOXg/pIgPyAsAAAAASUVORK5CYII='); // http://www.amazon.com/favicon.ico
    var linksDiv = document.createElement("div");
    linksDiv.classList.add("fp_links");
    linksDiv.innerHTML = newHTML;
    var panesElem = tw.getElementsByClassName("jawBonePane");
    if (panesElem.length)
      $(panesElem[0]).prepend(linksDiv);
  });
  console.log("fp_links loaded");
}

document.body.arrive(".jawbone-overview-info", function() {
  createLinks();
});
createLinks();

document.body.arrive(".galleryHeader", function() {
  if (window.location.pathname.startsWith("/browse/person/"))
    createPersonLinks(this);
});

