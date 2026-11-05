import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import { post, user } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const isAdmin = currentUser(locals).role === 'admin';
	const [row] = await db
		.select({ post, authorName: user.name })
		.from(post)
		.leftJoin(user, eq(user.id, post.authorId))
		.where(eq(post.slug, params.slug));

	if (!row || (!row.post.published && !isAdmin)) error(404, 'Innlegget finnes ikke');
	return { post: row.post, authorName: row.authorName, isAdmin };
};
