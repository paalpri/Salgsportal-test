import { and, asc, eq, gte, lt } from 'drizzle-orm';
import {
	addMonths,
	monthGrid,
	nextDay,
	osloDate,
	osloInstant,
	parseMonth,
	todayInOslo
} from '#lib/courses.ts';
import { db } from '#lib/server/db/index.ts';
import { course, courseSession } from '#lib/server/db/schema.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const month = parseMonth(url.searchParams.get('maned'));
	const weeks = monthGrid(month);
	const from = osloInstant(weeks[0]![0]!, '00:00');
	const to = osloInstant(nextDay(weeks.at(-1)!.at(-1)!), '00:00');

	const rows = await db
		.select({
			id: courseSession.id,
			startsAt: courseSession.startsAt,
			endsAt: courseSession.endsAt,
			signupUrl: courseSession.signupUrl,
			capacity: courseSession.capacity,
			status: courseSession.status,
			title: course.title,
			description: course.description,
			agenda: course.agenda,
			audience: course.audience
		})
		.from(courseSession)
		.innerJoin(course, eq(course.id, courseSession.courseId))
		.where(and(gte(courseSession.startsAt, from), lt(courseSession.startsAt, to)))
		.orderBy(asc(courseSession.startsAt));

	return {
		month,
		previous: addMonths(month, -1),
		next: addMonths(month, 1),
		current: parseMonth(null),
		today: todayInOslo(),
		weeks,
		sessions: rows.map((row) => ({ ...row, date: osloDate(row.startsAt) }))
	};
};
