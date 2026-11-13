import { publishedPosts } from '#lib/server/posts.ts';
import { listProducts } from '#lib/server/products.ts';
import { readContent } from '#lib/server/site-content.ts';
import { defaultWelcome } from '#lib/site-content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [welcome, ads, updates, products] = await Promise.all([
		readContent('welcome', defaultWelcome),
		publishedPosts({ kinds: ['ad'], limit: 1 }),
		publishedPosts({ kinds: ['release', 'news'], limit: 3 }),
		listProducts({ onlyNew: true, limit: 3 })
	]);
	return { welcome, campaign: ads[0] ?? null, updates, products };
};
