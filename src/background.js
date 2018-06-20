chrome.browserAction.onClicked.addListener(tab => {
	chrome.tabs.query({
		"active": true,
		"lastFocusedWindow": true
	}, (tabs) => {
		let msg = {
			url: tabs[0].url
		};
		chrome.tabs.sendMessage(tab.id, msg);
	});
});

// function checkForValidUrl(tabId, changeInfo, tab) {
// 	if (tab.url.match(/https?:\/\/services.runescape.com\/m=hiscore(_oldschool)?\/a=12\/compare(\?user1=|\.ws)/gi)) {
// 		chrome.pageAction.show(tabId);
// 	}
// };
//
// chrome.tabs.onUpdated.addListener(checkForValidUrl);
