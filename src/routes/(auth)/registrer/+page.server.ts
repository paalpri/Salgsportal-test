import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth, authErrorMessage, safeRedirect } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { municipality, user } from '#lib/server/db/schema.ts';
import { optionalText, parseForm, text } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	const municipalities = await db
		.select({ id: municipality.id, name: municipality.name })
		.from(municipality)
		.orderBy(asc(municipality.name));
	return { municipalities };
};

const schema = z.object({
	name: text(100),
	email: z.email('Ugyldig e-postadresse').trim().toLowerCase(),
	password: z.string().min(8, 'Minst 8 tegn').max(128),
	municipalityId: z.coerce.number({ error: 'Velg kommune' }).int().positive('Velg kommune'),
	jobTitle: optionalText(100)
});

export const actions: Actions = {
	default: async ({ request, url }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;

		const [kommune] = await db
			.select()
			.from(municipality)
			.where(eq(municipality.id, data.municipalityId));
		if (!kommune) return fail(400, { values: data, errors: { municipalityId: 'Velg kommune' } });
		if (kommune.emailDomain && !data.email.endsWith('@' + kommune.emailDomain)) {
			const message = `Bruk e-postadressen din fra ${kommune.name} (@${kommune.emailDomain}).`;
			return fail(400, { values: data, errors: { email: message }, message });
		}

		try {
			const result = await auth.api.signUpEmail({
				body: {
					name: data.name,
					email: data.email,
					password: data.password,
					jobTitle: data.jobTitle ?? undefined
				}
			});
			await db.update(user).set({ municipalityId: kommune.id }).where(eq(user.id, result.user.id));
		} catch (e) {
			if (e instanceof APIError) return fail(400, { values: data, message: authErrorMessage(e) });
			throw e;
		}
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
