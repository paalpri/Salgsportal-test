import { fail } from '@sveltejs/kit';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { municipality, wish, wishCategory } from '#lib/server/db/schema.ts';
import { optionalInt, parseForm, text } from '#lib/server/forms.ts';
import { listWishCategories } from '#lib/server/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [categories, municipalities] = await Promise.all([
		listWishCategories(),
		db
			.select({ id: municipality.id, name: municipality.name })
			.from(municipality)
			.orderBy(asc(municipality.name))
	]);
	return { categories, municipalities };
};

const schema = z.object({
	title: text(150),
	description: text(5000),
	categoryId: optionalInt,
	municipalityId: optionalInt
});

const exists = async (table: typeof wishCategory | typeof municipality, id: number | null) =>
	!id || (await db.select({ id: table.id }).from(table).where(eq(table.id, id))).length > 0;

export const actions: Actions = {
	create: async ({ request }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const categoryId = data.categoryId || null;
		const municipalityId = data.municipalityId || null;
		if (!(await exists(wishCategory, categoryId))) return fail(400, { message: 'Ukjent kategori' });
		if (!(await exists(municipality, municipalityId)))
			return fail(400, { message: 'Ukjent kommune' });

		await db.insert(wish).values({
			title: data.title,
			description: data.description,
			categoryId,
			municipalityId
		});
	}
};
