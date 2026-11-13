import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { admin } from 'better-auth/plugins/admin';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { error } from '@sveltejs/kit';
import { db } from '#lib/server/db/index.ts';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true, minPasswordLength: 8 },
	user: {
		additionalFields: {
			municipalityId: { type: 'number', required: false, input: false },
			jobTitle: { type: 'string', required: false, input: true }
		}
	},
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			// Accounts are created by admins in /admin/brukere; the public sign-up endpoint stays closed.
			if (ctx.path === '/sign-up/email') throw new APIError('NOT_FOUND');
		})
	},
	plugins: [
		admin(),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});

const messages: Record<string, string> = {
	BANNED_USER: 'Kontoen din er sperret. Ta kontakt med oss.',
	INVALID_EMAIL_OR_PASSWORD: 'Feil e-post eller passord.',
	USER_ALREADY_EXISTS: 'Det finnes allerede en bruker med denne e-posten.',
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Det finnes allerede en bruker med denne e-posten.',
	PASSWORD_TOO_SHORT: 'Passordet er for kort.',
	INVALID_PASSWORD: 'Feil passord.'
};

export function authErrorMessage(error: APIError) {
	return messages[String(error.body?.code)] ?? 'Noe gikk galt. Prøv igjen.';
}

/** Only same-site paths, so `redirectTo` can't send users to another origin. */
export function safeRedirect(target: string | null) {
	return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
}

/** Routes under (app) are already gated in hooks; this narrows the type and guards against misconfiguration. */
export function currentUser(locals: App.Locals) {
	if (!locals.user) error(401, 'Ikke innlogget');
	return locals.user;
}
