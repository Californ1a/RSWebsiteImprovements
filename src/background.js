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
	if (tab.url.match(/https?:\/\/services.runescape.com\/m=hiscore(_oldschool)?\/a=12\/(compare|hiscorepersonal)(\?(category_type=-1&)?(user1=)|\.ws)(.+)?/gi)) {
		chrome.tabs.query({
			"active": true,
			"lastFocusedWindow": true
		}, (tabs) => {
			let msg = {
				tab: tabs[0]
			};
			chrome.tabs.sendMessage(tab.id, msg);
		});
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);
