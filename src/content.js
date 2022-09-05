const wiki = "http://runescape.wiki/w/Special:Search?search=";
const img = chrome.runtime.getURL("assets/wiki.jpg");
const TABLE = chrome.runtime.getURL("src/XP_TABLE.json");
let time = 0;

chrome.runtime.onMessage.addListener((request) => {
	if (request.type === "hiscore") {
		const skills = document.getElementsByTagName("td");
		chrome.storage.sync.get({
			rs3Virt: true,
			osrsVirt: true
		}, (items) => {
			if (items.osrsVirt && request.tab.url.includes("oldschool")) {
				if (request.tab.url.includes("oldschool") && request.tab.url.includes("compare")) {
					OSRS(skills);
				} else if (request.tab.url.includes("oldschool") && request.tab.url.includes("hiscorepersonal")) {
					OSRSolo(skills);
				}
			} else if (items.rs3Virt && !request.tab.url.includes("oldschool")) {
				RS3(skills);
			}
		});
	} else if (request.type === "market") {
		chrome.storage.sync.get({
			wikiLinks: true
		}, (items) => {
			if (!items.wikiLinks) {
				return;
			}
			market();
		});
	} else if (request.type === "item") {
		chrome.storage.sync.get({
			wikiLinks: true
		}, (items) => {
			if (!items.wikiLinks) {
				return;
			}
			item();
		});
	} else if (request.type === "news") {
		// const time = document.getElementsByTagName("time");
		// if (time[0].dateTime < time[1].dateTime) {
		chrome.storage.sync.get({
			newsPin: true
		}, (items) => {
			if (!items.newsPin) {
				return;
			}
			console.log("abc");
			// const style = document.createElement("style");
			// style.appendChild(document.createTextNode(""));
			// document.head.appendChild(style);
			const sheet = document.styleSheets[document.styleSheets.length - 1];
			const style = `{
					content: '📌';
					float: left;
					font-size: 13pt;
					color: transparent;
					text-shadow: 0 0 0 #e1bb34;
				}`;
			if (request.tab.url.includes("news")) {
				sheet.insertRule(`.index article:first-child::before ${style}`);
			} else {
				sheet.insertRule(`.index article:first-child::before ${style}`);
			}
		});
		// }
	}
});

function item() {
	const head = document.getElementsByClassName("item-description")[0];
	const a = document.createElement("a");
	a.href = wiki + encodeURIComponent(head.children[0].innerText);
	a.target = "_blank";
	const wikiNode = `<img src="${img}" width="32px" style="border-radius:8px;top:-8px;right:8px" />`;
	a.innerHTML = wikiNode;
	head.appendChild(a);
}

function market() {
	if (time) {
		return;
	}
	const table = document.getElementsByTagName("table")[0];
	if (!table) {
		return;
	}
	const wikiHead = document.createElement("th");
	wikiHead.style.padding = "10px";
	wikiHead.appendChild(document.createTextNode("Wiki"));
	const headRow = table.children[0].children.length - 1;
	table.children[0].children[headRow].appendChild(wikiHead);

	const rows = table.children[1].children;
	for (let i = 0; i < rows.length; i++) {
		const itemName = rows[i].children[0].children[0].children[0].title;
		const wikiLink = wiki + encodeURIComponent(itemName);
		// console.log(wikiLink);
		const wikiNode = `<a href="${wikiLink}" target="_blank"><img src="${img}" width="32px" style="border-radius:8px;" /></a>`;
		const td = document.createElement("td");
		td.innerHTML = wikiNode;
		td.style.paddingLeft = "17px";
		// if (headRow) {
		const span = rows[i].children[0].children[0].children[1];
		span.style = "width:0;white-space:nowrap;";
		if ((span.innerText.includes("...") && span.innerText.length > 21) || span.innerText.length >= 17) {
			span.innerText = `${span.innerText.replace("...", "").slice(0, -7)}...`.replace(" ...", "...");
		}
		// }
		td.classList.add("memberItem");
		table.children[1].children[i].appendChild(td);
	}
	time = 1;
}

function changeValue(s, i, v) {
	if (s[i].children[0].children[0]) {
		s[i].children[0].children[0].innerHTML = v.toLocaleString();
	} else {
		s[i].children[0].innerHTML = v.toLocaleString();
	}
}

const changes = {
	u1: [],
	u2: []
};
let running = false;

