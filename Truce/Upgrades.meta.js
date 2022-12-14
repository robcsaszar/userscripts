// ==UserScript==
// @name        Truce.gg: Show better statistics on upgrades
// @namespace   https://github.com/robcsaszar
// @version     1.0.3
// @description Calculate and display more relevant statistics on upgrades page
// @author      Yukio
// @match       https://truce.gg/upgrades
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://github.com/robcsaszar/userscripts/raw/master/Helpers/waitForKeyElements.js
// @downloadURL https://github.com/robcsaszar/userscripts/raw/master/Truce/Upgrades.user.js
// @updateURL   https://github.com/robcsaszar/userscripts/raw/master/Truce/Upgrades.meta.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
// The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */