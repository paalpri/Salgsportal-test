import { describe, expect, it } from 'vitest';
import { formatPriceList, parsePriceList } from './prices.ts';

describe('price list text', () => {
	it('groups rows under the nearest title and survives a round trip', () => {
		const text = [
			'Fysisk | 72 500 kr + reise',
			'',
			'Drift og vedlikehold',
			'  Under 10 000 innbyggere |18 857 kr/år ',
			'Tom overskrift',
			'Leverandør',
			'Visma | WS Voucher | 43 600 kr'
		].join('\n');

		const groups = parsePriceList(text);
		expect(groups).toEqual([
			{ title: '', rows: [{ label: 'Fysisk', price: '72 500 kr + reise' }] },
			{
				title: 'Drift og vedlikehold',
				rows: [{ label: 'Under 10 000 innbyggere', price: '18 857 kr/år' }]
			},
			{ title: 'Leverandør', rows: [{ label: 'Visma', price: 'WS Voucher | 43 600 kr' }] }
		]);
		expect(parsePriceList(formatPriceList(groups))).toEqual(groups);
	});
});
