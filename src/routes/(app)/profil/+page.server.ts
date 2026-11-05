import { fail } from '@sveltejs/kit';
import { APIError } from 'better-auth/api';
import { z } from 'zod';
import { auth, authErrorMessage } from '#lib/server/auth.ts';
import { optionalText, parseForm, text } from '#lib/server/forms.ts';
import type { Actions } from './$types';

const profileSchema = z.object({ name: text(100), jobTitle: optionalText(100) });
const passwordSchema = z.object({
	currentPassword: z.string().min(1, 'Må fylles ut'),
	newPassword: z.string().min(8, 'Minst 8 tegn').max(128)
});

export const actions: Actions = {
	profile: async ({ request }) => {
		const { data, failure } = await parseForm(request, profileSchema);
		if (failure) return failure;
		await auth.api.updateUser({
			headers: request.headers,
			body: { name: data.name, jobTitle: data.jobTitle ?? '' }
		});
	},

	password: async ({ request }) => {
		const { data, failure } = await parseForm(request, passwordSchema);
		if (failure) return failure;
		try {
			await auth.api.changePassword({
				headers: request.headers,
				body: { ...data, revokeOtherSessions: true }
			});
		} catch (e) {
			if (e instanceof APIError) return fail(400, { message: authErrorMessage(e) });
			throw e;
		}
	}
};
