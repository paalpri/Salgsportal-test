import { eq } from 'drizzle-orm';
import { db } from './db/index.ts';
import { siteContent } from './db/schema.ts';

/** Stored fields override the defaults, so new fields can be added without migrating stored rows. */
export async function readContent<T extends object>(key: string, defaults: T): Promise<T> {
	const [row] = await db.select().from(siteContent).where(eq(siteContent.key, key));
	return { ...defaults, ...(row?.data as Partial<T> | undefined) };
}

export async function writeContent(key: string, data: object) {
	await db
		.insert(siteContent)
		.values({ key, data })
		.onConflictDoUpdate({ target: siteContent.key, set: { data } });
}
