import list from '../../22-list-idioms.json';

// The idiom list as a download, at the same path as in the repo.
export const GET = () => new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } });
