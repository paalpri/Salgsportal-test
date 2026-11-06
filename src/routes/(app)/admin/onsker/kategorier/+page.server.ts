import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { crudActions } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { wish, wishCategory } from '#lib/server/db/schema.ts';
import { longText, text } from '#lib/server/forms.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	categories: await db
		.select({
			id: wishCategory.id,
			name: wishCategory.name,
			description: wishCategory.description,
			sortOrder: wishCategory.sortOrder,
			wishes: count(wish.id)
		})
		.from(wishCategory)
		.leftJoin(wish, eq(wish.categoryId, wishCategory.id))
		.groupBy(wishCategory.id)
		.orderBy(asc(wishCategory.sortOrder), asc(wishCategory.name))
});

const schema = z.object({
	name: text(60),
	description: longText(200),
	sortOrder: z.coerce.number().int().default(0)
});

export const actions = crudActions(wishCategory, schema);
