import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { crudActions } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { municipality, user } from '#lib/server/db/schema.ts';
import { optionalText, text } from '#lib/server/forms.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	municipalities: await db
		.select({
			id: municipality.id,
			name: municipality.name,
			number: municipality.number,
			county: municipality.county,
			emailDomain: municipality.emailDomain,
			users: count(user.id)
		})
		.from(municipality)
		.leftJoin(user, eq(user.municipalityId, municipality.id))
		.groupBy(municipality.id)
		.orderBy(asc(municipality.name))
});

const schema = z.object({
	name: text(100),
	number: optionalText(4),
	county: optionalText(100),
	emailDomain: optionalText(100).transform((v) => v?.replace(/^@/, '').toLowerCase() ?? null)
});

export const actions = crudActions(municipality, schema);
