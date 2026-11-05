import { fail } from '@sveltejs/kit';
import { z } from 'zod';

export const text = (max = 200) =>
	z.string().trim().min(1, 'Må fylles ut').max(max, `Maks ${max} tegn`);

export const optionalText = (max = 5000) =>
	z
		.string()
		.trim()
		.max(max, `Maks ${max} tegn`)
		.optional()
		.transform((v) => v || null);

export const longText = (max = 20000) =>
	z
		.string()
		.trim()
		.max(max, `Maks ${max} tegn`)
		.optional()
		.transform((v) => v ?? '');

/** Unchecked checkboxes are absent from form data. */
export const checkbox = z
	.string()
	.optional()
	.transform((v) => v === 'on');

export const optionalInt = z
	.string()
	.trim()
	.optional()
	.transform((v) => (v ? Number(v) : null))
	.refine((v) => v === null || (Number.isInteger(v) && v >= 0), 'Må være et heltall');

export const optionalUrl = optionalText(500).refine(
	(v) => v === null || /^(https?:\/\/|\/)/.test(v),
	'Må starte med https:// eller /'
);

export type FormErrors = Record<string, string>;

export async function parseForm<T extends z.ZodType>(request: Request, schema: T) {
	const values = Object.fromEntries(
		[...(await request.formData())].filter(([, v]) => typeof v === 'string')
	) as Record<string, string>;
	const result = schema.safeParse(values);
	if (result.success) return { data: result.data as z.output<T>, failure: null };

	const errors: FormErrors = {};
	for (const issue of result.error.issues) errors[String(issue.path[0])] ??= issue.message;
	return {
		data: null,
		failure: fail(400, { values, errors, message: 'Sjekk feltene i skjemaet' })
	};
}
