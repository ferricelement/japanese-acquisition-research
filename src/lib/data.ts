import list from '../../20-list-versatile.json';
import { CAT_SLUGS } from './slugs.mjs';

export type Example = { romaji: string; ja: string; english: string };
export type Item = {
	n: number;
	id: string;
	romaji: string;
	polite: string | null;
	english: string;
	use: string;
	ja: string;
	kana: string;
	politeJa: string | null;
	flags: string[];
	contrastGroup: string | null;
	example: Example;
	examplePolite: Example | null;
	freqRank: number | null;
	freqNote: string | null;
	spread: number;
	reach: number;
	speakNeed: number;
	prereqs: string[];
	alsoIn: string[];
	notes: string | null;
};
export type Block = {
	id: string;
	range: string;
	stage: number;
	category: string;
	label: string;
	rationale: string;
	interference: string;
	items: Item[];
};
export type Cut = {
	id: string;
	cat: string;
	romaji: string;
	polite: string | null;
	english: string;
	freqRank: number | null;
	flags: string[] | null;
	votes: number;
	verdict: string | null;
	reason: string | null;
	coveredBy: string | null;
};

export const data = list as unknown as {
	stats: { total: number; chunks: number; byStage: Record<string, number> };
	stages: { name: string; summary: string; items: number; chunkIds: string[] }[];
	categories: { key: string; name: string; scope: string; chunkIds: string[] }[];
	blocks: Block[];
	cuts: Cut[];
};


export const categories = data.categories.map((c) => ({
	...c,
	slug: (CAT_SLUGS as Record<string, string>)[c.key],
	items: c.chunkIds.reduce((s, id) => s + blockById(id).items.length, 0),
}));

export function blockById(id: string): Block {
	const b = data.blocks.find((x) => x.id === id);
	if (!b) throw new Error(`no block ${id}`);
	return b;
}

export const categoryByName = (name: string) => categories.find((c) => c.name === name)!;
export const categoryByKey = (key: string) => categories.find((c) => c.key === key)!;

const itemIndex = new Map<string, { item: Item; block: Block }>();
for (const block of data.blocks) for (const item of block.items) itemIndex.set(item.id, { item, block });
export const itemById = (id: string) => itemIndex.get(id);

const groups = new Map<string, Item[]>();
for (const { item } of itemIndex.values()) {
	if (item.contrastGroup) groups.set(item.contrastGroup, [...(groups.get(item.contrastGroup) ?? []), item]);
}
export const groupMates = (item: Item) =>
	item.contrastGroup ? (groups.get(item.contrastGroup) ?? []).filter((m) => m.id !== item.id) : [];

/** Root-relative URL with the site base, e.g. url('stages/1/'). */
export function url(path: string) {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	return `${base}/${path.replace(/^\//, '')}`;
}

export const slugify = (s: string) =>
	s.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const anchorFor = (item: Item) => `e-${item.id.toLowerCase()}`;
export const chunkAnchor = (b: Block) => `${b.id.toLowerCase()}-${slugify(b.label)}`;
export const itemUrl = (id: string) => {
	const hit = itemById(id);
	return hit ? url(`stages/${hit.block.stage}/#${anchorFor(hit.item)}`) : null;
};

export const FLAG_LABEL: Record<string, string> = {
	'casual-only': 'casual only', rough: 'rough', masc: 'masculine', fem: 'feminine', slang: 'slang',
	dated: 'dated', kansai: 'Kansai', 'needs-negative': '+ negative', 'fixed-phrase': 'set phrase',
};
