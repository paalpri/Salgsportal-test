import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { currentUser } from '#lib/server/auth.ts';
import { uniqueSlug } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { post } from '#lib/server/db/schema.ts';
import {
	checkbox,
	longText,
	optionalText,
	optionalUrl,
	parseForm,
	text
} from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

async function findPost(id: string) {
	if (id === 'ny') return null;
	const [row] = await db
		.select()
		.from(post)
		.where(eq(post.id, Number(id)));
	if (!row) error(404, 'Innlegget finnes ikke');
	return row;
}

export const load: PageServerLoad = async ({ params }) => ({ post: await findPost(params.id) });

const schema = z.object({
	kind: z.enum(['news', 'ad']),
	title: text(150),
	slug: optionalText(150),
	excerpt: longText(300),
	body: longText(),
	imageUrl: optionalUrl,
	ctaLabel: optionalText(40),
	ctaUrl: optionalUrl,
	published: checkbox,
	pinned: checkbox
});

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const existing = await findPost(params.id);
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const slug = await uniqueSlug(data.slug ?? data.title, async (candidate) => {
			const [hit] = await db
				.select({ id: post.id })
				.from(post)
				.where(and(eq(post.slug, candidate), existing ? ne(post.id, existing.id) : undefined));
			return !!hit;
		});
		const values = {
			...data,
			slug,
			publishedAt: data.published ? (existing?.publishedAt ?? new Date()) : existing?.publishedAt
		};

		if (existing) {
			await db.update(post).set(values).where(eq(post.id, existing.id));
			return { saved: true };
		}
		const [created] = await db
			.insert(post)
			.values({ ...values, authorId: currentUser(locals).id })
			.returning({ id: post.id });
		redirect(303, `/admin/innlegg/${created.id}`);
	},

	delete: async ({ params }) => {
		const existing = await findPost(params.id);
		if (!existing) return fail(404, { message: 'Innlegget finnes ikke' });
		await db.delete(post).where(eq(post.id, existing.id));
		redirect(303, '/admin/innlegg');
	}
};
