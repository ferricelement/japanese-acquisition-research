import core from '../../23-list-core.json';
import sets from '../../24-list-sets.json';
import phrases from '../../25-list-phrases.json';
import conjugations from '../../26-list-conjugations.json';
import type { Example } from './data';
import { makeCourse, type ListData } from './course';

// The round-7 lists (core words, word sets, set phrases, conjugations) share one entry shape and one set of routes.
export type Word = {
	n: number;
	id: string;
	romaji: string;
	polite: string | null;
	english: string;
	use: string | null;
	ja: string;
	kana: string;
	politeJa: string | null;
	pos: string;
	flags: string[];
	contrastGroup: string | null;
	example: Example;
	examplePolite: Example | null;
	/** Rank in the jiten.moe drama list, or null. */
	freqRank: number | null;
	/** Judged everyday commonness, 1-5. */
	score: number | null;
	/** Phrases: who says it (you, or people to you). */
	role?: 'say' | 'hear' | 'both';
	/** Phrases: times heard in 3.17M lines of film and TV subtitles. */
	count?: number | null;
	/** Conjugations: short name, how to form it, a table built by rule, and its share of verbs in the subtitle corpus. */
	name?: string;
	formation?: string;
	table?: { word: string; romaji: string; ja: string }[];
	measured?: { count: number; perMillion: number; shareOfHeads: number } | null;
	notes: string | null;
	listLinks: string[];
};
export type WCut = { id: string; romaji: string; ja: string; english: string | null; freqRank: number | null; score: number | null; verdict: string; reason: string | null; cat?: string };

const make = (data: unknown, section: string) => makeCourse(data as ListData<Word, WCut>, section);

export const WORDLISTS = {
	core: { course: make(core, 'core'), title: 'Core words', unit: 'words', file: '23-list-core.json' },
	sets: { course: make(sets, 'sets'), title: 'Word sets', unit: 'words', file: '24-list-sets.json' },
	phrases: { course: make(phrases, 'phrases'), title: 'Set phrases', unit: 'phrases', file: '25-list-phrases.json' },
	conjugations: { course: make(conjugations, 'conjugations'), title: 'Conjugations', unit: 'forms and patterns', file: '26-list-conjugations.json' },
} as const;
export type ListKey = keyof typeof WORDLISTS;
export const LIST_KEYS = Object.keys(WORDLISTS) as ListKey[];
