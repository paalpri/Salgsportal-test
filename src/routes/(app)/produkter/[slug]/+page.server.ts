import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { cartItem, product, productCategory } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = currentUser(locals);
	const [row] = await db
		.select({ product, category: productCategory })
		.from(product)
		.leftJoin(productCategory, eq(productCategory.id, product.categoryId))
		.where(eq(product.slug, params.slug));
	if (!row || (!row.product.active && user.role !== 'admin')) error(404, 'Produktet finnes ikke');

	const [inCart] = user.municipalityId
		? await db
				.select({ quantity: cartItem.quantity })
				.from(cartItem)
				.where(
					and(
						eq(cartItem.municipalityId, user.municipalityId),
						eq(cartItem.productId, row.product.id)
					)
				)
		: [];
	return { ...row, inCartQuantity: inCart?.quantity ?? 0 };
};
