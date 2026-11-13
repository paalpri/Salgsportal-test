import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp
} from 'drizzle-orm/pg-core';
import type { PriceGroup } from '../../prices.ts';
import { user } from './auth.schema.ts';

export * from './auth.schema.ts';

const id = () => integer().primaryKey().generatedAlwaysAsIdentity();
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
	timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date());

export const municipality = pgTable('municipality', {
	id: id(),
	name: text().notNull().unique(),
	number: text(),
	county: text(),
	createdAt: createdAt()
});

export const postKind = pgEnum('post_kind', ['news', 'release', 'ad']);

export const post = pgTable(
	'post',
	{
		id: id(),
		kind: postKind().notNull().default('news'),
		title: text().notNull(),
		slug: text().notNull().unique(),
		excerpt: text().notNull().default(''),
		body: text().notNull().default(''),
		imageUrl: text(),
		ctaLabel: text(),
		ctaUrl: text(),
		published: boolean().notNull().default(false),
		pinned: boolean().notNull().default(false),
		authorId: text().references(() => user.id, { onDelete: 'set null' }),
		publishedAt: timestamp({ withTimezone: true }),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.kind, t.published, t.publishedAt)]
);

export const productCategory = pgTable('product_category', {
	id: id(),
	name: text().notNull(),
	slug: text().notNull().unique(),
	description: text().notNull().default(''),
	sortOrder: integer().notNull().default(0)
});

export const product = pgTable('product', {
	id: id(),
	categoryId: integer().references(() => productCategory.id, { onDelete: 'set null' }),
	name: text().notNull(),
	slug: text().notNull().unique(),
	summary: text().notNull().default(''),
	description: text().notNull().default(''),
	priceNok: integer(),
	priceUnit: text(),
	/** Shows the headline price as «Fra …» when the price list has several levels. */
	priceFrom: boolean().notNull().default(false),
	prices: jsonb().$type<PriceGroup[]>().notNull().default([]),
	imageUrl: text(),
	/** Where the kommune actually buys or orders the product; the portal only links to it. */
	orderUrl: text(),
	isNew: boolean().notNull().default(false),
	active: boolean().notNull().default(true),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const wishCategory = pgTable('wish_category', {
	id: id(),
	name: text().notNull(),
	description: text().notNull().default(''),
	sortOrder: integer().notNull().default(0),
	createdAt: createdAt()
});

export const wishStatus = pgEnum('wish_status', [
	'new',
	'reviewing',
	'planned',
	'done',
	'declined'
]);

/** Sent anonymously from the wishlist; only admins can see wishes. */
export const wish = pgTable(
	'wish',
	{
		id: id(),
		municipalityId: integer().references(() => municipality.id, { onDelete: 'set null' }),
		categoryId: integer().references(() => wishCategory.id, { onDelete: 'set null' }),
		title: text().notNull(),
		description: text().notNull(),
		status: wishStatus().notNull().default('new'),
		adminNote: text().notNull().default(''),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.createdAt)]
);

/** Admin-edited page content, one JSON document per section (see #lib/site-content.ts). */
export const siteContent = pgTable('site_content', {
	key: text().primaryKey(),
	data: jsonb().notNull(),
	updatedAt: updatedAt()
});

export const productRelations = relations(product, ({ one }) => ({
	category: one(productCategory, {
		fields: [product.categoryId],
		references: [productCategory.id]
	})
}));
