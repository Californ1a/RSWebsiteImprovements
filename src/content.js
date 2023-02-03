const wiki = "http://runescape.wiki/w/Special:Search?search=";
const WIKI_IMG = chrome.runtime.getURL("assets/wiki.jpg");
const TABLE = chrome.runtime.getURL("src/XP_TABLE.json");
const urlMatchers = {
	hiscore: /^https?:\/\/secure.runescape.com\/m=hiscore(_oldschool|_seasonal|_ironman|_hardcore_ironman)?(\/a=\d+)?(\/c=[A-z0-9*-]+)?\/(compare|hiscorepersonal)(\?(category_type=-1&)?(user1=)|\.ws)(.+)?$/gi,
	market: /^https?:\/\/(services|secure).runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?(results|top100|catalogue).*$/gi,
	item: /^https?:\/\/(services|secure).runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?.*\/viewitem.*$/gi,
	article: /^https?:\/\/(secure|www)\.runescape.com\/(a=\d{1,3}\/)?(community|m=news)?\/((?!(list|archive)).)+$/gi,
	news: /^https?:\/\/(secure|www)\.runescape.com\/(a=\d{1,3}\/)?(community|m=news)?\/?(list|archive)?(.+)?$/gi
};

async function contentLoaded() {
	await new Promise((resolve) => {
		window.addEventListener("DOMContentLoaded", () => {
			resolve();
		});
	});
}

(async function main() {
	const tab = {
		url: window.location.href
	};
	let msg;

	for (const key in urlMatchers) {
		if (!tab.url.match(urlMatchers[key])) continue;
		msg = {
			type: key,
			tab
		};
		break;
	}

	if (!msg) return;

	await manageType(msg);
})();

async function manageType(request) {
	const i = ["rs3Virt", "osrsVirt", "wikiLinks", "newsPin", "socialNews", "wideNews"];
	const items = await chrome.storage.sync.get(i);

	// save the items that don't exist
	const toSave = {};
	for (const item of i) {
		if (items[item] === undefined) {
			toSave[item] = true;
			items[item] = true;
		}
	}
	if (Object.keys(toSave).length > 0) {
		await chrome.storage.sync.set(toSave);
	}

	if (request.type === "hiscore") {
		await contentLoaded();
		const skills = document.getElementsByTagName("td");
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
		if (!items.wikiLinks) return;
		await contentLoaded();
		market();
	} else if (request.type === "item") {
		if (!items.wikiLinks) return;
		await contentLoaded();
		item();
	} else if (request.type === "article") {
		if (!items.wideNews) return;
		chrome.runtime.sendMessage({ text: "newsCSS" });
		await contentLoaded();
		const sidebar = document.querySelector("aside.m-news-aside");
		const article = document.querySelector(".c-news-article__inner");
		if (sidebar && article) {
			article.appendChild(sidebar);
		}
		const backToTop = document.querySelector("a#article-back-to-top");
		if (backToTop) {
			sidebar.appendChild(backToTop);
			backToTop.style.marginBottom = "unset";
		}
	} else if (request.type === "news") {
		await contentLoaded();
		const socialNewsExists = Array.from(document.querySelectorAll("h3")).find(n => n.innerText === "Social News");
		if (items.socialNews && !socialNewsExists) {
			await createSocialNews();
		}
		if (items.newsPin) {
			createPin(request.tab.url);
		}
	}
}

function createPin(url) {
	const sidebar = document.querySelector("main aside.sidebar");
	const tabs = document.querySelector("#tabs");
	if (!sidebar || !tabs) return;
	const time = document.getElementsByTagName("time");
	const d1 = (new Date(time[0].dateTime)).getTime();
	const d2 = (new Date(time[1].dateTime)).getTime();
	if (d1 > d2) return;
	const sheet = document.styleSheets[document.styleSheets.length - 1];
	const style = `{
			content: '📌';
			float: left;
			font-size: 13pt;
			color: transparent;
			text-shadow: 0 0 0 #e1bb34;
		}`;
	if (url.includes("news")) {
		sheet.insertRule(`.index article:first-child::before ${style}`);
	} else {
		sheet.insertRule(`.index article:first-child::before ${style}`);
	}
}

