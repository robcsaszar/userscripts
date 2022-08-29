// ==UserScript==
// @name        Truce.gg: Show plunderable gold & experience
// @namespace   https://github.com/robcsaszar
// @version     1.4
// @description Calculate plunderable player gold & experience
// @author      Rob Csaszar
// @match       https://truce.gg/arena
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://greasyfork.org/scripts/450416-waitforkeyelements/code/_waitForKeyElements.js?version=1087360
// @updateURL   https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Arena.meta.js
// @downloadURL https://raw.githubusercontent.com/robcsaszar/Userscripts/Truce/Arena.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
//- The @grant directives are needed to restore the proper sandbox.
/* global $, waitForKeyElements */
const HEADERS = ['bookmark', 'rank', 'playerName', 'level', 'gold', 'guild', 'actions', 'loot', 'exp'];
const ARENA_TABLE = "#ranking_tbl";

window.jQ = $;

(function() {
    'use strict';
    $(document).ready(function() {
        waitForKeyElements(ARENA_TABLE, getLoot);
        setStyles();
    });
})();

const setStyles = () => {
    addGlobalStyle(`${ARENA_TABLE} > tbody td.YSStyle.highValue { color: #45cb85;}`);
    addGlobalStyle(`${ARENA_TABLE} > tbody td.YSStyle.normalValue { color: #6c6e70;}`);
}

const getRank = () => {
    const rankContainer = '.user-name-sub-text';
    return document.querySelector(rankContainer).innerHTML.replace('#','');
}

const getLevel = () => {
    const levelContainer = `[data-bs-original-title^='Level']`;
    return document.querySelectorAll(levelContainer)[0].innerText;
}

function getLoot() {
    document.querySelector("#tab_ranking").removeEventListener("click", handlePageNavClick);
    updateLoot()
    return document.querySelector("#tab_ranking").addEventListener("click", handlePageNavClick);
}

function handlePageNavClick(event) {
    if (event.target.closest(".paginate_button").classList.contains("active")) return;
    if (event.target.closest(".paginate_button")) {
        updateLoot();
    }
}

function updateLoot() {
    const table = document.querySelectorAll("#ranking_tbl")[0];
    const tbody = table.getElementsByTagName('tbody')[0]
    const columns = table.rows[0].getElementsByTagName('th').length;
    const rows = tbody.getElementsByTagName("tr");

    let lootableGold = [];
    let expGain = [];
    for (let i = 0; i < rows.length; i++) {
        const currentRow = tbody.rows[i];
        const lootable = getLootableGold(currentRow);
        lootableGold = [...lootableGold, lootable];

        const exp = getExpGain(currentRow);
        expGain = [...expGain, exp];
    }

    addColumnsToTable(table, columns, lootableGold, true, 'Loot', 2, `<i class="fa-solid fa-coins me-2"></i>`)
    addColumnsToTable(table, columns, expGain, false, 'Experience', 0, `<i class="fa-solid fa-chart-line me-2"></i>`)
}

async function getOwnStats() {
    const URL = 'https://truce.gg/ajax/fetch_user.php?act=stats';
    const g_uid = getCookie('g_uid');
    const g_hash = getCookie('g_hash');
    const g_token = getCookie('g_token');
    const headers = new Headers();
    headers.append('Cookie', `g_uid=${g_uid}; g_hash=${g_hash}; g_token=${g_token}`);
    headers.append('X-Requested-With', 'XMLHttpRequest');
    const response = await fetch(URL, {
        headers: headers
    });
    return response.text();
}

function getCookie(cname) {
    var cookies = ` ${document.cookie}`.split(";");
    var val = "";
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        if (cookie[0] == ` ${cname}`) {
            return cookie[1];
        }
    }
    return "";
}

const unitlist = ["","K","M","B"];
function formatNumber(number){
    let sign = Math.sign(number);
    let unit = 0;

    while(Math.abs(number) > 1000)
    {
        unit = unit + 1;
        number = Math.floor(Math.abs(number) / 100)/10;
    }
    return sign*Math.abs(number) + unitlist[unit];
}

