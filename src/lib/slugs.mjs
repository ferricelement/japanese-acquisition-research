// Short, stable URL slugs per category key (shared by astro.config.mjs and src/lib/data.ts).
export const CAT_SLUGS = {
	A: 'time', B: 'degree', C: 'stance', D: 'adjectives', E: 'connectors',
	F: 'endings', G: 'responses', H: 'verbs', I: 'patterns', J: 'pointing',
};

// Research documents rendered as pages; the other research files are linked as data.
export const RESEARCH_DOCS = [
	{ slug: '', file: '/README.md', title: 'Research overview' },
	{ slug: 'completeness-critique', file: '/02-completeness-critique.md', title: 'Completeness critique' },
	{ slug: 'input-rebalance', file: '/14-input-rebalance.md', title: 'Input rebalance' },
	{ slug: 'separation-rule', file: '/15-separation-rule.md', title: 'Separation rule' },
	{ slug: 'deck-build-note', file: '/deck-wk3-10/build-note.md', title: 'Week 3–10 deck: build note' },
];
