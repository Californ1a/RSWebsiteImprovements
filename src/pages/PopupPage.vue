<template>
	<CustomInput id="refreshPage"
		type="select"
		name="Auto-Refresh"
		title="Auto-refresh select RS tabs when changing any of the below options.">
		<option value="none">
			None
		</option>
		<option value="current">
			Current Tab
		</option>
		<option value="all">
			All Tabs
		</option>
	</CustomInput>
	<template v-for="(checkbox, i) in settings" :key="i">
		<CustomInput :id="checkbox.id"
			type="checkbox"
			:name="checkbox.name"
			:title="checkbox.title" />
	</template>
	<div id="status" />
</template>

<script setup>
import { onMounted } from 'vue';
import browser from 'webextension-polyfill';
import CustomInput from './components/CustomInput.vue';
import settings from '../settings.json';

onMounted(() => {
	let timer;

	// Saves options to browser.storage
	async function saveOption(obj) {
		await browser.storage.sync.set(obj);
		const status = document.getElementById('status');
		status.textContent = 'Options Saved';
		if (timer) {
			clearTimeout(timer);
			status.style.animation = 'none';
			// status.offsetHeight;
		}
		status.style.animation = null;
		status.classList.add('fade');
		timer = setTimeout(() => {
			status.classList.remove('fade');
			status.textContent = '';
		}, 3300);
		if (obj.refreshPage) return; // Don't refresh if we're just changing the refresh option
		const items = await browser.storage.sync.get(['refreshPage']);
		if (!items.refreshPage || items.refreshPage === 'none') return;
		if (items.refreshPage === 'current') {
			const currentTabs = await browser.tabs.query({
				active: true,
				currentWindow: true,
				url: '*://*.runescape.com/*',
			});
			if (currentTabs.length === 0) return;
			await browser.tabs.reload(currentTabs[0].id);
		} else if (items.refreshPage === 'all') {
			const tabs = await browser.tabs.query({
				url: '*://*.runescape.com/*',
			});
			const promises = [];
			for (const tab of tabs) {
				promises.push(browser.tabs.reload(tab.id));
			}
			await Promise.all(promises);
		}
	}

	// Restores checkbox states using the preferences stored in browser.storage
	async function restoreOptions(options) {
		const items = await browser.storage.sync.get(options);
		for (const key of Object.keys(items)) {
			const element = document.getElementById(key);
			if (!element) continue;
			if (element.type === 'checkbox') {
				document.getElementById(key).checked = items[key] ?? options[key];
			} else if (element.type === 'select-one') {
				document.getElementById(key).value = items[key] ?? options[key];
			}
		}
	}

	function createListener(selector) {
		selector.addEventListener('change', async () => {
			const obj = {};
			if (selector.type === 'checkbox') {
				obj[selector.name] = selector.checked;
			} else if (selector.type === 'select-one') {
				obj[selector.name] = selector.value;
			}
			await saveOption(obj);
		});
	}

	document.addEventListener('DOMContentLoaded', async () => {
		const checkboxSelectors = Array.from(document.querySelectorAll('.container input'))
			.filter(s => s.type === 'checkbox');
		const selectSelectors = Array.from(document.querySelectorAll('.container select'))
			.filter(s => s.type === 'select-one');
		const selectors = [...checkboxSelectors, ...selectSelectors];
		const options = selectors.map((o) => {
			if (o.type === 'checkbox') {
				return {
					[o.name]: o.checked,
				};
			}
			if (o.type === 'select-one') {
				return {
					[o.name]: o.value,
				};
			}
			return {};
		}).reduce((m, d) => ({
			...m,
			...d,
		}));
		await restoreOptions(options);
		for (const selector of selectors) {
			createListener(selector);
		}
	});
});
</script>

<style>
body {
	width: 180px;
	user-select: none;
	overflow: hidden;
}

#status {
	text-align: right;
	width: 55%;
	float: right;
	margin-right: 5px;
	margin-top: 5px;
	margin-bottom: 5px;
}

#status.fade {
	animation: fadeOut 2s forwards;
	animation-delay: 2s;
}

@keyframes fadeOut {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}

label.select {
	display: flex;
	flex-direction: row-reverse;
	white-space: nowrap;
	align-items: center;
	justify-content: center;
}

.label.select {
	padding-left: 5px;
}

select {
	background: transparent;
	color: #000;
	font-size: 12px;
	padding: 0;
}
</style>
