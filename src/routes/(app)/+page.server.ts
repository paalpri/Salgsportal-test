import { listThreads } from '#lib/server/forum.ts';
import { currentOpsNotice, publishedPosts } from '#lib/server/posts.ts';
import { listProducts } from '#lib/server/products.ts';
import { readContent } from '#lib/server/site-content.ts';
import { defaultWelcome } from '#lib/site-content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [welcome, notice, ads, updates, threads, products] = await Promise.all([
		readContent('welcome', defaultWelcome),
		currentOpsNotice(),
		publishedPosts({ kinds: ['ad'], limit: 1 }),
		publishedPosts({ kinds: ['release', 'news'], limit: 3 }),
		listThreads({ limit: 5 }),
		listProducts({ onlyNew: true, limit: 3 })
	]);
	return { welcome, notice, campaign: ads[0] ?? null, updates, threads, products };
};
