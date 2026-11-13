import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { product, productCategory } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const isAdmin = locals.user?.role === 'admin';
	const [row] = await db
		.select({ product, category: productCategory })
		.from(product)
		.leftJoin(productCategory, eq(productCategory.id, product.categoryId))
		.where(eq(product.slug, params.slug));
	if (!row || (!row.product.active && !isAdmin)) error(404, 'Produktet finnes ikke');
	return row;
};
