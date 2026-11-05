import { count, desc, eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { db } from '#lib/server/db/index.ts';
import {
	forumThread,
	municipality,
	post,
	product,
	quoteRequest,
	user
} from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

const countRows = (table: PgTable) =>
	db
		.select({ n: count() })
		.from(table)
		.then(([row]) => row.n);

export const load: PageServerLoad = async () => {
	const [users, municipalities, threads, products, posts, [newRequests], recent] =
		await Promise.all([
			countRows(user),
			countRows(municipality),
			countRows(forumThread),
			countRows(product),
			countRows(post),
			db.select({ n: count() }).from(quoteRequest).where(eq(quoteRequest.status, 'new')),
			db
				.select({
					id: quoteRequest.id,
					status: quoteRequest.status,
					createdAt: quoteRequest.createdAt,
					municipalityName: municipality.name
				})
				.from(quoteRequest)
				.innerJoin(municipality, eq(municipality.id, quoteRequest.municipalityId))
				.orderBy(desc(quoteRequest.createdAt))
				.limit(5)
		]);

	return {
		stats: { users, municipalities, threads, products, posts, newRequests: newRequests.n },
		recent
	};
};
