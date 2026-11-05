import { publishedPosts } from '#lib/server/posts.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const type = url.searchParams.get('type');
	const kind = type === 'news' || type === 'ad' ? type : undefined;
	return { kind: kind ?? 'all', posts: await publishedPosts({ kind }) };
};
