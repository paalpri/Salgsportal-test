export const postKinds = {
	release: {
		label: 'Endring',
		plural: 'Endringer i løsningen',
		description: 'Ny versjon eller endret funksjonalitet i Modulus Barn.'
	},
	news: { label: 'Nyhet', plural: 'Nyheter', description: 'Generelle nyheter og kunngjøringer.' },
	ad: {
		label: 'Kampanje',
		plural: 'Kampanjer',
		description: 'Nye moduler og tilbud. Den nyeste vises på forsiden.'
	}
} as const;

export type PostKind = keyof typeof postKinds;
export const postKindKeys = Object.keys(postKinds) as PostKind[];
