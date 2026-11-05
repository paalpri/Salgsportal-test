import { redirect } from '@sveltejs/kit';
import { asc } from 'drizzle-orm';
import { z } from 'zod';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { forumCategory, forumThread } from '#lib/server/db/schema.ts';
import { parseForm, text } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categories = await db
		.select({ id: forumCategory.id, name: forumCategory.name, slug: forumCategory.slug })
		.from(forumCategory)
		.orderBy(asc(forumCategory.sortOrder));
	const preselected = categories.find((c) => c.slug === url.searchParams.get('kategori'));
	return { categories, preselected: preselected ? String(preselected.id) : '' };
};

const schema = z.object({
	categoryId: z.coerce.number({ error: 'Velg kategori' }).int().positive('Velg kategori'),
	title: text(150),
	body: text(10000)
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = currentUser(locals);
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const [thread] = await db
			.insert(forumThread)
			.values({ ...data, authorId: user.id })
			.returning({ id: forumThread.id });
		redirect(303, `/forum/${thread.id}`);
	}
};
