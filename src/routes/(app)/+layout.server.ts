import { count, eq } from 'drizzle-orm';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { cartItem, municipality } from '#lib/server/db/schema.ts';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = currentUser(locals);
	const municipalityId = user.municipalityId ?? null;

	const [kommune] = municipalityId
		? await db
				.select({ name: municipality.name })
				.from(municipality)
				.where(eq(municipality.id, municipalityId))
		: [];
	const [cart] =
		municipalityId && locals.modules.includes('cart')
			? await db
					.select({ n: count() })
					.from(cartItem)
					.where(eq(cartItem.municipalityId, municipalityId))
			: [];

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			jobTitle: user.jobTitle ?? null,
			isAdmin: user.role === 'admin',
			municipalityId,
			municipalityName: kommune?.name ?? null
		},
		modules: locals.modules,
		cartCount: cart?.n ?? 0
	};
};
