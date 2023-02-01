// chrome.browserAction.onClicked.addListener(tab => {
// 	chrome.tabs.query({
// 		"active": true,
// 		"lastFocusedWindow": true
// 	}, (tabs) => {
// 		let msg = {
// 			url: tabs[0].url
// 		};
// 		chrome.tabs.sendMessage(tab.id, msg);
// 	});
// });

async function checkForValidUrl(tabId, changeInfo, tab) {
	try {
		if (tab.url.match(/^https?:\/\/secure.runescape.com\/m=hiscore(_oldschool)?(\/a=\d+)?(\/c=[A-z0-9*-]+)?\/(compare|hiscorepersonal)(\?(category_type=-1&)?(user1=)|\.ws)(.+)?$/gi)) {
			const tabs = await chrome.tabs.query({
				"active": true,
				"lastFocusedWindow": true
			});
			const msg = {
				tab: tabs[0],
				type: "hiscore"
			};
			await chrome.tabs.sendMessage(tab.id, msg);
		} else if (tab.url.match(/^https?:\/\/(services|secure).runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?(results|top100|catalogue).*$/gi)) {
			const tabs = await chrome.tabs.query({
				"active": true,
				"lastFocusedWindow": true
			});
			const msg = {
				tab: tabs[0],
				type: "market"
			};
			await chrome.tabs.sendMessage(tab.id, msg);
		} else if (tab.url.match(/^https?:\/\/(services|secure).runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?.*\/viewitem.*$/gi)) {
			const tabs = await chrome.tabs.query({
				"active": true,
				"lastFocusedWindow": true
			});
			const msg = {
				tab: tabs[0],
				type: "item"
			};
			await chrome.tabs.sendMessage(tab.id, msg);
		} else if (tab.url.match(/^https?:\/\/(secure|www)\.runescape.com\/(a=\d{1,3}\/)?(community|m=news)?\/?(list)?$/gi)) {
			const tabs = await chrome.tabs.query({
				"active": true,
				"lastFocusedWindow": true
			});
			const msg = {
				tab: tabs[0],
				type: "news"
			};
			await chrome.tabs.sendMessage(tab.id, msg);
		}
	} catch (e) {
		console.log(e);
	}
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
