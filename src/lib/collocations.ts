import list from '../../21-list-collocations.json';
import type { Example } from './data';
import { makeCourse, type Block, type ListData, type Measured } from './course';

export type { Measured };
export type Colloc = {
	n: number;
	id: string;
	romaji: string;
	polite: string | null;
	english: string;
	use: string;
	ja: string;
	kana: string;
	politeJa: string | null;
	noun: string;
	nounJa: string;
	particle: string | null;
	verb: string;
	verbJa: string;
	verbSense: string;
	englishVerb: string | null;
	trap: string | null;
	partners: string[];
	flags: string[];
	contrastGroup: string | null;
	example: Example;
	examplePolite: Example | null;
	nounRank: number | null;
	verbRank: number | null;
	freqNote: string | null;
	commonness: number;
	trapRisk: number;
	speakNeed: number;
	listLinks: string[];
	alsoIn: string[];
	notes: string | null;
	/** Counts from 3.17M lines of film and TV subtitles; null when the pair was too rare to count. */
	measured?: Measured | null;
};
export type CBlock = Block<Colloc>;
export type CCut = {
	id: string;
	cat?: string;
	romaji: string;
	polite?: string | null;
	english?: string | null;
	count?: number | null;
	typical?: number | null;
	trap?: string | null;
	votes?: number;
	wasInList?: boolean;
	verdict?: string | null;
	reason?: string | null;
	coveredBy?: string | null;
};

export const collCourse = makeCourse(list as unknown as ListData<Colloc, CCut>, 'collocations');
export const coll = collCourse.data;
export const {
	blockById: collBlockById, stageBlocks: collStageBlocks, topics: collTopics, topicOf: collTopicOf,
	chunkSlug: collChunkSlug, chunkUrl: collChunkUrl, itemUrl: collItemUrl, stageOf: collStageOf,
	mates: collMates, listLinksOf,
} = collCourse;

// Verbs end in -u in dictionary form; anything else in the verb slot is an adjective.
export const partLabel = (item: Colloc) => (/u$/.test(item.verb) ? 'verb' : 'adjective');

// Grouped by sound, so homophones (e o kaku, ase o kaku) share a group; the header shows each spelling.
export const byVerb = collCourse.groupBy((it) => it.verb).map((g) => ({ ...g, ja: [...new Set(g.items.map((it) => it.verbJa))].join(' · ') }));
export const byEnglish = collCourse.groupBy((it) => it.englishVerb?.trim().toLowerCase() || null);
