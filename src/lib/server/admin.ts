import { fail, type RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { AnyPgColumn, PgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import { slugify } from '#lib/slug.ts';
import { db } from './db/index.ts';
import { parseForm } from './forms.ts';

/** Appends -2, -3 … until `taken` says the slug is free. */
export async function uniqueSlug(text: string, taken: (slug: string) => Promise<boolean>) {
	const base = slugify(text) || 'element';
	let slug = base;
	for (let n = 2; await taken(slug); n++) slug = `${base}-${n}`;
	return slug;
}

/** Drizzle wraps driver errors, so the Postgres code may sit on `cause`. */
export function pgErrorCode(e: unknown): string | undefined {
	const err = e as { code?: string; cause?: { code?: string } };
	return err?.code ?? err?.cause?.code;
}

export function constraintMessage(e: unknown) {
	const code = pgErrorCode(e);
	if (code === '23505') return 'Finnes allerede – navn eller adresse må være unik.';
	if (code === '23503') return 'Kan ikke slettes fordi det er i bruk.';
	return null;
}

/**
 * create/update/delete form actions for simple admin-managed lists rendered with <InlineEditor>.
 * `prepare` derives extra columns (e.g. slug) from the parsed form.
 */
export function crudActions<S extends z.ZodObject>(
	table: PgTable & { id: AnyPgColumn },
	schema: S,
	prepare: (data: z.output<S>) => Record<string, unknown> = (data) => data
) {
	const withId = schema.extend({ id: z.coerce.number().int() });

	async function run(write: () => Promise<unknown>) {
		try {
			await write();
		} catch (e) {
			const message = constraintMessage(e);
			if (message) return fail(400, { message });
			throw e;
		}
	}

	return {
		create: async ({ request }: RequestEvent) => {
			const { data, failure } = await parseForm(request, schema);
			if (failure) return failure;
			return run(() => db.insert(table).values(prepare(data) as never));
		},
		update: async ({ request }: RequestEvent) => {
			const { data, failure } = await parseForm(request, withId);
			if (failure) return failure;
			const { id, ...rest } = data;
			return run(() =>
				db
					.update(table)
					.set(prepare(rest as z.output<S>) as never)
					.where(eq(table.id, id))
			);
		},
		delete: async ({ request }: RequestEvent) => {
			const id = Number((await request.formData()).get('id'));
			return run(() => db.delete(table).where(eq(table.id, id)));
		}
	};
}