async function createSocialNews() {
	const sidebar = document.querySelector("main aside.sidebar");
	const tabs = document.querySelector("#tabs");
	if (!sidebar || !tabs) return;
	const rect = tabs.getBoundingClientRect();
	let totalHeight = 30;
	for (const child of sidebar.children) {
		totalHeight += child.getBoundingClientRect().height;
	}
	if (totalHeight > rect.height) return;
	const wikiNews = document.createElement("section");
	wikiNews.classList.add("sidebar-module");
	sidebar.appendChild(wikiNews);
	const header = document.createElement("h3");
	header.innerHTML = "<a href='https://rs.wiki/RS:NEWS' target='_blank'>Social News</a>";
	wikiNews.appendChild(header);
	const remainingHeight = rect.height - totalHeight - header.getBoundingClientRect().height;
	const res = await fetch("https://api.weirdgloop.org/runescape/social");
	const json = await res.json();

	const div = document.createElement("div");
	div.style.maxHeight = `${remainingHeight}px`;
	div.style.overflowY = "auto";
	const ul = document.createElement("ul");
	ul.classList.add("news-list");
	div.appendChild(ul);
	wikiNews.appendChild(div);

	for (const item of json.data) {
		let icon = "";
		item.source = item.source ?? (new URL(item.url)).hostname.split(".")[1];
		if (item.source === "runescape") continue;

		if (item.icon) {
			const s = item.source;
			icon = `<img src="${item.icon}" alt="${s[0].toUpperCase() + s.slice(1)} logo" class="news-icon">`;
		} else if (item.source === "twitter") {
			icon = "<img src='https://runescape.wiki/images/thumb/Twitter_news_icon.svg/240px-Twitter_news_icon.svg.png' alt='Twitter logo' class='news-icon'>";
		} else if (item.source === "reddit") {
			icon = "<img src='https://runescape.wiki/images/thumb/Reddit_news_icon.svg/240px-Reddit_news_icon.svg.png' alt='Reddit logo' class='news-icon'>";
		} else if (item.source === "youtube") {
			icon = "<img src='https://www.youtube.com/s/desktop/8049ee3e/img/favicon_96x96.png' alt='Youtube logo' class='news-icon'>";
		} else if (item.source === "twitch") {
			icon = "<img src='https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' alt='Twitch logo' class='news-icon'>";
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
}

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
	const name = head.children[0].innerText;
	a.href = wiki + encodeURIComponent(name);
	a.target = "_blank";
	const wikiNode = `<img src="${WIKI_IMG}" width="32px" style="border-radius:8px;top:-8px;right:8px" title="rsw:${name}" />`;
	a.innerHTML = wikiNode;
	head.appendChild(a);
}

function market() {
	const table = document.getElementsByTagName("table")[0];
	if (!table) return;
	const lastColCheck = document.querySelectorAll("table>:first-child>:last-child>:last-child")[0];
	if (lastColCheck.innerText === "Wiki") return;
	const wikiHead = document.createElement("th");
	wikiHead.style.padding = "10px";
	wikiHead.appendChild(document.createTextNode("Wiki"));
	const headRow = table.children[0].children.length - 1;
	table.children[0].children[headRow].appendChild(wikiHead);

	const rows = table.children[1].children;
	for (let i = 0; i < rows.length; i++) {
		const itemName = rows[i].children[0].children[0].children[0].title;
		const wikiLink = wiki + encodeURIComponent(itemName);

		const itemImg = rows[i].children[0].children[0].children[0];
		// console.log("[CAL]", wikiLink);
		const wikiNode = `<a href="${wikiLink}" target="_blank"><img src="${WIKI_IMG}" width="32px" style="border-radius:8px;" title="rsw:${itemImg.alt}" /></a>`;
		const td = document.createElement("td");
		td.innerHTML = wikiNode;
		td.style.paddingLeft = "17px";
		// if (headRow) {
		const span = rows[i].children[0].children[0].children[1];
		span.style = "white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
		if (span.innerText.includes("...")) {
			span.innerText = itemImg.alt;
		}
		span.title = itemImg.alt;
		// }
		td.classList.add("memberItem");
		table.children[1].children[i].appendChild(td);
	}
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
