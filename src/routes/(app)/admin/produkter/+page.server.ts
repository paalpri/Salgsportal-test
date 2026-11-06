import { asc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { product, productCategory } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	products: await db
		.select({
			id: product.id,
			name: product.name,
			slug: product.slug,
			priceNok: product.priceNok,
			priceUnit: product.priceUnit,
			orderUrl: product.orderUrl,
			isNew: product.isNew,
			active: product.active,
			categoryName: productCategory.name
		})
		.from(product)
		.leftJoin(productCategory, eq(productCategory.id, product.categoryId))
		.orderBy(asc(productCategory.sortOrder), asc(product.name))
});
