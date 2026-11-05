export const quoteStatuses = {
	new: { label: 'Ny', variant: 'default' },
	in_progress: { label: 'Under behandling', variant: 'secondary' },
	answered: { label: 'Besvart', variant: 'outline' },
	closed: { label: 'Lukket', variant: 'outline' }
} as const;

export type QuoteStatus = keyof typeof quoteStatuses;
