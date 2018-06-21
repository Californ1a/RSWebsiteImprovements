const XP_TABLE = [{
		level: 100,
		xp: 14391160
	},
	{
		level: 101,
		xp: 15889109
	},
	{
		level: 102,
		xp: 17542976
	},
	{
		level: 103,
		xp: 19368992
	},
	{
		level: 104,
		xp: 21385073
	},
	{
		level: 105,
		xp: 23611006
	},
	{
		level: 106,
		xp: 26068632
	},
	{
		level: 107,
		xp: 28782069
	},
	{
		level: 108,
		xp: 31777943
	},
	{
		level: 109,
		xp: 35085654
	},
	{
		level: 110,
		xp: 38717661
	},
	{
		level: 111,
		xp: 42769801
	},
	{
		level: 112,
		xp: 47221641
	},
	{
		level: 113,
		xp: 52136869
	},
	{
		level: 114,
		xp: 57563718
	},
	{
		level: 115,
		xp: 63555443
	},
	{
		level: 116,
		xp: 70170840
	},
	{
		level: 117,
		xp: 77474828
	},
	{
		level: 118,
		xp: 85539082
	},
	{
		level: 119,
		xp: 94442737
	},
	{
		level: 120,
		xp: 104273167
	}
];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	let skills = document.getElementsByTagName("td");
	chrome.storage.sync.get({
		rs3Virt: false,
		osrsVirt: false
	}, (items) => {
		if (items.osrsVirt) {
			if (request.tab.url.includes("oldschool") && request.tab.url.includes("compare")) {
				OSRS(skills);
			} else if (request.tab.url.includes("oldschool") && request.tab.url.includes("hiscorepersonal")) {
				OSRSolo(skills);
			}
		} else if (items.rs3Virt) {
			RS3(skills);
		}
	});
});

chrome.storage.sync.get({
	rs3Virt: false,
	osrsVirt: false
}, (items) => {
	let skills = document.getElementsByTagName("td");
	if (skills.length > 300 && items.osrsVirt) {
		OSRS(skills);
	} else if (items.rs3Virt) {
		RS3(skills);
	}
});

function changeValue(s, i, v) {
	if (s[i].children[0].children[0]) {
		s[i].children[0].children[0].innerHTML = v.toLocaleString();
	} else {
		s[i].children[0].innerHTML = v.toLocaleString();
	}
}

function RS3Loop(skills) {
	for (let i = 2; i < skills.length; i++) {
		let level = (skills[i].children[0].children[0]) ? skills[i].children[0].children[0] : skills[i].children[0];
		if (level.text === "99") {
			let xpIndex = (i <= 83) ? i - 1 : i + 1;
			const xp = parseInt(skills[xpIndex].children[0].text.replace(/,/g, ""));
			let virtualLevel = level.text;
			for (let j = 0; j < XP_TABLE.length; j++) {
				if (xp > XP_TABLE[j].xp) {
					virtualLevel = XP_TABLE[j].level;
				}
			}
			changeValue(skills, i, virtualLevel);
		}
		if (i !== 83) {
			i = i + 2;
		}
	}
}

function RS3Total(skills) {
	let u1TotalLevel = (skills[2].children[0].children[0]) ? skills[2].children[0].children[0] : skills[2].children[0];
	let u2TotalLevel = (skills[84].children[0].children[0]) ? skills[84].children[0].children[0] : skills[84].children[0];
	let virtualTotal = 0;
	for (let i = 2; i < skills.length; i++) {
		if (i !== 2 && i !== 84) {
			let level = (skills[i].children[0].children[0]) ? skills[i].children[0].children[0] : skills[i].children[0];
			virtualTotal += parseInt(level.text);
		}
		if (i !== 83) {
			i = i + 2;
		} else if (i === 83) {
			changeValue(skills, 2, virtualTotal);
			virtualTotal = 0;
		}
		if (i > 164 && !isNaN(virtualTotal)) {
			changeValue(skills, 84, virtualTotal);
		}
	}
}

function OSLoop(skills, start, skip, iskip) {
	for (let i = start; i < skills.length; i++) {
		let level = skills[i];
		if (level.innerText === "99") {
			let xpIndex = i + 1;
			const xp = parseInt(skills[xpIndex].innerText.replace(/,/g, ""));
			let virtualLevel = level.innerText;
			for (let j = 0; j < XP_TABLE.length; j++) {
				if (xp > XP_TABLE[j].xp) {
					virtualLevel = XP_TABLE[j].level;
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
		let level = skills[i];
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

function RS3(skills) {
	RS3Loop(skills);
	skills = document.getElementsByTagName("td");
	RS3Total(skills);
}

function OSRS(skills) {
	OSLoop(skills, 30, 10, 290);
	OSLoop(skills, 36, 10, 290);
	skills = document.getElementsByTagName("td");
	OSTotal(skills, 30, 10, 290);
	OSTotal(skills, 36, 10, 290);
}

function OSRSolo(skills) {
	OSLoop(skills, 15, 4, 131);
	skills = document.getElementsByTagName("td");
	OSTotal(skills, 15, 4, 131, true);
}
