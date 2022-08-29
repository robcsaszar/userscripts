// ==UserScript==
// @name        Truce.gg: Show better statistics on upgrades
// @namespace   https://github.com/robcsaszar
// @version     1.0.1
// @description Calculate and display more relevant statistics on upgrades page
// @author      Yukio
// @match       https://truce.gg/upgrades
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://greasyfork.org/scripts/450416-waitforkeyelements/code/_waitForKeyElements.js?version=1087360
// @updateURL   https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Upgrades.meta.js
// @downloadURL https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Upgrades.user.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
// The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */

const GOLD_LEVEL = "#developments-wrapper > div > div:nth-child(1) > h4"
const SHARD_LEVEL = "#developments-wrapper > div > div:nth-child(2) > h4"
const BONUS_LEVEL = "#bonus-wrapper > div > div > h4"
const ANY_STATS = "#stats-wrapper > div > div > div > div > div";
const GOLD_STATS = "#stats-wrapper > div > div:nth-child(1) > div > div > div";
const SHARD_STATS = "#stats-wrapper > div > div:nth-child(2) > div > div > div";
const BONUS_STATS = "#stats-wrapper > div > div:nth-child(3) > div > div > div";

window.jQ = $;

(function() {
    'use strict';
    $(document).ready(function() {
        waitForKeyElements(BONUS_LEVEL, watchBonus);
        waitForKeyElements(GOLD_LEVEL, watchGold);
        waitForKeyElements(SHARD_LEVEL, watchShards);
        setStyles();
    });
})();

const setStyles = () => {
    addGlobalStyle(`#stats-wrapper .avatar-title { background-image: linear-gradient( 37deg,  rgba(176,233,223,1) 11.1%, rgba(180,224,193,1) 37.8%, rgba(237,207,126,1) 65%, rgba(222,84,84,1) 92.7% ); background-size: 80px 80px;`);
    addGlobalStyle(`html[data-layout-mode="dark"] #stats-wrapper .avatar-title { color: #29175e !important;}`);
    addGlobalStyle(`#stats-wrapper .avatar-title { color: #fff !important;}`);
    addGlobalStyle(`${ANY_STATS}:not(.loaded) { visibility: hidden; transition: all 500ms ease-in-out;}`);
    addGlobalStyle(`${ANY_STATS}.loaded { animation: fadeIn 300ms ease-in-out; animation-fill-mode: forwards;}`);
    addGlobalStyle(`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}`);
}

function watchGold(jNode) {
    const current = formatDailyResources(jNode);
    const previous = jNode.data("previous") || "";
    const statsCard = document.querySelectorAll(GOLD_STATS)[0];
    let title = statsCard.querySelector('p');
    let stats = statsCard.querySelector('h4');

    if (!areEqual(current, previous)) {
        jNode.data("previous", current);
        console.log(`🪙 Current gold/day: ${current}`);

        title.innerHTML = 'Gold per day';
        stats.innerHTML = current;
    }
    return loadStats(statsCard);
}

function watchShards(jNode) {
    const current = formatDailyResources(jNode);
    const previous = jNode.data("previous") || "";
    const statsCard = document.querySelectorAll(SHARD_STATS)[0];
    let title = statsCard.querySelector('p');
    let stats = statsCard.querySelector('h4');

    if (!areEqual(current, previous)) {
        jNode.data("previous", current);
        console.log(`🧊 Current shards/day: ${current}`);

        title.innerHTML = 'Shards per day';
        stats.innerHTML = current;
    }
    return loadStats(statsCard);
}

function watchBonus(jNode) {
    const currentCost = parseInt($('#bonus-wrapper .upgradeBonusButton').mainText() || $('#bonus-wrapper button.disabled').mainText());
    const current = formatBonus(jNode, currentCost);
    const previous = jNode.data("previous") || "";
    const statsCard = document.querySelectorAll(BONUS_STATS)[0];
    let title = statsCard.querySelector('p');
    let stats = statsCard.querySelector('h4');

    if (!areEqual(current, previous)) {
        jNode.data("previous", current);
        console.log(`✨ Shards needed for capping bonus: ${current}`);

        title.innerHTML = 'Shards for max bonus';
        stats.innerHTML = current;
    }
    return loadStats(statsCard);
}

//#region - Private Methods

function loadStats(stats) {
    return stats.classList.add('loaded');
}

function formatDailyResources(amount) {
    return formatNumber(parseInt(amount.mainText().replace(/,/g, '')) * 96);
}

function formatBonus(bonusLevel, currentCost) {
    const bonusLeft = (getLevel() * 10) - parseInt(bonusLevel.mainText().replace(/,/g, '').replace(/%/g, ''))
    let total = [];
    for(let i = 0; i <= bonusLeft; i++){
        currentCost = 10 + Math.round(currentCost ** 1)
        total = [...total, currentCost]
    }
    return formatNumber(total.reduce((pre, curr)=>pre + curr, 0));
}

function areEqual(a, b) {
    if (a === b) return true;

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }

    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
        return a === b;
    }

    if (a.prototype !== b.prototype) return false;

    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;

    return keys.every(k => areEqual(a[k], b[k]));
};

const getLevel = () => {
    const levelContainer = `[data-bs-original-title^='Level']`;
    return document.querySelectorAll(levelContainer)[0].innerText;
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

function addGlobalStyle(css) {
    const style = document.getElementById("YSStyle") || (function() {
        const style = document.createElement('style');
        style.type = 'text/css';
        style.id = "YSStyle";
        style.innerHTML = css.replace(/;/g, ' !important;');
        const head = document.getElementsByTagName('head')[0];
        head.appendChild(style);
        return style;
    })();
    const sheet = style.sheet;
    sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
}

$.fn.mainText = function(x=0) {
    return $.trim(this.eq(x).contents().not(this.eq(x).children()).text().replace(/[\t\n]+/g,' '));
};

//#endregion - Private Methods