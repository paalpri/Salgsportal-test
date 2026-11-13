import { asc } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { productCategory } from '#lib/server/db/schema.ts';
import { listProducts } from '#lib/server/products.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categories = await db
		.select({ id: productCategory.id, name: productCategory.name, slug: productCategory.slug })
		.from(productCategory)
		.orderBy(asc(productCategory.sortOrder), asc(productCategory.name));
	const active = categories.find((c) => c.slug === url.searchParams.get('kategori')) ?? null;
	const query = url.searchParams.get('q')?.trim() ?? '';
	const onlyNew = url.searchParams.has('nyheter');

	const products = await listProducts({
		categoryId: active?.id,
		query: query || undefined,
		onlyNew
	});
	return { categories, active, query, onlyNew, products };
};
