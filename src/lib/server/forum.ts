import { and, desc, eq, ilike, isNotNull, or, sql, type SQL } from 'drizzle-orm';
import { db } from './db/index.ts';
import { forumCategory, forumReply, forumThread, municipality, user } from './db/schema.ts';

export async function listThreads({
	categoryId,
	query,
	limit = 50
}: { categoryId?: number; query?: string; limit?: number } = {}) {
	const filters: SQL[] = [];
	if (categoryId) filters.push(eq(forumThread.categoryId, categoryId));
	if (query) {
		const pattern = `%${query.replace(/[%_\\]/g, '\\$&')}%`;
		filters.push(or(ilike(forumThread.title, pattern), ilike(forumThread.body, pattern))!);
	}

	return db
		.select({
			id: forumThread.id,
			title: forumThread.title,
			pinned: forumThread.pinned,
			locked: forumThread.locked,
			solved: isNotNull(forumThread.acceptedReplyId),
			createdAt: forumThread.createdAt,
			lastActivityAt: forumThread.lastActivityAt,
			category: { name: forumCategory.name, slug: forumCategory.slug },
			authorName: user.name,
			municipalityName: municipality.name,
			replyCount: sql<number>`(select count(*)::int from ${forumReply} where ${forumReply.threadId} = ${forumThread.id})`
		})
		.from(forumThread)
		.innerJoin(forumCategory, eq(forumCategory.id, forumThread.categoryId))
		.leftJoin(user, eq(user.id, forumThread.authorId))
		.leftJoin(municipality, eq(municipality.id, user.municipalityId))
		.where(and(...filters))
		.orderBy(desc(forumThread.pinned), desc(forumThread.lastActivityAt))
		.limit(limit);
}

export type ThreadListItem = Awaited<ReturnType<typeof listThreads>>[number];
