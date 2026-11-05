import { error, fail } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { cartItem, product, productCategory } from '#lib/server/db/schema.ts';
import { cartProductIds, listProducts } from '#lib/server/products.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const user = currentUser(locals);
	const categories = await db
		.select({ id: productCategory.id, name: productCategory.name, slug: productCategory.slug })
		.from(productCategory)
		.orderBy(asc(productCategory.sortOrder), asc(productCategory.name));
	const active = categories.find((c) => c.slug === url.searchParams.get('kategori')) ?? null;
	const query = url.searchParams.get('q')?.trim() ?? '';
	const onlyNew = url.searchParams.has('nyheter');

	const [products, inCart] = await Promise.all([
		listProducts({ categoryId: active?.id, query: query || undefined, onlyNew }),
		cartProductIds(user.municipalityId ?? null)
	]);
	return { categories, active, query, onlyNew, products, inCart };
};

export const actions: Actions = {
	addToCart: async ({ request, locals }) => {
		const user = currentUser(locals);
		if (!locals.modules.includes('cart')) error(404, 'Handlelisten er ikke aktivert');
		if (!user.municipalityId) {
			return fail(400, { message: 'Brukeren din er ikke knyttet til en kommune.' });
		}

		const form = await request.formData();
		const productId = Number(form.get('productId'));
		const quantity = Math.min(Math.max(Number(form.get('quantity') ?? 1) || 1, 1), 999);
		const [found] = await db
			.select({ id: product.id })
			.from(product)
			.where(and(eq(product.id, productId), eq(product.active, true)));
		if (!found) return fail(404, { message: 'Produktet finnes ikke' });

		await db
			.insert(cartItem)
			.values({ municipalityId: user.municipalityId, productId, quantity, addedById: user.id })
			.onConflictDoUpdate({
				target: [cartItem.municipalityId, cartItem.productId],
				set: { quantity: sql`least(${cartItem.quantity} + ${quantity}, 999)` }
			});
	}
};
