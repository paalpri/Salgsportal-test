import { publishedPosts } from '#lib/server/posts.ts';
import { readContent } from '#lib/server/site-content.ts';
import { defaultWelcome } from '#lib/site-content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [welcome, ads] = await Promise.all([
		readContent('welcome', defaultWelcome),
		publishedPosts({ kinds: ['ad'], limit: 1 })
	]);
	return { welcome, campaign: ads[0] ?? null };
};
