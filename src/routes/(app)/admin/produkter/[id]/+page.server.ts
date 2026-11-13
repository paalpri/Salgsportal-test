import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { parsePriceList } from '#lib/prices.ts';
import { uniqueSlug } from '#lib/server/admin.ts';
import { db } from '#lib/server/db/index.ts';
import { product, productCategory } from '#lib/server/db/schema.ts';
import {
	checkbox,
	longText,
	optionalInt,
	optionalText,
	optionalUrl,
	parseForm,
	text
} from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

async function findProduct(id: string) {
	if (id === 'ny') return null;
	const [row] = await db
		.select()
		.from(product)
		.where(eq(product.id, Number(id)));
	if (!row) error(404, 'Produktet finnes ikke');
	return row;
}

export const load: PageServerLoad = async ({ params }) => ({
	product: await findProduct(params.id),
	categories: await db
		.select({ id: productCategory.id, name: productCategory.name })
		.from(productCategory)
		.orderBy(asc(productCategory.sortOrder))
});

const schema = z.object({
	name: text(150),
	slug: optionalText(150),
	categoryId: optionalInt,
	summary: longText(300),
	description: longText(),
	priceNok: optionalInt,
	priceUnit: optionalText(40),
	priceFrom: checkbox,
	prices: longText(5000).transform(parsePriceList),
	imageUrl: optionalUrl,
	orderUrl: optionalUrl,
	isNew: checkbox,
	active: checkbox
});

export const actions: Actions = {
	save: async ({ request, params }) => {
		const existing = await findProduct(params.id);
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const slug = await uniqueSlug(data.slug ?? data.name, async (candidate) => {
			const [hit] = await db
				.select({ id: product.id })
				.from(product)
				.where(
					and(eq(product.slug, candidate), existing ? ne(product.id, existing.id) : undefined)
				);
			return !!hit;
		});
		const values = { ...data, slug, categoryId: data.categoryId || null };

		if (existing) {
			await db.update(product).set(values).where(eq(product.id, existing.id));
			return { saved: true };
		}
		const [created] = await db.insert(product).values(values).returning({ id: product.id });
		redirect(303, `/admin/produkter/${created.id}`);
	},

	delete: async ({ params }) => {
		const existing = await findProduct(params.id);
		if (!existing) return fail(404, { message: 'Produktet finnes ikke' });
		await db.delete(product).where(eq(product.id, existing.id));
		redirect(303, '/admin/produkter');
	}
};