async function RS3Loop(skills) {
	const table = await fetch(TABLE);
	const XP_TABLE = await table.json();
	console.log(XP_TABLE);
	for (let i = 2; i < skills.length; i++) {
		const level = (skills[i].children[0].children[0]) ? skills[i].children[0].children[0] : skills[i].children[0];
		if (level.text === "99" || (level.text === "120" && (i === 83 || i === 168))) {
			const xpIndex = (i <= 86) ? i - 1 : i + 1;
			const xp = parseInt(skills[xpIndex].children[0].text.replace(/,/g, ""));
			let virtualLevel = level.text;
			const type = (i === 83 || i === 168) ? "elite" : "standard";
			for (let j = 0; j < XP_TABLE[type].length; j++) {
				if (xp > XP_TABLE[type][j].xp) {
					virtualLevel = XP_TABLE[type][j].level;
				}
			}
			const change = (type === "elite") ? virtualLevel - 120 : virtualLevel - 99;
			const user = (i > 86) ? "u2" : "u1";
			changes[user].push({
				index: i,
				change
			});
			changeValue(skills, i, virtualLevel);
		}
		if (i !== 86) {
			i = i + 2;
		}
	}
}

function RS3Total(skills) {
	const u1TotalLevel = (skills[2].children[0].children[0]) ? skills[2].children[0].children[0] : skills[2].children[0];
	const u2TotalLevel = (skills[87].children[0].children[0]) ? skills[87].children[0].children[0] : skills[87].children[0];
	// console.log("skills", skills);
	// console.log("u1TotalLevel", u1TotalLevel.innerText);
	// console.log("u2TotalLevel", u2TotalLevel.innerText);
	if (u1TotalLevel.text !== "--") {
		const virtualTotal = parseInt(u1TotalLevel.text.replace(/,/g, ""));
		if (virtualTotal) {
			const newVirTotal = changes.u1.reduce((acc, curr) => curr.change + acc, virtualTotal);
			// console.log("virtualTotal", virtualTotal);
			// console.log("newVirTotal", newVirTotal);
			changeValue(skills, 2, newVirTotal);
		}
	}
	if (u2TotalLevel.text !== "--") {
		const virtualTotal = parseInt(u2TotalLevel.text.replace(/,/g, ""));
		if (virtualTotal) {
			const newVirTotal = changes.u2.reduce((acc, curr) => curr.change + acc, virtualTotal);
			// console.log("virtualTotal", virtualTotal);
			// console.log("newVirTotal", newVirTotal);
			changeValue(skills, 87, newVirTotal);
		}
	}
}

async function OSLoop(skills, start, skip, iskip) {
	const table = await fetch(TABLE);
	const XP_TABLE = await table.json();
	for (let i = start; i < skills.length; i++) {
		const level = skills[i];
		if (level.innerText === "99") {
			const xpIndex = i + 1;
			const xp = parseInt(skills[xpIndex].innerText.replace(/,/g, ""));
			let virtualLevel = level.innerText;
			for (let j = 0; j < XP_TABLE.standard.length; j++) {
				if (xp > XP_TABLE.standard[j].xp) {
					virtualLevel = XP_TABLE.standard[j].level;
				}
			}
			level.innerHTML = virtualLevel.toLocaleString();
		}
		if (i >= iskip) {
			break;
		} else {
			i = i + skip;
		}
	}
}

function OSTotal(skills, start, skip, iskip, solo = false) {
	let total = 0;
	for (let i = start; i < skills.length; i++) {
		const level = skills[i];
		if (solo && i !== start && i < iskip) {
			total += parseInt(level.innerText);
		} else if (!solo && (i !== 30 && i !== 36) && i < iskip) {
			total += parseInt(level.innerText);
		}
		if (i >= iskip) {
			skills[start].innerHTML = total.toLocaleString();
			break;
		} else {
			i = i + skip;
		}
	}
}

async function RS3(skills) {
	if (running) {
		return;
	}
	running = true;
	await RS3Loop(skills);
	skills = document.getElementsByTagName("td");
	RS3Total(skills);
	running = false;
}

async function OSRS(skills) {
	await OSLoop(skills, 30, 10, 290);
	await OSLoop(skills, 36, 10, 290);
	skills = document.getElementsByTagName("td");
	OSTotal(skills, 30, 10, 290);
	OSTotal(skills, 36, 10, 290);
}

async function OSRSolo(skills) {
	await OSLoop(skills, 15, 4, 131);
	skills = document.getElementsByTagName("td");
	OSTotal(skills, 15, 4, 131, true);
}
