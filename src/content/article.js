import browser from 'webextension-polyfill';

async function contentLoaded() {
	await new Promise((resolve) => {
		window.addEventListener('DOMContentLoaded', () => {
			resolve();
		});
	});
}

(async function main() {
	const i = ['wideNews'];
	const items = await browser.storage.sync.get(i);
	if (!items.wideNews) return;
	if (window.location.href.endsWith('/')) return;
	browser.runtime.sendMessage({ text: 'newsCSS' });
	await contentLoaded();
	const sidebar = document.querySelector('aside.m-news-aside');
	const article = document.querySelector('.c-news-article__inner');
	if (sidebar && article) {
		article.appendChild(sidebar);
	}
	const backToTop = document.querySelector('a#article-back-to-top');
	if (backToTop) {
		sidebar.appendChild(backToTop);
		backToTop.style.marginBottom = 'unset';
	}
}());
