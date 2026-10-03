import list from '../../21-list-collocations.json';

// The collocation list as a download, at the same path as in the repo.
export const GET = () => new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
