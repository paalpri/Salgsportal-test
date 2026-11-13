import { error, redirect } from '@sveltejs/kit';
import { sequence, type Handle } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import { auth } from '#lib/server/auth.ts';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const within = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(prefix + '/');

const handleAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user;
	event.locals.session = session?.session;
	return svelteKitHandler({ event, resolve, auth, building });
};

const handleAccess: Handle = async ({ event, resolve }) => {
	const { pathname, search } = event.url;
	const isAdminPath = within(pathname, '/admin');
	if (!isAdminPath && !within(pathname, '/profil')) return resolve(event);

	const user = event.locals.user;
	if (!user) redirect(303, `/logg-inn?redirectTo=${encodeURIComponent(pathname + search)}`);
	if (isAdminPath && user.role !== 'admin') error(404, 'Siden finnes ikke');
	return resolve(event);
};

export const handle = sequence(handleAuth, handleAccess);
