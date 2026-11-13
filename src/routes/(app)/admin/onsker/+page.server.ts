import { and, count, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { db } from '#lib/server/db/index.ts';
import { municipality, user, wish, wishCategory } from '#lib/server/db/schema.ts';
import { listWishCategories } from '#lib/server/wishes.ts';
import { wishStatusKeys, type WishStatus } from '#lib/wish-status.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categoryParam = url.searchParams.get('kategori');
	const status = wishStatusKeys.find((s) => s === url.searchParams.get('status')) as
		WishStatus | undefined;

	const filters: SQL[] = [];
	if (categoryParam === 'ingen') filters.push(isNull(wish.categoryId));
	else if (categoryParam) filters.push(eq(wish.categoryId, Number(categoryParam)));
	if (status) filters.push(eq(wish.status, status));

	const [wishes, categories, perCategory] = await Promise.all([
		db
			.select({
				id: wish.id,
				title: wish.title,
				status: wish.status,
				createdAt: wish.createdAt,
				categoryName: wishCategory.name,
				authorName: user.name,
				municipalityName: municipality.name
			})
			.from(wish)
			.leftJoin(wishCategory, eq(wishCategory.id, wish.categoryId))
			.leftJoin(user, eq(user.id, wish.authorId))
			.leftJoin(municipality, eq(municipality.id, wish.municipalityId))
			.where(and(...filters))
			.orderBy(desc(wish.createdAt)),
		listWishCategories(),
		db.select({ categoryId: wish.categoryId, n: count() }).from(wish).groupBy(wish.categoryId)
	]);

	const counts = new Map(perCategory.map((r) => [r.categoryId, r.n]));
	return {
		wishes,
		categories: categories.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 })),
		uncategorized: counts.get(null) ?? 0,
		total: perCategory.reduce((sum, r) => sum + r.n, 0),
		category: categoryParam,
		status: status ?? null
	};
};
