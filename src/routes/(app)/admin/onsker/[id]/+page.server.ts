import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '#lib/server/db/index.ts';
import { municipality, user, wish, wishStatus } from '#lib/server/db/schema.ts';
import { longText, optionalInt, parseForm } from '#lib/server/forms.ts';
import { listWishCategories } from '#lib/server/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const [row] = await db
		.select({
			wish,
			author: { name: user.name, email: user.email, jobTitle: user.jobTitle },
			municipalityName: municipality.name
		})
		.from(wish)
		.leftJoin(user, eq(user.id, wish.authorId))
		.leftJoin(municipality, eq(municipality.id, wish.municipalityId))
		.where(eq(wish.id, Number(params.id)));
	if (!row) error(404, 'Ønsket finnes ikke');
	return { ...row, categories: await listWishCategories() };
};

const schema = z.object({
	status: z.enum(wishStatus.enumValues),
	categoryId: optionalInt,
	adminNote: longText(2000)
});

export const actions: Actions = {
	save: async ({ request, params }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;
		await db
			.update(wish)
			.set({ ...data, categoryId: data.categoryId || null })
			.where(eq(wish.id, Number(params.id)));
	},
	delete: async ({ params }) => {
		await db.delete(wish).where(eq(wish.id, Number(params.id)));
		redirect(303, '/admin/onsker');
	}
};
