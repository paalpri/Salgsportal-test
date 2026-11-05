import { fail, redirect } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { auth, authErrorMessage, safeRedirect } from '#lib/server/auth.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');

		try {
			await auth.api.signInEmail({ body: { email, password } });
		} catch (e) {
			if (e instanceof APIError) return fail(400, { email, message: authErrorMessage(e) });
			throw e;
		}
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
