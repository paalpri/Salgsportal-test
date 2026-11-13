import Newspaper from '@lucide/svelte/icons/newspaper';
import Package from '@lucide/svelte/icons/package';
import Lightbulb from '@lucide/svelte/icons/lightbulb';

/**
 * Sections in the main navigation. To add a section: add an entry here and create its route folder
 * under src/routes/(app).
 */
export const modules = [
	{ label: 'Nyheter', href: '/nyheter', icon: Newspaper },
	{ label: 'Moduler og tjenester', href: '/produkter', icon: Package },
	{ label: 'Ønskeliste', href: '/onsker', icon: Lightbulb }
] as const;
