import { z } from 'zod';
import { longText, parseForm, text } from '#lib/server/forms.ts';
import { readContent, writeContent } from '#lib/server/site-content.ts';
import { defaultWelcome, type Welcome } from '#lib/site-content.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	welcome: await readContent('welcome', defaultWelcome)
});

const link = longText(500).refine(
	(v) => v === '' || /^(https?:\/\/|\/)/.test(v),
	'Må starte med https:// eller /'
);

const schema = z.object({
	eyebrow: longText(120),
	title: text(120),
	body: longText(600),
	primaryLabel: longText(40),
	primaryUrl: link,
	secondaryLabel: longText(40),
	secondaryUrl: link,
	imageUrl: link
}) satisfies z.ZodType<Welcome>;

export const actions: Actions = {
	save: async ({ request }) => {
		const { data, failure } = await parseForm(request, schema);
		if (failure) return failure;
		await writeContent('welcome', data);
	},
	reset: async () => {
		await writeContent('welcome', defaultWelcome);
	}
};
