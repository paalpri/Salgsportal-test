import { desc, eq, sql } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import {
	municipality,
	quoteRequest,
	quoteRequestItem,
	quoteStatus,
	user
} from '#lib/server/db/schema.ts';
import type { QuoteStatus } from '#lib/quote-status.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const param = url.searchParams.get('status');
	const status = quoteStatus.enumValues.find((s) => s === param) as QuoteStatus | undefined;

	const requests = await db
		.select({
			id: quoteRequest.id,
			status: quoteRequest.status,
			createdAt: quoteRequest.createdAt,
			municipalityName: municipality.name,
			submittedBy: user.name,
			itemCount: sql<number>`(select count(*)::int from ${quoteRequestItem} where ${quoteRequestItem.requestId} = ${quoteRequest.id})`
		})
		.from(quoteRequest)
		.innerJoin(municipality, eq(municipality.id, quoteRequest.municipalityId))
		.leftJoin(user, eq(user.id, quoteRequest.submittedById))
		.where(status ? eq(quoteRequest.status, status) : undefined)
		.orderBy(desc(quoteRequest.createdAt));

	return { requests, status: status ?? null };
};
