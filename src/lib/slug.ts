const replacements: Record<string, string> = { æ: 'ae', ø: 'o', å: 'a' };

export function slugify(text: string) {
	return text
		.toLowerCase()
		.replace(/[æøå]/g, (c) => replacements[c]!)
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
