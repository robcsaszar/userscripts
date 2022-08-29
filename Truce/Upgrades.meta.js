// ==UserScript==
// @name        Truce.gg: Show better statistics on upgrades
// @namespace   https://github.com/robcsaszar
// @version     1.0.1
// @description Calculate and display more relevant statistics on upgrades page
// @author      Yukio
// @match       https://truce.gg/upgrades
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://greasyfork.org/scripts/450416-waitforkeyelements/code/_waitForKeyElements.js?version=1087360
// @downloadURL https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Upgrades.user.js
// @updateURL   https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Upgrades.meta.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
// The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */