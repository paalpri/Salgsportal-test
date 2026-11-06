export type KeyFigure = { value: string; label: string };

/** The welcome section at the top of the front page. Only admins can change it, in /admin/forside. */
export type Welcome = {
	eyebrow: string;
	title: string;
	body: string;
	primaryLabel: string;
	primaryUrl: string;
	secondaryLabel: string;
	secondaryUrl: string;
	imageUrl: string;
	figures: KeyFigure[];
};

export const KEY_FIGURE_SLOTS = 4;

export const defaultWelcome: Welcome = {
	eyebrow: 'DigiBarnevern · Modulus Barn',
	title: 'Kommuneportalen for Modulus Barn',
	body: 'Her samles kommunene som bruker og forvalter Modulus Barn. Følg med på hva som er endret i løsningen, se nye moduler og tjenester, og del erfaringer med andre kommuner. Kommunene bestemmer i fellesskap hvordan Modulus Barn skal utvikles videre, og ønskelisten er stedet å si fra.',
	primaryLabel: 'Se hva som er nytt',
	primaryUrl: '/nyheter?type=release',
	secondaryLabel: 'Spør andre kommuner',
	secondaryUrl: '/forum/ny',
	imageUrl: '',
	figures: [
		{ value: '157', label: 'kommuner bruker Modulus Barn' },
		{ value: '160+', label: 'kommuner i løpet av 2026' },
		{ value: 'Over 50 %', label: 'av befolkningen er dekket' },
		{ value: '3000+', label: 'barnevernsansatte bruker løsningen' }
	]
};
