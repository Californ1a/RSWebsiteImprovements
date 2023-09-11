import browser from 'webextension-polyfill';

const TABLE = browser.runtime.getURL('src/XP_TABLE.json');
const changes = {
	u1: [],
	u2: [],
};
let running = false;

async function contentLoaded() {
	await new Promise((resolve) => {
		window.addEventListener('DOMContentLoaded', () => {
			resolve();
		});
	});
}

function changeValue(s, i, v) {
	if (s[i].children[0].children[0]) {
		s[i].children[0].children[0].innerHTML = v.toLocaleString();
	} else {
		s[i].children[0].innerHTML = v.toLocaleString();
	}
}

async function RS3Loop(skills) {
	const table = await fetch(TABLE);
	const XP_TABLE = await table.json();
	// console.log("[CAL]", XP_TABLE);
	for (let i = 2; i < skills.length; i += 1) {
		const children = skills[i].children[0];
		const level = (children.children[0]) ? children.children[0] : children;
		if (level.text === '99' || (level.text === '120' && (i === 83 || i === 168))) {
			const xpIndex = (i <= 86) ? i - 1 : i + 1;
			const xp = parseInt(skills[xpIndex].children[0].text.replace(/,/g, ''), 10);
			let virtualLevel = level.text;
			const type = (i === 83 || i === 168) ? 'elite' : 'standard';
			for (let j = 0; j < XP_TABLE[type].length; j += 1) {
				if (xp > XP_TABLE[type][j].xp) {
					virtualLevel = XP_TABLE[type][j].level;
				}
			}
			const change = (type === 'elite') ? virtualLevel - 120 : virtualLevel - 99;
			const user = (i > 86) ? 'u2' : 'u1';
			changes[user].push({
				index: i,
				change,
			});
			changeValue(skills, i, virtualLevel);
		}
		if (i !== 86) {
			i += 2;
		}
	}
}

function RS3Total(skills) {
	const u1Col = skills[2].children[0];
	const u2Col = skills[87].children[0];
	const u1TotalLevel = (u1Col.children[0]) ? u1Col.children[0] : u1Col;
	const u2TotalLevel = (u2Col.children[0]) ? u2Col.children[0] : u2Col;
	// console.log("[CAL]", "skills", skills);
	// console.log("[CAL]", "u1TotalLevel", u1TotalLevel.innerText);
	// console.log("[CAL]", "u2TotalLevel", u2TotalLevel.innerText);
	if (u1TotalLevel.text !== '--') {
		const virtualTotal = parseInt(u1TotalLevel.text.replace(/,/g, ''), 10);
		if (virtualTotal) {
			const newVirTotal = changes.u1.reduce((acc, curr) => curr.change + acc, virtualTotal);
			// console.log("[CAL]", "virtualTotal", virtualTotal);
			// console.log("[CAL]", "newVirTotal", newVirTotal);
			changeValue(skills, 2, newVirTotal);
		}
	}
	if (u2TotalLevel.text !== '--') {
		const virtualTotal = parseInt(u2TotalLevel.text.replace(/,/g, ''), 10);
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
	for (let i = start; i < skills.length; i += 1) {
		const level = skills[i];
		if (level.innerText === '99') {
			const xpIndex = i + 1;
			const xp = parseInt(skills[xpIndex].innerText.replace(/,/g, ''), 10);
			let virtualLevel = level.innerText;
			for (let j = 0; j < XP_TABLE.standard.length; j += 1) {
				if (xp > XP_TABLE.standard[j].xp) {
					virtualLevel = XP_TABLE.standard[j].level;
				}
			}
			level.innerHTML = virtualLevel.toLocaleString();
		}
		if (i >= iskip) {
			break;
		} else {
			i += skip;
		}
	}
}

function OSTotal(skills, start, skip, iskip, solo = false) {
	let total = 0;
	for (let i = start; i < skills.length; i += 1) {
		const level = skills[i];
		if (solo && i !== start && i < iskip) {
			total += parseInt(level.innerText, 10);
		} else if (!solo && (i !== 30 && i !== 36) && i < iskip) {
			total += parseInt(level.innerText, 10);
		}
		if (i >= iskip) {
			skills[start].innerHTML = total.toLocaleString();
			break;
		} else {
			i += skip;
		}
	}
}

async function RS3(skills) {
	if (running) {
		return;
	}
	running = true;
	await RS3Loop(skills);
	const skills2 = document.getElementsByTagName('td');
	RS3Total(skills2);
	running = false;
}

async function OSRS(skills) {
	await OSLoop(skills, 30, 10, 290);
	await OSLoop(skills, 36, 10, 290);
	const skills2 = document.getElementsByTagName('td');
	OSTotal(skills2, 30, 10, 290);
	OSTotal(skills2, 36, 10, 290);
}

async function OSRSolo(skills) {
	await OSLoop(skills, 15, 4, 131);
	const skills2 = document.getElementsByTagName('td');
	OSTotal(skills2, 15, 4, 131, true);
}

function imgErrorFunction() {
	this.src += `?${Date.now()}`;
}

function fixAvatars() {
	const avatars = document.querySelectorAll('.avatar');
	for (let i = 0; i < avatars.length; i += 1) {
		avatars[i].onerror = imgErrorFunction;
	}
}

(async function main() {
	const i = ['rs3Virt', 'osrsVirt'];
	const items = await browser.storage.sync.get(i);
	const url = window.location.href;
	await contentLoaded();
	fixAvatars();
	const skills = document.getElementsByTagName('td');
	if (items.osrsVirt && url.includes('oldschool')) {
		if (url.includes('oldschool') && url.includes('compare')) {
			OSRS(skills);
		} else if (url.includes('oldschool') && url.includes('hiscorepersonal')) {
			OSRSolo(skills);
		}
	} else if (items.rs3Virt && !url.includes('oldschool')) {
		let classCount = 0;
		for (const td of skills) {
			if (td.classList.contains('playerWinLeft') || td.classList.contains('playerWinRight')) {
				classCount += 1;
			}
		}
		if (!classCount) return;
		RS3(skills);
	}
}());
