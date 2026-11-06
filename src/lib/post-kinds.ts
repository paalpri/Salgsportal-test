export const postKinds = {
	release: {
		label: 'Endring',
		plural: 'Endringer i løsningen',
		description: 'Ny versjon eller endret funksjonalitet i Modulus Barn.'
	},
	news: { label: 'Nyhet', plural: 'Nyheter', description: 'Generelle nyheter og kunngjøringer.' },
	ops: {
		label: 'Driftsmelding',
		plural: 'Driftsmeldinger',
		description: 'Vedlikehold, nedetid og feil. Vises som varsel øverst på forsiden i 14 dager.'
	},
	ad: {
		label: 'Kampanje',
		plural: 'Kampanjer',
		description: 'Nye moduler og tilbud. Den nyeste vises på forsiden.'
	}
} as const;

export type PostKind = keyof typeof postKinds;
export const postKindKeys = Object.keys(postKinds) as PostKind[];
