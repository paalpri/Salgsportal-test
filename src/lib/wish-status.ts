export const wishStatuses = {
	new: { label: 'Mottatt', className: 'bg-secondary text-secondary-foreground' },
	reviewing: { label: 'Til vurdering', className: 'bg-primary text-primary-foreground' },
	planned: { label: 'Planlagt', className: 'bg-brand text-white' },
	done: { label: 'Levert', className: 'bg-success text-white' },
	declined: { label: 'Ikke aktuelt', className: 'bg-muted text-muted-foreground' }
} as const;

export type WishStatus = keyof typeof wishStatuses;
export const wishStatusKeys = Object.keys(wishStatuses) as WishStatus[];
