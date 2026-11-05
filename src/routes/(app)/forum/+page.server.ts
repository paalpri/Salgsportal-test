import { asc, count, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { forumCategory, forumThread } from '#lib/server/db/schema.ts';
import { listThreads } from '#lib/server/forum.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categories = await db
		.select({
			id: forumCategory.id,
			name: forumCategory.name,
			slug: forumCategory.slug,
			description: forumCategory.description,
			threadCount: count(forumThread.id)
		})
		.from(forumCategory)
		.leftJoin(forumThread, eq(forumThread.categoryId, forumCategory.id))
		.groupBy(forumCategory.id)
		.orderBy(asc(forumCategory.sortOrder), asc(forumCategory.name));

	const active = categories.find((c) => c.slug === url.searchParams.get('kategori')) ?? null;
	const query = url.searchParams.get('q')?.trim() ?? '';
	const threads = await listThreads({ categoryId: active?.id, query: query || undefined });

	return { categories, active, query, threads };
};
