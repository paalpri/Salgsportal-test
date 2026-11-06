import { count, desc, eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { db } from '#lib/server/db/index.ts';
import { forumThread, municipality, post, product, user, wish } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

const countRows = (table: PgTable) =>
	db
		.select({ n: count() })
		.from(table)
		.then(([row]) => row.n);

export const load: PageServerLoad = async () => {
	const [users, municipalities, threads, products, posts, [newWishes], recent] = await Promise.all([
		countRows(user),
		countRows(municipality),
		countRows(forumThread),
		countRows(product),
		countRows(post),
		db.select({ n: count() }).from(wish).where(eq(wish.status, 'new')),
		db
			.select({
				id: wish.id,
				title: wish.title,
				status: wish.status,
				createdAt: wish.createdAt,
				municipalityName: municipality.name
			})
			.from(wish)
			.leftJoin(municipality, eq(municipality.id, wish.municipalityId))
			.orderBy(desc(wish.createdAt))
			.limit(5)
	]);

	return {
		stats: { users, municipalities, threads, products, posts, newWishes: newWishes.n },
		recent
	};
};
