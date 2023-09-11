import browser from 'webextension-polyfill';

const WIKI_IMG = browser.runtime.getURL('assets/wiki.jpg');
const WIKI = 'http://runescape.wiki/w/Special:Search?search=';

async function contentLoaded() {
	await new Promise((resolve) => {
		window.addEventListener('DOMContentLoaded', () => {
			resolve();
		});
	});
}

function market() {
	const table = document.getElementsByTagName('table')[0];
	if (!table) return;
	const lastColCheck = document.querySelectorAll('table>:first-child>:last-child>:last-child')[0];
	if (lastColCheck.innerText === 'Wiki') return;
	const wikiHead = document.createElement('th');
	wikiHead.style.padding = '10px';
	wikiHead.appendChild(document.createTextNode('Wiki'));
	const headRow = table.children[0].children.length - 1;
	table.children[0].children[headRow].appendChild(wikiHead);

	const rows = table.children[1].children;
	for (let i = 0; i < rows.length; i += 1) {
		const itemName = rows[i].children[0].children[0].children[0].title;
		const wikiLink = WIKI + encodeURIComponent(itemName);

		const itemImg = rows[i].children[0].children[0].children[0];
		// console.log("[CAL]", wikiLink);
		const wikiNode = `<a href="${wikiLink}" target="_blank"><img src="${WIKI_IMG}" width="32px" style="border-radius:8px;" title="rsw:${itemImg.alt}" /></a>`;
		const td = document.createElement('td');
		td.innerHTML = wikiNode;
		td.style.paddingLeft = '17px';
		// if (headRow) {
		const span = rows[i].children[0].children[0].children[1];
		const page = document.querySelector('h3').innerText;
		// eslint-disable-next-line no-nested-ternary
		const width = (page === 'Search Results') ? '230px' : (page === 'Most Valuable Trades') ? '130px' : '150px';
		span.style = `white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:${width}`;
		if (span.innerText.includes('...')) {
			span.innerText = itemImg.alt;
		}
		span.title = itemImg.alt;
		// }
		td.classList.add('memberItem');
		table.children[1].children[i].appendChild(td);
	}
}

function item() {
	const head = document.getElementsByClassName('item-description')[0];
	const a = document.createElement('a');
	const name = head.children[0].innerText;
	a.href = WIKI + encodeURIComponent(name);
	a.target = '_blank';
	const wikiNode = `<img src="${WIKI_IMG}" width="32px" style="border-radius:8px;top:-8px;right:8px" title="rsw:${name}" />`;
	a.innerHTML = wikiNode;
	head.appendChild(a);
}

(async function main() {
	const i = ['wikiLinks'];
	const items = await browser.storage.sync.get(i);
	if (!items.wikiLinks) return;
	await contentLoaded();
	if (window.location.href.includes('viewitem')) {
		item();
	} else if (/results|top100|catalogue/g.test(window.location.href)) {
		market();
	}
}());
