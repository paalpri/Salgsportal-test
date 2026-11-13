import { z } from 'zod';
import { longText, parseForm, text } from '#lib/server/forms.ts';
import { readContent, writeContent } from '#lib/server/site-content.ts';
import { defaultWelcome, KEY_FIGURE_SLOTS, type Welcome } from '#lib/site-content.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	welcome: await readContent('welcome', defaultWelcome)
});

const link = longText(500).refine(
	(v) => v === '' || /^(https?:\/\/|\/)/.test(v),
	'Må starte med https:// eller /'
);
const slots = Array.from({ length: KEY_FIGURE_SLOTS }, (_, i) => i);

const schema = z.object({
	title: text(120),
	body: longText(700),
	primaryLabel: longText(40),
	primaryUrl: link,
	secondaryLabel: longText(40),
	secondaryUrl: link,
	imageUrl: link,
	...Object.fromEntries(
		slots.flatMap((i) => [
			[`figure${i}Value`, longText(20)],
			[`figure${i}Label`, longText(80)]
		])
	)
});

export const actions: Actions = {
	save: async ({ request }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;
		const fields = data as Record<string, string>;
		const welcome: Welcome = {
			title: data.title,
			body: data.body,
			primaryLabel: data.primaryLabel,
			primaryUrl: data.primaryUrl,
			secondaryLabel: data.secondaryLabel,
			secondaryUrl: data.secondaryUrl,
			imageUrl: data.imageUrl,
			figures: slots
				.map((i) => ({ value: fields[`figure${i}Value`], label: fields[`figure${i}Label`] }))
				.filter((f) => f.value)
		};
		await writeContent('welcome', welcome);
	},
	reset: async () => {
		await writeContent('welcome', defaultWelcome);
	}
};
