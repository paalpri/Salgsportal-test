/** A product's detailed prices. Prices are free text so they can say «Inkludert» or «+ reise». */
export type PriceGroup = { title: string; rows: { label: string; price: string }[] };

/**
 * Parses the admin text format: a line without «|» starts a group titled by that line, and
 * «label | price» adds a row to the current group. Rows before the first title get an untitled group.
 */
export function parsePriceList(text: string): PriceGroup[] {
	const groups: PriceGroup[] = [];
	for (const line of text.split('\n').map((l) => l.trim())) {
		if (!line) continue;
		const bar = line.indexOf('|');
		if (bar === -1) {
			groups.push({ title: line, rows: [] });
			continue;
		}
		if (!groups.length) groups.push({ title: '', rows: [] });
		groups.at(-1)!.rows.push({
			label: line.slice(0, bar).trim(),
			price: line.slice(bar + 1).trim()
		});
	}
	return groups.filter((g) => g.rows.length);
}

export function formatPriceList(groups: PriceGroup[]) {
	return groups
		.map((g) =>
			[g.title, ...g.rows.map((r) => `${r.label} | ${r.price}`)].filter(Boolean).join('\n')
		)
		.join('\n\n');
}
