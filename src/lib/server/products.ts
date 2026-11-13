import { and, asc, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { db } from './db/index.ts';
import { product, productCategory } from './db/schema.ts';

export async function listProducts({
	categoryId,
	query,
	onlyNew,
	limit = 100
}: { categoryId?: number; query?: string; onlyNew?: boolean; limit?: number } = {}) {
	const filters: SQL[] = [eq(product.active, true)];
	if (categoryId) filters.push(eq(product.categoryId, categoryId));
	if (onlyNew) filters.push(eq(product.isNew, true));
	if (query) {
		const pattern = `%${query.replace(/[%_\\]/g, '\\$&')}%`;
		filters.push(or(ilike(product.name, pattern), ilike(product.summary, pattern))!);
	}

	return db
		.select({
			id: product.id,
			slug: product.slug,
			name: product.name,
			summary: product.summary,
			priceNok: product.priceNok,
			priceUnit: product.priceUnit,
			priceFrom: product.priceFrom,
			imageUrl: product.imageUrl,
			orderUrl: product.orderUrl,
			isNew: product.isNew,
			categoryName: productCategory.name
		})
		.from(product)
		.leftJoin(productCategory, eq(productCategory.id, product.categoryId))
		.where(and(...filters))
		.orderBy(desc(product.isNew), asc(product.name))
		.limit(limit);
}
