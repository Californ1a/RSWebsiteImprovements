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

function checkForValidUrl(tabId, changeInfo, tab) {
	if (tab.url.match(/^https?:\/\/secure.runescape.com\/m=hiscore(_oldschool)?(\/a=\d+)?(\/c=[A-z0-9*-]+)?\/(compare|hiscorepersonal)(\?(category_type=-1&)?(user1=)|\.ws)(.+)?$/gi)) {
		chrome.tabs.query({
			"active": true,
			"lastFocusedWindow": true
		}, (tabs) => {
			const msg = {
				tab: tabs[0],
				type: "hiscore"
			};
			chrome.tabs.sendMessage(tab.id, msg);
		});
	} else if (tab.url.match(/^https?:\/\/services.runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?(results|top100|catalogue).*$/gi)) {
		chrome.tabs.query({
			"active": true,
			"lastFocusedWindow": true
		}, (tabs) => {
			const msg = {
				tab: tabs[0],
				type: "market"
			};
			chrome.tabs.sendMessage(tab.id, msg);
		});
	} else if (tab.url.match(/^https?:\/\/services.runescape.com\/m=itemdb_rs\/(a=\d{1,3}\/)?.*\/viewitem.*$/gi)) {
		chrome.tabs.query({
			"active": true,
			"lastFocusedWindow": true
		}, (tabs) => {
			const msg = {
				tab: tabs[0],
				type: "item"
			};
			chrome.tabs.sendMessage(tab.id, msg);
		});
	} else if (tab.url.match(/^https?:\/\/(secure|www)\.runescape.com\/(community|m=news)?\/?(list)?$/gi)) {
		chrome.tabs.query({
			"active": true,
			"lastFocusedWindow": true
		}, (tabs) => {
			const msg = {
				tab: tabs[0],
				type: "news"
			};
			chrome.tabs.sendMessage(tab.id, msg);
		});
	}
}

chrome.tabs.onUpdated.addListener(checkForValidUrl);
