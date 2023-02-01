const wiki = "http://runescape.wiki/w/Special:Search?search=";
const img = chrome.runtime.getURL("assets/wiki.jpg");
const TABLE = chrome.runtime.getURL("src/XP_TABLE.json");
let time = 0;

chrome.runtime.onMessage.addListener(async (request) => {
	if (request.type === "hiscore") {
		const skills = document.getElementsByTagName("td");
		const items = await chrome.storage.sync.get({
			rs3Virt: true,
			osrsVirt: true
		});
		if (items.osrsVirt && request.tab.url.includes("oldschool")) {
			if (request.tab.url.includes("oldschool") && request.tab.url.includes("compare")) {
				OSRS(skills);
			} else if (request.tab.url.includes("oldschool") && request.tab.url.includes("hiscorepersonal")) {
				OSRSolo(skills);
			}
		} else if (items.rs3Virt && !request.tab.url.includes("oldschool")) {
			RS3(skills);
		}
	} else if (request.type === "market") {
		const items = await chrome.storage.sync.get({
			wikiLinks: true
		});
		if (!items.wikiLinks) {
			return;
		}
		market();
	} else if (request.type === "item") {
		const items = await chrome.storage.sync.get({
			wikiLinks: true
		});
		if (!items.wikiLinks) {
			return;
		}
		item();
	} else if (request.type === "news") {

		const sidebar = document.querySelector("main aside.sidebar");
		const wikiNews = document.createElement("section");
		wikiNews.classList.add("sidebar-module");
		sidebar.appendChild(wikiNews);
		const header = document.createElement("h3");
		header.innerText = "Social News";
		wikiNews.appendChild(header);

		const res = await fetch("https://api.weirdgloop.org/runescape/social");
		const json = await res.json();

		// console.log("[CAL]", json);

		const ul = document.createElement("ul");
		ul.classList.add("news-list");
		wikiNews.appendChild(ul);

		for (const item of json.data) {
			let icon = "";
			if (!item.source) {
				item.source = (new URL(item.url)).hostname.split(".")[1];
			}
			if (item.source === "runescape") {
				continue;
			}
			if (item.icon) {
				const s = item.source;
				icon = `<img src="${item.icon}" alt="${s[0].toUpperCase() + s.slice(1)} logo" class="news-icon">`;
			} else if (item.source === "twitter") {
				icon = "<img src=\"https://runescape.wiki/images/thumb/Twitter_news_icon.svg/240px-Twitter_news_icon.svg.png\" alt=\"Twitter logo\" class=\"news-icon\">";
			} else if (item.source === "reddit") {
				icon = "<img src=\"https://runescape.wiki/images/thumb/Reddit_news_icon.svg/240px-Reddit_news_icon.svg.png\" alt=\"Reddit logo\" class=\"news-icon\">";
			} else if (item.source === "youtube") {
				icon = "<img src=\"https://www.youtube.com/s/desktop/8049ee3e/img/favicon_96x96.png\" alt=\"Youtube logo\" class=\"news-icon\">";
			} else if (item.source === "twitch") {
				icon = "<img src=\"https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png\" alt=\"Twitch logo\" class=\"news-icon\">";
			}
			const date = formatDate((item.datePublished) ? item.datePublished : item.dateAdded);
			const newsItem = `<a class="news-item" title="${item.title}" href="${item.url}" target="_blank">
				${icon}
				<span class="news-title">${item.title}</span>
				<time class="news-date" datetime="${date[0]}" title="${date[2]}">${date[1]}</time>
				<br>
				<span class="news-snippet">
					${(item.image)?`<img class="news-image" src="${item.image}" alt="article image">`:""}
					${item.excerpt}
				</span>
			</a>`;
			const li = document.createElement("li");
			li.innerHTML = newsItem;
			ul.appendChild(li);
		}

		// const time = document.getElementsByTagName("time");
		// if (time[0].dateTime < time[1].dateTime) {
		const items = await chrome.storage.sync.get({
			newsPin: true
		});
		if (!items.newsPin) {
			return;
		}
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
		// }
	}
	return true;
});

// in miliseconds
const units = {
	year: 24 * 60 * 60 * 1000 * 365,
	month: 24 * 60 * 60 * 1000 * 365 / 12,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
	second: 1000
};

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function getRelativeTime(d1, d2 = new Date()) {
	const elapsed = d1 - d2;

	// "Math.abs" accounts for both "past" & "future" scenarios
	for (const u in units) {
		if (Math.abs(elapsed) > units[u] || u === "second") {
			return rtf.format(Math.round(elapsed / units[u]), u);
		}
	}
}

function formatDate(input) {
	const date = (input) ? new Date(input) : new Date();
	const options = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		timeZoneName: "short"
	};

	return [
		date.toLocaleString("en-GB", options),
		getRelativeTime(date),
		date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(",", "")
	];
}

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
		// console.log("[CAL]", wikiLink);
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
	console.log("[CAL]", XP_TABLE);
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
	// console.log("[CAL]", "skills", skills);
	// console.log("[CAL]", "u1TotalLevel", u1TotalLevel.innerText);
	// console.log("[CAL]", "u2TotalLevel", u2TotalLevel.innerText);
	if (u1TotalLevel.text !== "--") {
		const virtualTotal = parseInt(u1TotalLevel.text.replace(/,/g, ""));
		if (virtualTotal) {
			const newVirTotal = changes.u1.reduce((acc, curr) => curr.change + acc, virtualTotal);
			// console.log("[CAL]", "virtualTotal", virtualTotal);
			// console.log("[CAL]", "newVirTotal", newVirTotal);
			changeValue(skills, 2, newVirTotal);
		}
	}
	if (u2TotalLevel.text !== "--") {
		const virtualTotal = parseInt(u2TotalLevel.text.replace(/,/g, ""));
		if (virtualTotal) {
			const newVirTotal = changes.u2.reduce((acc, curr) => curr.change + acc, virtualTotal);
			// console.log("[CAL]", "virtualTotal", virtualTotal);
			// console.log("[CAL]", "newVirTotal", newVirTotal);
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
