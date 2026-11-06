import { error, fail } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { wish, wishCategory } from '#lib/server/db/schema.ts';
import { optionalInt, parseForm, text } from '#lib/server/forms.ts';
import { listWishCategories } from '#lib/server/wishes.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const me = currentUser(locals);
	const [wishes, categories] = await Promise.all([
		db
			.select({
				id: wish.id,
				title: wish.title,
				description: wish.description,
				status: wish.status,
				adminNote: wish.adminNote,
				createdAt: wish.createdAt,
				categoryName: wishCategory.name
			})
			.from(wish)
			.leftJoin(wishCategory, eq(wishCategory.id, wish.categoryId))
			.where(eq(wish.authorId, me.id))
			.orderBy(desc(wish.createdAt)),
		listWishCategories()
	]);
	return { wishes, categories };
};

const schema = z.object({
	title: text(150),
	description: text(5000),
	categoryId: optionalInt
});

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const me = currentUser(locals);
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const categoryId = data.categoryId || null;
		if (categoryId) {
			const [found] = await db
				.select({ id: wishCategory.id })
				.from(wishCategory)
				.where(eq(wishCategory.id, categoryId));
			if (!found) return fail(400, { message: 'Ukjent kategori' });
		}
		await db.insert(wish).values({
			title: data.title,
			description: data.description,
			categoryId,
			authorId: me.id,
			municipalityId: me.municipalityId ?? null
		});
	},

	withdraw: async ({ request, locals }) => {
		const me = currentUser(locals);
		const id = Number((await request.formData()).get('id'));
		const [own] = await db
			.select({ status: wish.status })
			.from(wish)
			.where(and(eq(wish.id, id), eq(wish.authorId, me.id)));
		if (!own) error(404, 'Ønsket finnes ikke');
		if (own.status !== 'new')
			return fail(400, { message: 'Ønsket er allerede under behandling og kan ikke trekkes' });
		await db.delete(wish).where(eq(wish.id, id));
	}
};
