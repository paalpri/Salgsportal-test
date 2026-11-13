import { error, fail } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { asc, eq, ilike, or } from 'drizzle-orm';
import { z } from 'zod';
import { auth, authErrorMessage, currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { municipality, user } from '#lib/server/db/schema.ts';
import { optionalInt, optionalText, parseForm, text } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim() ?? '';
	const pattern = `%${query.replace(/[%_\\]/g, '\\$&')}%`;

	const [users, municipalities] = await Promise.all([
		db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				banned: user.banned,
				jobTitle: user.jobTitle,
				municipalityId: user.municipalityId,
				municipalityName: municipality.name,
				createdAt: user.createdAt
			})
			.from(user)
			.leftJoin(municipality, eq(municipality.id, user.municipalityId))
			.where(query ? or(ilike(user.name, pattern), ilike(user.email, pattern)) : undefined)
			.orderBy(asc(user.name)),
		db
			.select({ id: municipality.id, name: municipality.name })
			.from(municipality)
			.orderBy(asc(municipality.name))
	]);
	return { users, municipalities, query };
};

const role = z.enum(['user', 'admin']);

const createSchema = z.object({
	name: text(100),
	email: z.email('Ugyldig e-postadresse').trim().toLowerCase(),
	password: z.string().min(8, 'Minst 8 tegn').max(128),
	role,
	municipalityId: optionalInt,
	jobTitle: optionalText(100)
});

const updateSchema = z.object({
	userId: z.string().min(1),
	role,
	municipalityId: optionalInt,
	jobTitle: optionalText(100)
});

function notSelf(locals: App.Locals, userId: string) {
	if (currentUser(locals).id === userId)
		error(400, 'Du kan ikke endre rolle eller sperre deg selv');
}

async function withAuthErrors(run: () => Promise<unknown>) {
	try {
		await run();
	} catch (e) {
		if (e instanceof APIError) return fail(400, { message: authErrorMessage(e) });
		throw e;
	}
}

export const actions: Actions = {
	create: async ({ request }) => {
		const { data, failure } = await parseForm(request, createSchema);
		if (failure) return failure;
		return withAuthErrors(async () => {
			const { user: created } = await auth.api.createUser({
				headers: request.headers,
				body: { name: data.name, email: data.email, password: data.password, role: data.role }
			});
			await db
				.update(user)
				.set({ municipalityId: data.municipalityId || null, jobTitle: data.jobTitle })
				.where(eq(user.id, created.id));
		});
	},

	update: async ({ request, locals }) => {
		const { data, failure } = await parseForm(request, updateSchema);
		if (failure) return failure;
		const [target] = await db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, data.userId));
		if (!target) error(404, 'Brukeren finnes ikke');
		if (target.role !== data.role) notSelf(locals, data.userId);

		return withAuthErrors(async () => {
			if (target.role !== data.role) {
				await auth.api.setRole({
					headers: request.headers,
					body: { userId: data.userId, role: data.role }
				});
			}
			await db
				.update(user)
				.set({ municipalityId: data.municipalityId || null, jobTitle: data.jobTitle })
				.where(eq(user.id, data.userId));
		});
	},

	ban: async ({ request, locals }) => {
		const userId = String((await request.formData()).get('userId'));
		notSelf(locals, userId);
		return withAuthErrors(() => auth.api.banUser({ headers: request.headers, body: { userId } }));
	},

	unban: async ({ request }) => {
		const userId = String((await request.formData()).get('userId'));
		return withAuthErrors(() => auth.api.unbanUser({ headers: request.headers, body: { userId } }));
	}
};
