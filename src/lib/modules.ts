import Newspaper from '@lucide/svelte/icons/newspaper';
import MessagesSquare from '@lucide/svelte/icons/messages-square';
import Package from '@lucide/svelte/icons/package';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

/**
 * Sections of the portal shown in the navigation. A section owns every route under `href`;
 * admins can switch sections off in /admin/seksjoner, which hides them and returns 404 for members.
 * To add a section: add an entry here and create its route folder under src/routes/(app).
 */
export const modules = [
	{
		key: 'news',
		label: 'Nyheter',
		description: 'Endringer i Modulus Barn, nye versjoner og driftsmeldinger.',
		href: '/nyheter',
		icon: Newspaper
	},
	{
		key: 'forum',
		label: 'Forum',
		description: 'Spør, svar og del erfaringer med andre kommuner.',
		href: '/forum',
		icon: MessagesSquare
	},
	{
		key: 'products',
		label: 'Moduler og tjenester',
		description: 'Nye moduler, integrasjoner, kurs og innføringshjelp.',
		href: '/produkter',
		icon: Package
	},
	{
		key: 'cart',
		label: 'Handleliste',
		description: 'Kommunens felles handleliste og forespørsler.',
		href: '/handleliste',
		icon: ShoppingCart
	}
] as const;

export type ModuleKey = (typeof modules)[number]['key'];

export function moduleForPath(pathname: string) {
	return modules.find((m) => pathname === m.href || pathname.startsWith(m.href + '/'));
}
