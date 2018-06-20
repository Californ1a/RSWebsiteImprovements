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
	if (request.url.includes("oldschool")) {
		OSRS(skills);
	} else {
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
			for (let j = 1; j < XP_TABLE.length; j++) {
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
		if (i > 164) {
			changeValue(skills, 84, virtualTotal);
		}
	}
}

function OSLoop(skills, start) {
	for (let i = start; i < skills.length; i++) {
		let level = skills[i];
		if (level.innerText === "99") {
			let xpIndex = i + 1;
			const xp = parseInt(skills[xpIndex].innerText.replace(/,/g, ""));
			let virtualLevel = level.innerText;
			for (let j = 1; j < XP_TABLE.length; j++) {
				if (xp > XP_TABLE[j].xp) {
					virtualLevel = XP_TABLE[j].level;
				}
			}
			level.innerHTML = virtualLevel.toLocaleString();
		}
		if (i >= 290) {
			break;
		} else {
			i = i + 10;
		}
	}
}

function OSTotal(skills, start) {
	let total = 0;
	for (let i = start; i < skills.length; i++) {
		let level = skills[i];
		if (i !== 30 && i !== 36 && i < 290) {
			total += parseInt(level.innerText);
		}
		if (i >= 290) {
			skills[start].innerHTML = total.toLocaleString();
			break;
		} else {
			i = i + 10;
		}
	}
}

function RS3(skills) {
	RS3Loop(skills);
	skills = document.getElementsByTagName("td");
	RS3Total(skills);
}

function OSRS(skills) {
	OSLoop(skills, 30);
	OSLoop(skills, 36);
	skills = document.getElementsByTagName("td");
	OSTotal(skills, 30);
	OSTotal(skills, 36);
}
