import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { crudActions } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { product, productCategory } from '#lib/server/db/schema.ts';
import { longText, text } from '#lib/server/forms.ts';
import { slugify } from '#lib/slug.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	categories: await db
		.select({
			id: productCategory.id,
			name: productCategory.name,
			description: productCategory.description,
			sortOrder: productCategory.sortOrder,
			products: count(product.id)
		})
		.from(productCategory)
		.leftJoin(product, eq(product.categoryId, productCategory.id))
		.groupBy(productCategory.id)
		.orderBy(asc(productCategory.sortOrder), asc(productCategory.name))
});

const schema = z.object({
	name: text(60),
	description: longText(200),
	sortOrder: z.coerce.number().int().default(0)
});

export const actions = crudActions(productCategory, schema, (d) => ({
	...d,
	slug: slugify(d.name)
}));
