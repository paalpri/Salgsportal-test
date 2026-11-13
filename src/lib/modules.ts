import Newspaper from '@lucide/svelte/icons/newspaper';
import Package from '@lucide/svelte/icons/package';
import CalendarDays from '@lucide/svelte/icons/calendar-days';
import Lightbulb from '@lucide/svelte/icons/lightbulb';

/**
 * Sections in the main navigation, each also shown as a card on the front page. To add a section:
 * add an entry here and create its route folder under src/routes/(app).
 */
export const modules = [
	{
		label: 'Nyheter',
		href: '/nyheter',
		icon: Newspaper,
		title: 'Nyheter og aktuelt',
		description: 'Siste nytt, oppdateringer og aktuelle tilbud fra Modulus Barn.',
		linkLabel: 'Se nyheter'
	},
	{
		label: 'Moduler og tjenester',
		href: '/produkter',
		icon: Package,
		title: 'Moduler og tjenester',
		description: 'Utforsk tilgjengelige moduler og tjenester for kommunen.',
		linkLabel: 'Se oversikt'
	},
	{
		label: 'Kurskalender',
		href: '/kurskalender',
		icon: CalendarDays,
		title: 'Kurskalender',
		description: 'Finn kommende digitale kurs og meld på kursdeltakere.',
		linkLabel: 'Se kurskalender'
	},
	{
		label: 'Ønskeliste',
		href: '/onsker',
		icon: Lightbulb,
		title: 'Ønskeliste',
		description: 'Har dere ideer til nye funksjoner eller forbedringer? Del dem med oss.',
		linkLabel: 'Del et ønske'
	}
] as const;
