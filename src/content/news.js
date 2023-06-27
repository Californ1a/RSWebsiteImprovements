async function contentLoaded() {
	await new Promise((resolve) => {
		window.addEventListener("DOMContentLoaded", () => {
			resolve();
		});
	});
}

function createPin(url) {
	const sidebar = document.querySelector("main aside.sidebar");
	const tabs = document.querySelector("#tabs");
	if (!sidebar || !tabs) return;
	const time = document.getElementsByTagName("time");
	const d1 = (new Date(time[0].dateTime)).getTime();
	const d2 = (new Date(time[1].dateTime)).getTime();
	if (d1 >= d2) return;
	const sheet = document.styleSheets[document.styleSheets.length - 1];
	const style = `{
			content: '📌';
			float: left;
			font-size: 13pt;
			color: transparent;
			text-shadow: 0 0 0 #e1bb34;
		}`;
	if (url.includes("news")) {
		sheet.insertRule(`#newsContent .index article:first-of-type::before ${style}`);
	} else {
		sheet.insertRule(`.index#newsSection article:first-of-type::before ${style}`);
	}
}

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

async function fetchCombinedData() {
	const url = "https://api.weirdgloop.org/runescape/social";
	const urls = [url, `${url}?page=2`];

	const promises = urls.map(async (url) => {
		try {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Error fetching ${url}: ${res.statusText}`);
			}
			return await res.json();
		} catch (error) {
			console.error(error);
			return null;
		}
	});

	const results = await Promise.allSettled(promises);
	const settledData = results.filter((result) => result.status === "fulfilled").map((result) => result.value);
	const combinedData = urls.map((url, index) => {
		const data = settledData[index];
		if (data && data.data) {
			return data.data;
		}
		return [];
	}).flat();

	// const combinedData = data.reduce((acc, cur) => {
	// 	if (cur && cur.data) {
	// 		acc.push(...cur.data);
	// 	}
	// 	return acc;
	// }, []);
	return combinedData;
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
	// const res = await fetch("https://api.weirdgloop.org/runescape/social");
	// const json = await res.json();
	const json = await fetchCombinedData();
	console.log(json);

	const div = document.createElement("div");
	div.style.maxHeight = `${remainingHeight}px`;
	div.style.overflowY = "auto";
	const ul = document.createElement("ul");
	ul.classList.add("news-list");
	div.appendChild(ul);
	wikiNews.appendChild(div);

	for (const item of json) {
		let icon = "";
		const hostname = (new URL(item.url)).hostname;
		const hostParts = hostname.split(".");
		item.source = item.source ?? hostParts[hostParts.length - 2];
		item.title = item.title ?? "-";
		if (item.source === "runescape") continue;

		if (item.icon && item.icon !== "https://twitter.com/favicon-32x32.png") {
			const s = item.source;
			icon = `<img src="${item.icon}" alt="${s[0].toUpperCase() + s.slice(1)} logo" class="news-icon">`;
		} else if (item.source === "twitter" || item.source === "nitter") {
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

(async function main() {
	const i = ["newsPin", "socialNews"];
	const items = await chrome.storage.sync.get(i);
	await contentLoaded();
	const socialNewsExists = Array.from(document.querySelectorAll("h3")).find(n => n.innerText === "Social News");
	if (items.socialNews && !socialNewsExists) {
		await createSocialNews();
	}
	if (items.newsPin) {
		createPin(window.location.href);
	}
})();
