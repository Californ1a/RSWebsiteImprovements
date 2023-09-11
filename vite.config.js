import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';

function generateManifest() {
	const manifest = readJsonFile('src/manifest.json');
	const pkg = readJsonFile('package.json');
	return {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		...manifest,
	};
}

const target = process.env.TARGET_BROWSER || 'chrome';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		webExtension({
			manifest: generateManifest,
			watchFilePaths: ['package.json', 'src/manifest.json'],
			browser: target,
		}),
	],
	build: {
		sourcemap: true,
	},
	define: {
		__BROWSER__: JSON.stringify(target),
	},
});
