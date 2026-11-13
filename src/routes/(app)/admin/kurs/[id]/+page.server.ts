import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { osloInstant } from '#lib/courses.ts';
import { db } from '#lib/server/db/index.ts';
import { course, courseSession, courseSessionStatus } from '#lib/server/db/schema.ts';
import { longText, optionalInt, parseForm, text } from '#lib/server/forms.ts';
import type { Actions, PageServerLoad } from './$types';

async function findCourse(id: string) {
	if (id === 'ny') return null;
	const [row] = await db
		.select()
		.from(course)
		.where(eq(course.id, Number(id)));
	if (!row) error(404, 'Kurset finnes ikke');
	return row;
}

async function requireCourse(id: string) {
	const found = await findCourse(id);
	if (!found) error(404, 'Kurset finnes ikke');
	return found;
}

export const load: PageServerLoad = async ({ params }) => {
	const found = await findCourse(params.id);
	return {
		course: found,
		sessions: found
			? await db
					.select()
					.from(courseSession)
					.where(eq(courseSession.courseId, found.id))
					.orderBy(asc(courseSession.startsAt))
			: []
	};
};

const courseSchema = z.object({
	title: text(150),
	description: longText(5000),
	agenda: longText(5000),
	audience: longText(300)
});

const sessionFields = z.object({
	date: z.iso.date(),
	start: z.iso.time(),
	end: z.iso.time(),
	signupUrl: text(500).refine((v) => /^https?:\/\//.test(v), 'Må starte med https://'),
	capacity: optionalInt,
	status: z.enum(courseSessionStatus.enumValues).default('open')
});
const endsAfterStart = (s: { start: string; end: string }) => s.end > s.start;
const endsAfterStartError = { path: ['end'], message: 'Sluttid må være etter starttid' };
const newSession = sessionFields.refine(endsAfterStart, endsAfterStartError);
const existingSession = sessionFields
	.extend({ id: z.coerce.number().int() })
	.refine(endsAfterStart, endsAfterStartError);

/** Inline session forms report problems as a toast, so name the first one. */
function firstError(failure: { data: { errors: Record<string, string> } }) {
	return fail(400, { message: Object.values(failure.data.errors)[0] ?? 'Sjekk feltene' });
}

function sessionValues(s: z.output<typeof sessionFields>) {
	return {
		startsAt: osloInstant(s.date, s.start),
		endsAt: osloInstant(s.date, s.end),
		signupUrl: s.signupUrl,
		capacity: s.capacity,
		status: s.status
	};
}

export const actions: Actions = {
	save: async ({ request, params }) => {
		const existing = await findCourse(params.id);
		const { data, failure } = await parseForm(request, courseSchema);
		if (failure) return failure;
		if (existing) {
			await db.update(course).set(data).where(eq(course.id, existing.id));
			return { saved: true };
		}
		const [created] = await db.insert(course).values(data).returning({ id: course.id });
		redirect(303, `/admin/kurs/${created.id}`);
	},

	delete: async ({ params }) => {
		const existing = await requireCourse(params.id);
		await db.delete(course).where(eq(course.id, existing.id));
		redirect(303, '/admin/kurs');
	},

	addSession: async ({ request, params }) => {
		const existing = await requireCourse(params.id);
		const { data, failure } = await parseForm(request, newSession);
		if (failure) return firstError(failure);
		await db.insert(courseSession).values({ courseId: existing.id, ...sessionValues(data) });
	},

	updateSession: async ({ request, params }) => {
		const existing = await requireCourse(params.id);
		const { data, failure } = await parseForm(request, existingSession);
		if (failure) return firstError(failure);
		await db
			.update(courseSession)
			.set(sessionValues(data))
			.where(and(eq(courseSession.id, data.id), eq(courseSession.courseId, existing.id)));
	},

	deleteSession: async ({ request, params }) => {
		const existing = await requireCourse(params.id);
		const id = Number((await request.formData()).get('id'));
		await db
			.delete(courseSession)
			.where(and(eq(courseSession.id, id), eq(courseSession.courseId, existing.id)));
	}
};
