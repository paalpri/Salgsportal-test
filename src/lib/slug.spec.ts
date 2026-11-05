import { describe, expect, it } from 'vitest';
import { slugify } from './slug.ts';

describe('slugify', () => {
	it('transliterates Norwegian letters and collapses punctuation', () => {
		expect(slugify('Øvre Eiker – Barnevern & Familie!')).toBe('ovre-eiker-barnevern-familie');
		expect(slugify('  Ålesund Æble  ')).toBe('alesund-aeble');
		expect(slugify('Café Tromsø')).toBe('cafe-tromso');
	});
});
