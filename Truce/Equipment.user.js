// ==UserScript==
// @name        Truce.gg: Show enhance on item row click
// @namespace   https://github.com/robcsaszar
// @version     1.0.0
// @description Click on an item row to show enhancement
// @author      Rob Csaszar
// @match       https://truce.gg/equipment
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://greasyfork.org/scripts/450416-waitforkeyelements/code/_waitForKeyElements.js?version=1087360
// @downloadURL https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Equipment.user.js
// @updateURL   https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Equipment.meta.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
/* global $, waitForKeyElements, LoadFile */

window.jQ = $;

(function() {
    'use strict';
    waitForKeyElements("#gearTbl", addRowHandlers);
})();

function addRowHandlers() {
 var table = document.getElementById("gearTbl");
 var rows = table.getElementsByTagName("tr");

 for (let i = 0; i < rows.length; i++) {
   var currentRow = table.rows[i];
   currentRow.onclick = createClickHandler(currentRow);
 }
}

function createClickHandler(row) {
  return function() {
    var id = row.getElementsByTagName("img")[0].dataset.id;// if you put 0 here then it will return first column of this row
    LoadFile($('#enhance-wrapper'), `ajax/fetch_equipment.php?act=enhance&id=${id}`);
  };
}