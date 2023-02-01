let timer;

// Saves options to chrome.storage
function saveOption(obj) {
	chrome.storage.sync.set(obj, () => {
		const status = document.getElementById("status");
		status.textContent = "Options Saved";
		if (timer) {
			clearTimeout(timer);
			status.style.animation = "none";
			status.offsetHeight;
		}
		status.style.animation = null;
		status.classList.add("fade");
		timer = setTimeout(() => {
			status.classList.remove("fade");
			status.textContent = "";
		}, 3300);
	});
}

// Restores checkbox states using the preferences stored in chrome.storage
function restoreOptions(options) {
	chrome.storage.sync.get(options, (items) => {
		for (const key in items) {
			document.getElementById(key).checked = items[key];
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	const names = ["rs3Virt", "osrsVirt", "wikiLinks", "newsPin", "socialNews"];
	const selectors = [];
	for (const name of names) {
		selectors.push(document.querySelector(`input[name=${name}]`));
	}
	const options = selectors.map(o => ({
		[o.name]: o.checked
	})).reduce((m, d) => ({
		...m,
		...d
	}));
	restoreOptions(options);
	for (const selector of selectors) {
		createListener(selector);
	}
});

function createListener(selector) {
	selector.addEventListener("change", () => {
		const obj = {};
		obj[selector.name] = selector.checked;
		saveOption(obj);
	});
}
