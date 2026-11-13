export type KeyFigure = { value: string; label: string };

/**
 * The welcome section and the key figures on the front page. Only admins can change them, in
 * /admin/forside.
 */
export type Welcome = {
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
	title: 'Velkommen til Kommuneportalen',
	body: 'Her har vi samlet nyttig informasjon og tjenester for kommuner som bruker Modulus Barn. Hold deg oppdatert på nyheter, utforsk våre moduler og tjenester, finn aktuelle kurs og del gjerne dine ønsker og ideer til løsningen.',
	primaryLabel: 'Se siste nytt',
	primaryUrl: '/nyheter',
	secondaryLabel: 'Utforsk moduler og tjenester',
	secondaryUrl: '/produkter',
	imageUrl: '',
	figures: [
		{ value: '157', label: 'kommuner bruker Modulus Barn' },
		{ value: '160+', label: 'kommuner i løpet av 2026' },
		{ value: 'Over 50 %', label: 'av befolkningen er dekket' },
		{ value: '3000+', label: 'barnevernsansatte bruker løsningen' }
	]
};
