chrome.runtime.onInstalled.addListener(async (details) => {
	if (details.reason !== "install") return;
	await chrome.storage.sync.set({
		rs3Virt: true,
		osrsVirt: true,
		wikiLinks: true,
		newsPin: true,
		socialNews: true
	});
});
