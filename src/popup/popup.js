// Saves options to chrome.storage
function saveOptions() {
	let rs3Virt = document.getElementById("rs3Virt").checked;
	let osrsVirt = document.getElementById("osrsVirt").checked;
	chrome.storage.sync.set({
		rs3Virt,
		osrsVirt
	}, () => {
		// Update status to let user know options were saved.
		let status = document.getElementById("status");
		status.textContent = "Options saved.";
		setTimeout(() => {
			status.textContent = "";
		}, 750);
	});
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
	// Use default value color = 'red' and likesColor = true.
	chrome.storage.sync.get({
		rs3Virt: false,
		osrsVirt: false
	}, (items) => {
		document.getElementById("rs3Virt").checked = items.rs3Virt;
		document.getElementById("osrsVirt").checked = items.osrsVirt;
	});
}

document.addEventListener("DOMContentLoaded", () => {
	// restoreOptions();
	let selectors = ["rs3Virt", "osrsVirt"];
	for (selector of selectors) {
		createListener(document.querySelector(`input[name=${selector}]`));
	}
});
// document.getElementById("save").addEventListener("click", saveOptions);
let timer;

function createListener(selector) {
	selector.addEventListener("change", (event) => {
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
