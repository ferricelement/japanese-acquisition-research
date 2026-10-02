// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { CAT_SLUGS, RESEARCH_DOCS } from './src/lib/slugs.mjs';

const list = JSON.parse(readFileSync(new URL('./20-list-versatile.json', import.meta.url), 'utf8'));

export default defineConfig({
	site: 'https://ferricelement.github.io',
	base: '/japanese-acquisition-research',
	integrations: [
		starlight({
			title: 'Japanese Versatility List',
			description: `${list.stats.total} high-versatility Japanese words, endings and patterns, casual first with the polite form beside it.`,
			favicon: '/favicon.svg',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ferricelement/japanese-acquisition-research' }],
			customCss: [
				'@fontsource/atkinson-hyperlegible/400.css',
				'@fontsource/atkinson-hyperlegible/700.css',
				'./src/styles/custom.css',
			],
			sidebar: [
				{ label: 'Overview', link: '/' },
				{
					label: 'Stages',
					items: list.stages.map((/** @type {{name: string}} */ s, /** @type {number} */ i) => ({ label: s.name, link: `/stages/${i + 1}/` })),
				},
				{
					label: 'Categories',
					items: list.categories.map((/** @type {{key: string, name: string}} */ c) => ({
						label: c.name,
						link: `/categories/${CAT_SLUGS[/** @type {keyof typeof CAT_SLUGS} */ (c.key)]}/`,
					})),
				},
				{ label: 'Cuts', link: '/cuts/' },
				{
					label: 'Research',
					collapsed: true,
					items: RESEARCH_DOCS.map((d) => ({ label: d.title, link: d.slug ? `/research/${d.slug}/` : '/research/' })),
				},
			],
		}),
	],
});
