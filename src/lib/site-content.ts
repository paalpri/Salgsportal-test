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
};

export const defaultWelcome: Welcome = {
	eyebrow: 'Barnevernssystemet',
	title: 'Velkommen til Kommuneportalen',
	body: 'Her samler vi alt dere trenger rundt barnevernssystemet: nyheter og driftsmeldinger, et forum der kommunene hjelper hverandre, og en katalog med moduler, kurs og tjenester.',
	primaryLabel: 'Utforsk produktene',
	primaryUrl: '/produkter',
	secondaryLabel: 'Still et spørsmål i forumet',
	secondaryUrl: '/forum/ny',
	imageUrl: ''
};
