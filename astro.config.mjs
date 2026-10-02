// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { RESEARCH_DOCS, catSlug, chunkPath, chunkSlugs } from './src/lib/slugs.mjs';

const list = JSON.parse(readFileSync(new URL('./20-list-versatile.json', import.meta.url), 'utf8'));
/** @type {Record<string, { label: string }>} */
const blocks = Object.fromEntries(list.blocks.map((/** @type {{ id: string }} */ b) => [b.id, b]));
const slugs = chunkSlugs(list.blocks);

/**
 * Research markdown keeps its own `#` titles for GitHub; on the site the page title is the h1,
 * so shift those files' headings down one level.
 */
function demoteResearchHeadings() {
	return (/** @type {any} */ tree, /** @type {any} */ file) => {
		const path = file.path ?? file.history?.[0] ?? '';
		if (!path.endsWith('.md') || path.includes('/src/')) return;
		const walk = (/** @type {any} */ node) => {
			if (node.type === 'heading') node.depth = Math.min(node.depth + 1, 6);
			node.children?.forEach(walk);
		};
		walk(tree);
	};
}

export default defineConfig({
	site: 'https://ferricelement.github.io',
	base: '/japanese-acquisition-research',
	markdown: { remarkPlugins: [demoteResearchHeadings] },
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
				{ label: 'Home', link: '/' },
				// Each stage is a group: its overview, then one page per chunk in course order.
				...list.stages.map((/** @type {{ name: string, chunkIds: string[] }} */ s, /** @type {number} */ i) => ({
					label: s.name,
					collapsed: true,
					items: [
						// Pagination reads these labels, so the overview names its stage ("Next: Stage 2 overview").
						{ label: `${s.name} overview`, link: `/stages/${i + 1}/` },
						...s.chunkIds.map((id) => ({ label: blocks[id].label, link: chunkPath(i + 1, slugs[id]) })),
					],
				})),
				{
					label: 'Categories',
					collapsed: true,
					items: list.categories.map((/** @type {{ key: string, name: string }} */ c) => ({ label: c.name, link: `/categories/${catSlug(c.key)}/` })),
				},
				{
					label: 'Cuts',
					collapsed: true,
					items: [
						{ label: 'All cuts', link: '/cuts/' },
						...list.categories.map((/** @type {{ key: string, name: string }} */ c) => ({ label: c.name, link: `/cuts/${catSlug(c.key)}/` })),
					],
				},
				{
					label: 'Research',
					collapsed: true,
					items: RESEARCH_DOCS.map((d) => ({ label: d.title, link: d.slug ? `/research/${d.slug}/` : '/research/' })),
				},
			],
		}),
	],
});
