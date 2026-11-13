import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { crudActions } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { municipality, wish } from '#lib/server/db/schema.ts';
import { optionalText, text } from '#lib/server/forms.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	municipalities: await db
		.select({
			id: municipality.id,
			name: municipality.name,
			number: municipality.number,
			county: municipality.county,
			wishes: count(wish.id)
		})
		.from(municipality)
		.leftJoin(wish, eq(wish.municipalityId, municipality.id))
		.groupBy(municipality.id)
		.orderBy(asc(municipality.name))
});

const schema = z.object({
	name: text(100),
	number: optionalText(4),
	county: optionalText(100)
});

export const actions = crudActions(municipality, schema);
