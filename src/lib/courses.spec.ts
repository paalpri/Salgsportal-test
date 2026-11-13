import { describe, expect, it } from 'vitest';
import { formatDuration, monthGrid, osloDate, osloInstant, osloTime } from './courses.ts';

describe('course calendar', () => {
	it('lays out a month as whole weeks starting on Monday', () => {
		const weeks = monthGrid('2026-12');
		expect(weeks).toHaveLength(5);
		expect(weeks[0]).toEqual([
			'2026-11-30',
			'2026-12-01',
			'2026-12-02',
			'2026-12-03',
			'2026-12-04',
			'2026-12-05',
			'2026-12-06'
		]);
		expect(weeks.at(-1)!.at(-1)).toBe('2027-01-03');
	});

	it('reads and shows times in Norwegian time, summer and winter', () => {
		expect(osloInstant('2026-12-03', '09:00').toISOString()).toBe('2026-12-03T08:00:00.000Z');
		expect(osloInstant('2026-06-03', '09:00').toISOString()).toBe('2026-06-03T07:00:00.000Z');
		const lateEvening = new Date('2026-12-03T23:30:00Z');
		expect(osloDate(lateEvening)).toBe('2026-12-04');
		expect(osloTime(lateEvening)).toBe('00:30');
	});

	it('describes durations in Norwegian', () => {
		const at = (time: string) => osloInstant('2026-12-03', time);
		expect(formatDuration(at('09:00'), at('11:00'))).toBe('2 timer');
		expect(formatDuration(at('09:00'), at('10:00'))).toBe('1 time');
		expect(formatDuration(at('09:00'), at('10:30'))).toBe('1 time og 30 min');
		expect(formatDuration(at('09:00'), at('09:45'))).toBe('45 min');
	});
});
