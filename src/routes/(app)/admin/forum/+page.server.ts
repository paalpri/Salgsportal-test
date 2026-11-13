import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { crudActions } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { forumCategory, forumThread } from '#lib/server/db/schema.ts';
import { longText, text } from '#lib/server/forms.ts';
import { slugify } from '#lib/slug.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	categories: await db
		.select({
			id: forumCategory.id,
			name: forumCategory.name,
			description: forumCategory.description,
			sortOrder: forumCategory.sortOrder,
			threads: count(forumThread.id)
		})
		.from(forumCategory)
		.leftJoin(forumThread, eq(forumThread.categoryId, forumCategory.id))
		.groupBy(forumCategory.id)
		.orderBy(asc(forumCategory.sortOrder), asc(forumCategory.name))
});

const schema = z.object({
	name: text(60),
	description: longText(200),
	sortOrder: z.coerce.number().int().default(0)
});

export const actions = crudActions(forumCategory, schema, (d) => ({ ...d, slug: slugify(d.name) }));
