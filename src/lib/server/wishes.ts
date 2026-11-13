import { asc } from 'drizzle-orm';
import { db } from './db/index.ts';
import { wishCategory } from './db/schema.ts';

export function listWishCategories() {
	return db
		.select({ id: wishCategory.id, name: wishCategory.name, description: wishCategory.description })
		.from(wishCategory)
		.orderBy(asc(wishCategory.sortOrder), asc(wishCategory.name));
}
