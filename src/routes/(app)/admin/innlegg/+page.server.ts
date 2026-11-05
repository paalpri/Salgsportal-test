import { desc } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { post } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	posts: await db
		.select({
			id: post.id,
			kind: post.kind,
			title: post.title,
			slug: post.slug,
			published: post.published,
			pinned: post.pinned,
			publishedAt: post.publishedAt,
			updatedAt: post.updatedAt
		})
		.from(post)
		.orderBy(desc(post.updatedAt))
});
