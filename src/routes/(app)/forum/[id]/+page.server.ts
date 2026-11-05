import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { currentUser } from '#lib/server/auth.ts';
import { db } from '#lib/server/db/index.ts';
import {
	forumCategory,
	forumReply,
	forumThread,
	municipality,
	user
} from '#lib/server/db/schema.ts';
import { parseForm, text } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad, RequestEvent } from './$types';

const author = {
	id: user.id,
	name: user.name,
	jobTitle: user.jobTitle,
	role: user.role,
	municipalityName: municipality.name
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const me = currentUser(locals);
	const id = Number(params.id);
	if (!Number.isInteger(id)) error(404, 'Tråden finnes ikke');

	const [row] = await db
		.select({ thread: forumThread, category: forumCategory, author })
		.from(forumThread)
		.innerJoin(forumCategory, eq(forumCategory.id, forumThread.categoryId))
		.leftJoin(user, eq(user.id, forumThread.authorId))
		.leftJoin(municipality, eq(municipality.id, user.municipalityId))
		.where(eq(forumThread.id, id));
	if (!row) error(404, 'Tråden finnes ikke');

	const replies = await db
		.select({ reply: forumReply, author })
		.from(forumReply)
		.leftJoin(user, eq(user.id, forumReply.authorId))
		.leftJoin(municipality, eq(municipality.id, user.municipalityId))
		.where(eq(forumReply.threadId, id))
		.orderBy(asc(forumReply.createdAt));

	return { ...row, replies, me: { id: me.id, isAdmin: me.role === 'admin' } };
};

async function loadThread({ params, locals }: RequestEvent) {
	const me = currentUser(locals);
	const [thread] = await db
		.select()
		.from(forumThread)
		.where(eq(forumThread.id, Number(params.id)));
	if (!thread) error(404, 'Tråden finnes ikke');
	const isAdmin = me.role === 'admin';
	return { me, thread, isAdmin, ownsThread: isAdmin || thread.authorId === me.id };
}

async function loadOwnReply(event: RequestEvent, form: FormData) {
	const { me, thread, isAdmin } = await loadThread(event);
	const [reply] = await db
		.select()
		.from(forumReply)
		.where(and(eq(forumReply.id, Number(form.get('replyId'))), eq(forumReply.threadId, thread.id)));
	if (!reply) error(404, 'Svaret finnes ikke');
	if (!isAdmin && reply.authorId !== me.id) error(403, 'Du kan bare endre dine egne svar');
	return { thread, reply };
}

const bodySchema = z.object({ body: text(10000) });
const threadSchema = z.object({ title: text(150), body: text(10000) });

export const actions: Actions = {
	reply: async (event) => {
		const { me, thread, isAdmin } = await loadThread(event);
		if (thread.locked && !isAdmin) return fail(403, { message: 'Tråden er låst' });
		const { data, failure } = await parseForm(event.request, bodySchema);
		if (failure) return failure;

		await db.transaction(async (tx) => {
			await tx.insert(forumReply).values({ threadId: thread.id, authorId: me.id, body: data.body });
			await tx
				.update(forumThread)
				.set({ lastActivityAt: new Date() })
				.where(eq(forumThread.id, thread.id));
		});
	},

	editThread: async (event) => {
		const { thread, ownsThread } = await loadThread(event);
		if (!ownsThread) error(403, 'Du kan bare endre dine egne innlegg');
		const { data, failure } = await parseForm(event.request, threadSchema);
		if (failure) return failure;
		await db
			.update(forumThread)
			.set({ ...data, editedAt: new Date() })
			.where(eq(forumThread.id, thread.id));
	},

	deleteThread: async (event) => {
		const { thread, ownsThread } = await loadThread(event);
		if (!ownsThread) error(403, 'Du kan bare slette dine egne innlegg');
		await db.delete(forumThread).where(eq(forumThread.id, thread.id));
		redirect(303, '/forum');
	},

	accept: async (event) => {
		const { thread, ownsThread } = await loadThread(event);
		if (!ownsThread) error(403, 'Bare den som startet tråden kan markere løsning');
		const replyId = Number((await event.request.formData()).get('replyId'));
		const [reply] = await db
			.select({ id: forumReply.id })
			.from(forumReply)
			.where(and(eq(forumReply.id, replyId), eq(forumReply.threadId, thread.id)));
		if (!reply) error(404, 'Svaret finnes ikke');
		await db
			.update(forumThread)
			.set({ acceptedReplyId: thread.acceptedReplyId === reply.id ? null : reply.id })
			.where(eq(forumThread.id, thread.id));
	},

	editReply: async (event) => {
		const form = await event.request.formData();
		const { reply } = await loadOwnReply(event, form);
		const parsed = bodySchema.safeParse({ body: form.get('body') });
		if (!parsed.success) return fail(400, { message: 'Svaret kan ikke være tomt' });
		await db
			.update(forumReply)
			.set({ ...parsed.data, editedAt: new Date() })
			.where(eq(forumReply.id, reply.id));
	},

	deleteReply: async (event) => {
		const { thread, reply } = await loadOwnReply(event, await event.request.formData());
		await db.transaction(async (tx) => {
			await tx.delete(forumReply).where(eq(forumReply.id, reply.id));
			if (thread.acceptedReplyId === reply.id) {
				await tx
					.update(forumThread)
					.set({ acceptedReplyId: null })
					.where(eq(forumThread.id, thread.id));
			}
		});
	},

	moderate: async (event) => {
		const { thread, isAdmin } = await loadThread(event);
		if (!isAdmin) error(403, 'Kun for administratorer');
		const field = (await event.request.formData()).get('field');
		if (field === 'pinned') {
			await db
				.update(forumThread)
				.set({ pinned: !thread.pinned })
				.where(eq(forumThread.id, thread.id));
		} else if (field === 'locked') {
			await db
				.update(forumThread)
				.set({ locked: !thread.locked })
				.where(eq(forumThread.id, thread.id));
		}
	}
};