function addColumnsToTable(table, pos, array, average = false, header = null, colspan = 1, pre = false, post = false){
    if (typeof table === 'string'){
        table = document.getElementById(table);
    }
    const columns = table.rows[0].childNodes.length;
    if (!pos && pos !== 0){
        pos = columns;
    }

    if (header && columns < HEADERS.length) {
        let thead = table.querySelector("thead > tr")
        let th = document.createElement("th");
        th.classList.add('YSStyle', 'sorting_disabled');
        th.innerHTML = header;
        colspan ? th.colSpan = colspan : th.style.display = 'none';
        thead.appendChild(th);
    }

    const tbody = table.querySelector("tbody");
    const median = medianAmount(array);
    if (HEADERS.length == tbody.rows[0].querySelectorAll('td').length) return;
    for (let i = 0; i < array.length; i++) {
        let currentRow = tbody.rows[i];
        const defenderRank = parseInt(currentRow.getElementsByTagName("td")[1]?.innerText);
        let row = document.createElement("td");
        if(getRank() == defenderRank) {
            row.innerHTML = '-';
        } else {
            row.classList.add('YSStyle',`${average && array[i] > median ? 'highValue' : 'normalValue'}`);
            row.innerHTML += pre || '';
            row.innerHTML += formatNumber(array[i]);
            row.innerHTML += post || '';
        }
        currentRow.appendChild(row);
    }
}

function medianAmount(numbers) {
    const sorted = Array.from(numbers).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
}

function getLootableGold(row) {
    const attackerRank = getRank();
    const attackerLevel = getLevel();
    const MIN_GOLD = 50; // Base stolen gold
    const LEVEL_INCREMENT = 2.28;
    const ADDITIONAL_GOLD = 0.05; // Additional stolen gold: 5%
    const GAP_MODIFIER = 3; // 20 Level Gap Modifier: 300% (A player attacking someone 20 ranks lower than themselves will earn 300% less Gold than if attacking someone their own rank)
    const MAX_GAP = 20; // Maximum rank gap
    const defenderRank = parseInt(row.getElementsByTagName("td")[1]?.innerText);
    const defenderLevel = parseInt(row.getElementsByTagName("td")[3]?.innerText);
    let defenderGoldText = row.getElementsByTagName("td")[4]?.innerText;
    let defenderGold = parseFloat(defenderGoldText) || defenderGoldText;
    let rankDifference = attackerRank - defenderRank;

    if (rankDifference > MAX_GAP) {
        rankDifference = MAX_GAP;
    }

    if (defenderGoldText.includes("K")) {
        defenderGold = defenderGold * 1_000;
    }

    if (defenderGoldText.includes("M")) {
        defenderGold = defenderGold * 1_000_000;
    }

    if (defenderGoldText.includes("B")) {
        defenderGold = defenderGold * 1_000_000_000;
    }

    if (defenderGoldText.includes("T")) {
        defenderGold = defenderGold * 1_000_000_000_000;
    }

    return Math.floor(( ( MIN_GOLD + ( Math.pow(attackerLevel, LEVEL_INCREMENT) ) ) + ( ADDITIONAL_GOLD * defenderGold ) ) * ( Math.pow(GAP_MODIFIER, ( (rankDifference) / MAX_GAP)) ));
}

function getExpGain(row) {
    const attackerRank = getRank();
    const attackerLevel = getLevel();
    const MIN_EXP = 5; // Base exp value
    const LEVEL_INCREMENT = 2;
    const GAP_MODIFIER = 3; // 20 Level Gap Modifier: 300% (A player attacking someone 20 ranks lower than themselves will earn 300% less Gold than if attacking someone their own rank)
    const MAX_GAP = 20; // Maximum rank gap
    const defenderRank = parseInt(row.getElementsByTagName("td")[1]?.innerText);
    let rankDifference = attackerRank - defenderRank;

    if (rankDifference > MAX_GAP) {
        rankDifference = MAX_GAP;
    }

    return Math.floor((MIN_EXP + (Math.pow(attackerLevel, LEVEL_INCREMENT)) * (Math.pow(GAP_MODIFIER, rankDifference / 20))));
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