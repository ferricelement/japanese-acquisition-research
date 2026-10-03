// Shared by astro.config.mjs (sidebar) and src/lib/data.ts (pages), so URLs match.

// Short, stable URL slugs per category key.
export const CAT_SLUGS = {
	A: 'time', B: 'degree', C: 'stance', D: 'adjectives', E: 'connectors',
	F: 'endings', G: 'responses', H: 'verbs', I: 'patterns', J: 'pointing',
};

/** URL slug for a category key, e.g. 'A' -> 'time'. */
export const catSlug = (/** @type {string} */ key) => CAT_SLUGS[/** @type {keyof typeof CAT_SLUGS} */ (key)];

/** Root-relative path (no base) of a chunk page. */
export const chunkPath = (/** @type {number} */ stage, /** @type {string} */ slug) => `/stages/${stage}/${slug}/`;

/** Topic of a collocation or idiom chunk id, e.g. 'time-money-2' -> 'time-money'. */
export const collDomainOf = (/** @type {string} */ id) => id.replace(/-\d+$/, '');

/** Root-relative path (no base) of a chunk page in a side list, e.g. sectionChunkPath('idioms', 1, 'anger'). */
export const sectionChunkPath = (/** @type {string} */ section, /** @type {number} */ stage, /** @type {string} */ slug) =>
	`/${section}/${stage}/${slug}/`;

export const slugify = (/** @type {string} */ s) =>
	s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * URL slug per chunk id: its label, plus the category slug when two chunks share a label.
 * Collocation chunk ids are "<domain>-<n>", so their suffix is the domain.
 * @param {{ id: string, label: string }[]} blocks
 * @param {(id: string) => string} [catOf]
 * @returns {Record<string, string>}
 */
export function chunkSlugs(blocks, catOf = (id) => catSlug(id[0])) {
	const counts = {};
	for (const b of blocks) counts[slugify(b.label)] = (counts[slugify(b.label)] ?? 0) + 1;
	const out = {};
	for (const b of blocks) {
		const s = slugify(b.label);
		out[b.id] = counts[s] > 1 ? `${s}-${catOf(b.id)}` : s;
	}
	if (new Set(Object.values(out)).size !== blocks.length) throw new Error('chunk slugs are not unique');
	return out;
}

// Research documents rendered as pages; the other research files are linked as data.
export const RESEARCH_DOCS = [
	{ slug: '', file: '/README.md', title: 'Research overview' },
	{ slug: 'completeness-critique', file: '/02-completeness-critique.md', title: 'Completeness critique' },
	{ slug: 'input-rebalance', file: '/14-input-rebalance.md', title: 'Input rebalance' },
	{ slug: 'separation-rule', file: '/15-separation-rule.md', title: 'Separation rule' },
	{ slug: 'deck-build-note', file: '/deck-wk3-10/build-note.md', title: 'Week 3–10 deck: build note' },
];
