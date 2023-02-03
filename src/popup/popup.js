let timer;

// Saves options to chrome.storage
async function saveOption(obj) {
	await chrome.storage.sync.set(obj);
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
	if (obj.refreshPage) return; // Don't refresh if we're just changing the refresh option
	const items = await chrome.storage.sync.get(["refreshPage"]);
	if (!items.refreshPage || items.refreshPage === "none") return;
	if (items.refreshPage === "current") {
		const currentTabs = await chrome.tabs.query({
			active: true,
			currentWindow: true,
			url: "*://*.runescape.com/*"
		});
		if (currentTabs.length === 0) return;
		await chrome.tabs.reload(currentTabs[0].id);
	} else if (items.refreshPage === "all") {
		const tabs = await chrome.tabs.query({
			url: "*://*.runescape.com/*"
		});
		for (const tab of tabs) {
			await chrome.tabs.reload(tab.id);
		}
	}
}

// Restores checkbox states using the preferences stored in chrome.storage
async function restoreOptions(options) {
	const items = await chrome.storage.sync.get(options);
	for (const key in items) {
		const element = document.getElementById(key);
		if (!element) continue;
		if (element.type === "checkbox") {
			document.getElementById(key).checked = items[key] ?? options[key];
		} else if (element.type === "select-one") {
			document.getElementById(key).value = items[key] ?? options[key];
		}
	}
}

document.addEventListener("DOMContentLoaded", async () => {
	const checkboxSelectors = Array.from(document.querySelectorAll(".container input"))
		.filter(s => s.type === "checkbox");
	const selectSelectors = Array.from(document.querySelectorAll(".container select"))
		.filter(s => s.type === "select-one");
	const selectors = [...checkboxSelectors, ...selectSelectors];
	const options = selectors.map(o => {
		if (o.type === "checkbox") {
			return {
				[o.name]: o.checked
			};
		} else if (o.type === "select-one") {
			return {
				[o.name]: o.value
			};
		}
	}).reduce((m, d) => ({
		...m,
		...d
	}));
	await restoreOptions(options);
	for (const selector of selectors) {
		createListener(selector);
	}
});

function createListener(selector) {
	selector.addEventListener("change", async () => {
		const obj = {};
		if (selector.type === "checkbox") {
			obj[selector.name] = selector.checked;
		} else if (selector.type === "select-one") {
			obj[selector.name] = selector.value;
		}
		await saveOption(obj);
	});
}
