import browser from 'webextension-polyfill';
import settings from './settings.json';

browser.runtime.onInstalled.addListener(async (details) => {
	if (details.reason !== 'install') return;
	const defaults = settings.reduce((acc, cur) => {
		acc[cur.id] = true;
		return acc;
	}, {});
	await browser.storage.sync.set({
		refreshPage: 'none',
		...defaults,
	});
});

browser.runtime.onMessage.addListener(async (msg, sender) => {
	if (msg.text === 'newsCSS') {
		try {
			const offset = (__BROWSER__ === 'chrome') ? '.' : '..';
			await browser.scripting.insertCSS({
				files: [`${offset}/news-article.css`],
				target: {
					tabId: sender.tab.id,
				},
			});
		} catch (e) {
			console.error(e);
		}
	}
});
