chrome.runtime.onInstalled.addListener(async (details) => {
	if (details.reason !== "install") return;
	await chrome.storage.sync.set({
		refreshPage: "none",
		rs3Virt: true,
		osrsVirt: true,
		wikiLinks: true,
		newsPin: true,
		socialNews: true,
		wideNews: true
	});
});

chrome.runtime.onMessage.addListener(async (msg, sender) => {
	if (msg.text === "newsCSS") {
		try {
			await chrome.scripting.insertCSS({
				files: ["src/content/news-article.css"],
				target: {
					tabId: sender.tab.id
				}
			});
		} catch (e) {
			console.error(e);
		}
	}
});
