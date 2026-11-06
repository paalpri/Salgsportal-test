import { currentUser } from '#lib/server/auth.ts';
import { listThreads } from '#lib/server/forum.ts';
import { publishedPosts } from '#lib/server/posts.ts';
import { cartProductIds, listProducts } from '#lib/server/products.ts';
import { readContent } from '#lib/server/site-content.ts';
import { defaultWelcome } from '#lib/site-content.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = currentUser(locals);
	const on = (key: (typeof locals.modules)[number]) => locals.modules.includes(key);

	const [welcome, ads, news, threads, products, inCart] = await Promise.all([
		readContent('welcome', defaultWelcome),
		on('news') ? publishedPosts({ kind: 'ad', limit: 1 }) : [],
		on('news') ? publishedPosts({ kind: 'news', limit: 4 }) : [],
		on('forum') ? listThreads({ limit: 5 }) : [],
		on('products') ? listProducts({ onlyNew: true, limit: 3 }) : [],
		on('cart') ? cartProductIds(user.municipalityId ?? null) : ([] as number[])
	]);

	return { welcome, campaign: ads[0] ?? null, news, threads, products, inCart };
};
