import { error, fail } from '@sveltejs/kit';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { cartItem, product, quoteRequest, quoteRequestItem, user } from '#lib/server/db/schema.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const municipalityId = currentUser(locals).municipalityId;
	if (!municipalityId) return { items: [], requests: [] };

	const [items, requests] = await Promise.all([
		db
			.select({
				id: cartItem.id,
				quantity: cartItem.quantity,
				note: cartItem.note,
				addedBy: user.name,
				product: {
					id: product.id,
					name: product.name,
					slug: product.slug,
					priceNok: product.priceNok,
					priceUnit: product.priceUnit,
					active: product.active
				}
			})
			.from(cartItem)
			.innerJoin(product, eq(product.id, cartItem.productId))
			.leftJoin(user, eq(user.id, cartItem.addedById))
			.where(eq(cartItem.municipalityId, municipalityId))
			.orderBy(asc(cartItem.createdAt)),
		db
			.select({
				id: quoteRequest.id,
				status: quoteRequest.status,
				message: quoteRequest.message,
				adminNote: quoteRequest.adminNote,
				createdAt: quoteRequest.createdAt,
				submittedBy: user.name,
				itemCount: sql<number>`(select count(*)::int from ${quoteRequestItem} where ${quoteRequestItem.requestId} = ${quoteRequest.id})`
			})
			.from(quoteRequest)
			.leftJoin(user, eq(user.id, quoteRequest.submittedById))
			.where(eq(quoteRequest.municipalityId, municipalityId))
			.orderBy(desc(quoteRequest.createdAt))
	]);
	return { items, requests };
};

function requireMunicipality(locals: App.Locals) {
	const user = currentUser(locals);
	if (!user.municipalityId) error(400, 'Brukeren din er ikke knyttet til en kommune');
	return { user, municipalityId: user.municipalityId };
}

export const actions: Actions = {
	update: async ({ request, locals }) => {
		const { municipalityId } = requireMunicipality(locals);
		const form = await request.formData();
		const quantity = Number(form.get('quantity'));
		if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
			return fail(400, { message: 'Antall må være mellom 1 og 999' });
		}
		await db
			.update(cartItem)
			.set({ quantity, note: String(form.get('note') ?? '').slice(0, 500) })
			.where(
				and(eq(cartItem.id, Number(form.get('id'))), eq(cartItem.municipalityId, municipalityId))
			);
	},

	remove: async ({ request, locals }) => {
		const { municipalityId } = requireMunicipality(locals);
		const id = Number((await request.formData()).get('id'));
		await db
			.delete(cartItem)
			.where(and(eq(cartItem.id, id), eq(cartItem.municipalityId, municipalityId)));
	},

	submit: async ({ request, locals }) => {
		const { user, municipalityId } = requireMunicipality(locals);
		const message = String((await request.formData()).get('message') ?? '')
			.trim()
			.slice(0, 2000);

		const created = await db.transaction(async (tx) => {
			const items = await tx
				.select({ cartItem, product })
				.from(cartItem)
				.innerJoin(product, eq(product.id, cartItem.productId))
				.where(and(eq(cartItem.municipalityId, municipalityId), eq(product.active, true)));
			if (!items.length) return null;

			const [req] = await tx
				.insert(quoteRequest)
				.values({ municipalityId, submittedById: user.id, message })
				.returning({ id: quoteRequest.id });
			await tx.insert(quoteRequestItem).values(
				items.map(({ cartItem: item, product: p }) => ({
					requestId: req.id,
					productId: p.id,
					productName: p.name,
					unitPriceNok: p.priceNok,
					priceUnit: p.priceUnit,
					quantity: item.quantity,
					note: item.note
				}))
			);
			await tx.delete(cartItem).where(eq(cartItem.municipalityId, municipalityId));
			return req;
		});

		if (!created) return fail(400, { message: 'Handlelisten er tom' });
		return { submitted: created.id };
	}
};
