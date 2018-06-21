let timer;

// Saves options to chrome.storage
function saveOption(obj) {
	chrome.storage.sync.set(obj, () => {
		let status = document.getElementById("status");
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
		for (key in items) {
			document.getElementById(key).checked = items[key];
		}
	});
}

document.addEventListener("DOMContentLoaded", () => {
	let names = ["rs3Virt", "osrsVirt"];
	let selectors = [];
	for (name of names) {
		selectors.push(document.querySelector(`input[name=${name}]`))
	}
	let options = selectors.map(o => ({
		[o.name]: o.checked
	})).reduce((m, d) => ({ ...m,
		...d
	}));
	restoreOptions(options);
	for (selector of selectors) {
		createListener(selector);
	}
});

function createListener(selector) {
	selector.addEventListener("change", (event) => {
		let obj = {}
		obj[selector.name] = selector.checked;
		saveOption(obj);
	});
}
