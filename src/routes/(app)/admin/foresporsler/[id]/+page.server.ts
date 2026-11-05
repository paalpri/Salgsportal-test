import { error } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import {
	municipality,
	quoteRequest,
	quoteRequestItem,
	quoteStatus,
	user
} from '#lib/server/db/schema.ts';
import { longText, parseForm } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const [row] = await db
		.select({
			request: quoteRequest,
			municipality,
			submittedBy: { name: user.name, email: user.email, jobTitle: user.jobTitle }
		})
		.from(quoteRequest)
		.innerJoin(municipality, eq(municipality.id, quoteRequest.municipalityId))
		.leftJoin(user, eq(user.id, quoteRequest.submittedById))
		.where(eq(quoteRequest.id, id));
	if (!row) error(404, 'Forespørselen finnes ikke');

	const items = await db
		.select()
		.from(quoteRequestItem)
		.where(eq(quoteRequestItem.requestId, id))
		.orderBy(asc(quoteRequestItem.id));
	return { ...row, items };
};

const schema = z.object({ status: z.enum(quoteStatus.enumValues), adminNote: longText(2000) });

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;
		await db
			.update(quoteRequest)
			.set(data)
			.where(eq(quoteRequest.id, Number(params.id)));
	}
};
