import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from './db/index.ts';
import { post } from './db/schema.ts';
import type { PostKind } from '#lib/post-kinds.ts';

const columns = {
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
};

export function publishedPosts({ kinds, limit = 50 }: { kinds?: PostKind[]; limit?: number } = {}) {
	return db
		.select(columns)
		.from(post)
		.where(and(eq(post.published, true), kinds ? inArray(post.kind, kinds) : undefined))
		.orderBy(desc(post.pinned), desc(post.publishedAt))
		.limit(limit);
}
