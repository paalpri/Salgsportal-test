import Newspaper from '@lucide/svelte/icons/newspaper';
import MessagesSquare from '@lucide/svelte/icons/messages-square';
import Package from '@lucide/svelte/icons/package';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';

/**
 * Feature modules shown in the navigation. A module owns every route under `href`;
 * admins can switch modules off in /admin/moduler, which hides them and returns 404 for members.
 * To add a module: add an entry here and create its route folder under src/routes/(app).
 */
export const modules = [
	{
		key: 'news',
		label: 'Nyheter',
		description: 'Nyheter, kampanjer og kunngjøringer fra oss.',
		href: '/nyheter',
		icon: Newspaper
	},
	{
		key: 'forum',
		label: 'Forum',
		description: 'Still spørsmål og del erfaringer med andre kommuner.',
		href: '/forum',
		icon: MessagesSquare
	},
	{
		key: 'products',
		label: 'Produkter',
		description: 'Moduler, tjenester og kurs for barnevernssystemet.',
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
