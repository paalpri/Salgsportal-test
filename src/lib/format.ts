const nok = new Intl.NumberFormat('nb-NO', {
	style: 'currency',
	currency: 'NOK',
	maximumFractionDigits: 0
});
const date = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
const relative = new Intl.RelativeTimeFormat('nb-NO', { numeric: 'auto' });

export function formatPrice(priceNok: number | null, unit?: string | null, from = false) {
	if (priceNok === null) return 'Pris på forespørsel';
	const price = unit ? `${nok.format(priceNok)} ${unit}` : nok.format(priceNok);
	return from ? `Fra ${price}` : price;
}

export function formatDate(value: Date | string) {
	return date.format(new Date(value));
}

const steps: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 31_536_000],
	['month', 2_592_000],
	['week', 604_800],
	['day', 86_400],
	['hour', 3_600],
	['minute', 60]
];

export function timeAgo(value: Date | string, now = Date.now()) {
	const seconds = Math.round((new Date(value).getTime() - now) / 1000);
	for (const [unit, size] of steps) {
		if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
	}
	return 'akkurat nå';
}

export function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]!.toUpperCase())
		.join('');
}
