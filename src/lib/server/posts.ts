import { and, desc, eq, gte, inArray } from 'drizzle-orm';
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

const OPS_NOTICE_DAYS = 14;

/** The newest driftsmelding from the last two weeks, shown as a notice on the front page. */
export async function currentOpsNotice() {
	const since = new Date(Date.now() - OPS_NOTICE_DAYS * 86_400_000);
	const [row] = await db
		.select(columns)
		.from(post)
		.where(and(eq(post.published, true), eq(post.kind, 'ops'), gte(post.publishedAt, since)))
		.orderBy(desc(post.publishedAt))
		.limit(1);
	return row ?? null;
}
