import { and, desc, eq } from 'drizzle-orm';
import { db } from './db/index.ts';
import { post } from './db/schema.ts';

export function publishedPosts({
	kind,
	limit = 50
}: { kind?: 'news' | 'ad'; limit?: number } = {}) {
	return db
		.select({
			id: post.id,
			slug: post.slug,
			kind: post.kind,
			title: post.title,
			excerpt: post.excerpt,
			imageUrl: post.imageUrl,
			ctaLabel: post.ctaLabel,
			ctaUrl: post.ctaUrl,
			pinned: post.pinned,
			publishedAt: post.publishedAt
		})
		.from(post)
		.where(and(eq(post.published, true), kind ? eq(post.kind, kind) : undefined))
		.orderBy(desc(post.pinned), desc(post.publishedAt))
		.limit(limit);
}
