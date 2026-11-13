import { asc, gte } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { course, courseSession } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [courses, upcoming] = await Promise.all([
		db.select({ id: course.id, title: course.title }).from(course).orderBy(asc(course.title)),
		db
			.select({ courseId: courseSession.courseId, startsAt: courseSession.startsAt })
			.from(courseSession)
			.where(gte(courseSession.endsAt, new Date()))
			.orderBy(asc(courseSession.startsAt))
	]);
	return {
		courses: courses.map((c) => {
			const dates = upcoming.filter((s) => s.courseId === c.id);
			return { ...c, upcoming: dates.length, next: dates[0]?.startsAt ?? null };
		})
	};
};
