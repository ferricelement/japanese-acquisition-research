import { itemById, itemUrl as listItemUrl, stageOf as listStageOf, url } from './data';
import { chunkSlugs, collDomainOf, sectionChunkPath } from './slugs.mjs';

// The side lists (collocations, idioms) share one shape: stages of chunks, chunks of items, topics.
export type Measured = { count: number; perMillion: number; shareN?: number; shareV?: number; logDice?: number; particles?: string };
export type BaseItem = { n: number; id: string; romaji: string; english: string; contrastGroup: string | null; listLinks: string[] };
export type Block<I> = { id: string; range: string; stage: number; category: string; label: string; rationale: string; interference: string; items: I[] };
export type Stage = { name: string; summary: string; items: number; chunkIds: string[] };
export type ListData<I, C> = {
	stats: { total: number; chunks: number; candidatePool: number };
	stages: Stage[];
	categories: { key: string; name: string; scope: string; chunkIds: string[] }[];
	blocks: Block<I>[];
	cuts: C[];
};

export function makeCourse<I extends BaseItem, C>(data: ListData<I, C>, section: string) {
	const blockById = (id: string) => {
		const b = data.blocks.find((x) => x.id === id);
		if (!b) throw new Error(`no ${section} block ${id}`);
		return b;
	};
	const topics = data.categories.map((c) => ({
		...c,
		blocks: c.chunkIds.map(blockById),
		items: c.chunkIds.reduce((s, id) => s + blockById(id).items.length, 0),
	}));
	const slugs = chunkSlugs(data.blocks, collDomainOf);
	const chunkUrl = (b: Block<I>) => url(sectionChunkPath(section, b.stage, slugs[b.id]));
	const index = new Map<string, { item: I; block: Block<I> }>();
	for (const block of data.blocks) for (const item of block.items) index.set(item.id, { item, block });
	const groups = new Map<string, I[]>();
	for (const { item } of index.values()) {
		if (item.contrastGroup) groups.set(item.contrastGroup, [...(groups.get(item.contrastGroup) ?? []), item]);
	}
	const stageOf = (id: string) => index.get(id)?.block.stage ?? 0;
	return {
		data,
		section,
		blockById,
		stageBlocks: (stage: number) => data.stages[stage - 1].chunkIds.map(blockById),
		topics,
		topicOf: (b: Block<I>) => topics.find((c) => c.key === collDomainOf(b.id))!,
		chunkSlug: (b: Block<I>) => slugs[b.id],
		chunkUrl,
		itemUrl: (id: string) => {
			const hit = index.get(id);
			return hit ? `${chunkUrl(hit.block)}#${hit.item.id}` : null;
		},
		stageOf,
		/** Items learned side by side; mates in a later stage carry that stage, since the link jumps ahead. */
		mates: (item: I) =>
			(item.contrastGroup ? (groups.get(item.contrastGroup) ?? []) : [])
				.filter((m) => m.id !== item.id)
				.map((m) => ({ m, later: stageOf(m.id) > stageOf(item.id) ? stageOf(m.id) : 0 })),
		/** Versatility-list items an entry builds on, with their stage. */
		listLinksOf: (item: I) =>
			item.listLinks.flatMap((id) => {
				const hit = itemById(id);
				return hit ? [{ id, romaji: hit.item.romaji, href: listItemUrl(id)!, stage: listStageOf(id) }] : [];
			}),
		/** Items grouped by a key, biggest groups first, then alphabetically; each group in course order. */
		groupBy: (key: (it: I) => string | null) => {
			const m = new Map<string, I[]>();
			for (const { item } of index.values()) {
				const k = key(item);
				if (k) m.set(k, [...(m.get(k) ?? []), item]);
			}
			return [...m.entries()]
				.map(([k, items]) => ({ key: k, items: items.sort((a, b) => a.n - b.n) }))
				.sort((a, b) => b.items.length - a.items.length || a.key.localeCompare(b.key));
		},
	};
}
