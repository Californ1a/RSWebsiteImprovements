chrome.browserAction.onClicked.addListener(tab => {
	chrome.tabs.query({
		'active': true,
		'lastFocusedWindow': true
	}, function(tabs) {
		let msg = {
			text: "hello",
			url: tabs[0].url
		};
		chrome.tabs.sendMessage(tab.id, msg);
	});
});
