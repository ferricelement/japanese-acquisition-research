import { LIST_KEYS, WORDLISTS } from '../lib/wordlists';

// The round-7 lists as downloads, at the same paths as in the repo.
export function getStaticPaths() {
	return LIST_KEYS.map((k) => ({ params: { name: WORDLISTS[k].file.replace(/\.json$/, '') }, props: { data: WORDLISTS[k].course.data } }));
}
export const GET = ({ props }: { props: { data: unknown } }) =>
	new Response(JSON.stringify(props.data), { headers: { 'Content-Type': 'application/json' } });
