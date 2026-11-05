import { currentUser } from '#lib/server/auth.ts';
import { listThreads } from '#lib/server/forum.ts';
import { publishedPosts } from '#lib/server/posts.ts';
import { cartProductIds, listProducts } from '#lib/server/products.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = currentUser(locals);
	const on = (key: (typeof locals.modules)[number]) => locals.modules.includes(key);

	const [ads, news, threads, products, inCart] = await Promise.all([
		on('news') ? publishedPosts({ kind: 'ad', limit: 3 }) : [],
		on('news') ? publishedPosts({ kind: 'news', limit: 3 }) : [],
		on('forum') ? listThreads({ limit: 5 }) : [],
		on('products') ? listProducts({ onlyNew: true, limit: 3 }) : [],
		on('cart') ? cartProductIds(user.municipalityId ?? null) : ([] as number[])
	]);

	return { ads, news, threads, products, inCart };
};
