import list from '../../22-list-idioms.json';
import type { Example } from './data';
import { makeCourse, type Block, type ListData, type Measured } from './course';

export type Idiom = {
	n: number;
	id: string;
	romaji: string;
	polite: string | null;
	english: string;
	/** Word for word, e.g. "my ears hurt". */
	literal: string;
	/** The closest English idiom, when a natural one exists (most have none; the list is about Japanese idioms). */
	englishIdiom: string | null;
	use: string;
	ja: string;
	kana: string;
	politeJa: string | null;
	flags: string[];
	contrastGroup: string | null;
	example: Example;
	examplePolite: Example | null;
	/** Counts from 3.17M lines of film and TV subtitles; source says whether the noun + verb pair or the written phrase was counted. */
	measured: (Measured & { source: 'pairs' | 'phrase' }) | null;
	commonness: number;
	speakNeed: number;
	listLinks: string[];
	alsoIn: string[];
	notes: string | null;
};
export type ICut = {
	id: string;
	cat?: string;
	romaji: string;
	english?: string | null;
	literal?: string | null;
	count?: number | null;
	votes?: number;
	verdict?: string | null;
	reason?: string | null;
	coveredBy?: string | null;
};
export const idiomCourse = makeCourse(list as unknown as ListData<Idiom, ICut>, 'idioms');
export const idioms = idiomCourse.data;
