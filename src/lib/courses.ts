import {
	endOfMonth,
	endOfWeek,
	fromDate,
	parseDate,
	parseDateTime,
	startOfWeek,
	toCalendarDate,
	toZoned,
	today
} from '@internationalized/date';

/** Courses are held, entered and shown in Norwegian time, whatever the server's time zone. */
export const TIME_ZONE = 'Europe/Oslo';
const LOCALE = 'nb-NO';

export const courseStatuses = {
	open: { label: 'Åpen for påmelding' },
	full: { label: 'Fulltegnet' },
	cancelled: { label: 'Avlyst' }
} as const;

export type CourseStatus = keyof typeof courseStatuses;
export const courseStatusKeys = Object.keys(courseStatuses) as CourseStatus[];

/** «2026-12-03», «09:00» in Norwegian time → the instant. */
export function osloInstant(date: string, time: string) {
	return toZoned(parseDateTime(`${date}T${time}`), TIME_ZONE).toDate();
}

export function osloDate(instant: Date) {
	return toCalendarDate(fromDate(instant, TIME_ZONE)).toString();
}

const time = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	hour: '2-digit',
	minute: '2-digit'
});
const longDate = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});
const shortDate = new Intl.DateTimeFormat(LOCALE, {
	timeZone: TIME_ZONE,
	weekday: 'short',
	day: 'numeric',
	month: 'short'
});
const monthName = new Intl.DateTimeFormat(LOCALE, {
	timeZone: 'UTC',
	month: 'long',
	year: 'numeric'
});

/** «09:00», as typed into a time input. */
export const osloTime = (instant: Date) => time.format(instant).replace('.', ':');
export const formatLongDate = (instant: Date) => longDate.format(instant);
export const formatShortDate = (instant: Date) => shortDate.format(instant);
export const formatTimeRange = (start: Date, end: Date) => `${osloTime(start)}–${osloTime(end)}`;

export function formatDuration(start: Date, end: Date) {
	const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (!h) return `${m} min`;
	const hours = `${h} ${h === 1 ? 'time' : 'timer'}`;
	return m ? `${hours} og ${m} min` : hours;
}

/** «2026-12», or the current month when the value is missing or malformed. */
export function parseMonth(value: string | null) {
	return value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
		? value
		: today(TIME_ZONE).toString().slice(0, 7);
}

export function addMonths(month: string, months: number) {
	return parseDate(`${month}-01`).add({ months }).toString().slice(0, 7);
}

export function formatMonth(month: string) {
	const label = monthName.format(new Date(`${month}-01T12:00:00Z`));
	return label[0]!.toUpperCase() + label.slice(1);
}

/** The month as whole weeks from Monday to Sunday, each day an ISO date. */
export function monthGrid(month: string) {
	const first = parseDate(`${month}-01`);
	const last = endOfWeek(endOfMonth(first), LOCALE);
	const weeks: string[][] = [];
	for (let day = startOfWeek(first, LOCALE); day.compare(last) <= 0; day = day.add({ days: 1 })) {
		if (!weeks.length || weeks.at(-1)!.length === 7) weeks.push([]);
		weeks.at(-1)!.push(day.toString());
	}
	return weeks;
}

export const todayInOslo = () => today(TIME_ZONE).toString();

export const nextDay = (date: string) => parseDate(date).add({ days: 1 }).toString();

export const agendaItems = (agenda: string) =>
	agenda
		.split('\n')
		.map((line) => line.replace(/^[-•*]\s*/, '').trim())
		.filter(Boolean);
