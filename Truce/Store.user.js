// ==UserScript==
// @name        Truce.gg: Show extra attack/defense information
// @namespace   https://github.com/robcsaszar
// @version     1.0.2
// @description Show gold per attack/defense and how much of each you stand to gain based on your gold
// @author      Rob Csaszar
// @match       https://truce.gg/store
// @icon        https://www.google.com/s2/favicons?sz=64&domain=truce.gg
// @require     https://github.com/robcsaszar/userscripts/raw/master/Helpers/waitForKeyElements.js
// @downloadURL https://github.com/robcsaszar/userscripts/raw/master/Truce/Store.user.js
// @updateURL   https://github.com/robcsaszar/userscripts/raw/master/Truce/Store.meta.js
// @supportURL  https://github.com/robcsaszar/Userscripts/issues
// @grant       GM_addStyle
// @grant       GM.getValue
// @run-at      document-end
// ==/UserScript==
/* global $, waitForKeyElements */
const HEADERS = ['item', 'level', 'attack', 'gold', 'available', 'actions', 'goldperenergy'];
const TABLES = "#attack-tab table";

window.jQ = $;

(function() {
    'use strict';
    $(document).ready(function() {
        waitForKeyElements(TABLES, calculatePowerOfGold);
    });
})();

function calculatePowerOfGold() {
    const tables = document.getElementsByTagName('table');
    tables.forEach((table, i) => {
        const tbody = table.getElementsByTagName('tbody')[0]
        const columns = table.rows[0].getElementsByTagName('td').length;
        const rows = tbody.getElementsByTagName("tr");
        const powerType = {
            name: i == 0 ? `ATK` : `DEF`,
            icon: i == 0 ? `fa-dagger` : `fa-shield-halved`,
        };
        let tableData = {
            table: table,
            columns: columns,
            header: null,
            colspan: 1,
            pre: false,
            post: false,
            goldEfficiency: [],
            increaseBy: [],
            disabled: []
        };

        rows.forEach((el, i) =>{
            const currentRow = tbody.rows[i];
            tableData = {
                ...tableData,
                header: `${powerType.name}/GOLD`,
                icon: powerType.icon,
                goldEfficiency: [...tableData.goldEfficiency, getRowValues(currentRow)[0]],
                increaseBy: [...tableData.increaseBy, getRowValues(currentRow)[1]],
                disabled: [...tableData.disabled, getRowValues(currentRow)[2]]
            }
        })
        addColumnsToTable(tableData);
    })
}

function getRowValues(row) {
    let attackContent = row.querySelectorAll('td h5')[2].innerHTML;
    let goldContent = row.querySelectorAll('td h5')[3].innerHTML;
    let availableContent = row.querySelectorAll('td h5')[4].innerHTML;
    let enabled = row.querySelectorAll('td')[5].getElementsByTagName('button')[0].classList.contains('disabled');
    const units = ["K","M","B"];
    const amounts = [1_000, 1_000_000, 1_000_000_000];

    let attack = parseFloat(attackContent);
    let gold = parseFloat(goldContent);
    let available = parseFloat(availableContent);
    for (let i = 0; i <= units.length; i++) {
        if (attackContent.includes(units[i])) {
            attack = attackContent.replace(units[i], "") * amounts[i];
        }
        if (goldContent.includes(units[i])) {
            gold = goldContent.replace(units[i], "") * amounts[i];
        }
        if (availableContent.includes(units[i])) {
            available = availableContent.replace(units[i], "") * amounts[i];
        }
    }
    return [(attack / gold).toFixed(2), formatNumber(attack * available), enabled];
}

function formatNumber(number){
const unitlist = ["","K","M","B"];
    let sign = Math.sign(number);
    let unit = 0;

    while(Math.abs(number) > 1000)
    {
        unit = unit + 1;
        number = Math.floor(Math.abs(number) / 100)/10;
    }
    return sign*Math.abs(number) + unitlist[unit];
}

function addColumnsToTable(tableData){
    if (typeof tableData.table === 'string'){
        tableData.table = document.getElementById(tableData.table);
    }
    const columns = tableData.table.rows[0].childNodes.length;

    if (tableData.header && columns < HEADERS.length) {
        let thead = tableData.table.querySelector("thead > tr")
        let th = document.createElement("th");
        th.classList.add('YSStyle', 'sorting_disabled');
        th.innerHTML = tableData.header;
        tableData.colspan ? th.colSpan = tableData.colspan : th.style.display = 'none';
        thead.appendChild(th);
    }

    const tbody = tableData.table.querySelector("tbody");
    if (HEADERS.length == tbody.rows[0].querySelectorAll('td').length) return;
    for (let i = 0; i < tableData.goldEfficiency.length; i++) {
        let h5 = document.createElement("h5");
        h5.classList.add('fs-14', 'my-1');
        h5.innerHTML = tableData.pre || '';
        h5.innerHTML += formatNumber(tableData.goldEfficiency[i]);
        h5.innerHTML += `<small class='text-muted ms-1'>${tableData.header}</small>`;

        let td = document.createElement("td");
        td.className = 'YSStyle';
        td.innerHTML += h5.outerHTML;
        td.innerHTML += tableData.post || '';

        let span = document.createElement('span');
        span.innerHTML = `<i class="fa-solid ${tableData.icon} me-1"></i>`;
        span.innerHTML += tableData.disabled[i] ? '-' : tableData.increaseBy[i];
        td.appendChild(span);

        let currentRow = tbody.rows[i];
        currentRow.appendChild(td);
    }
}