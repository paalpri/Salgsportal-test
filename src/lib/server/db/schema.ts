import { relations } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique
} from 'drizzle-orm/pg-core';
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
	emailDomain: text(),
	createdAt: createdAt()
});

export const forumCategory = pgTable('forum_category', {
	id: id(),
	name: text().notNull(),
	slug: text().notNull().unique(),
	description: text().notNull().default(''),
	sortOrder: integer().notNull().default(0),
	createdAt: createdAt()
});

export const forumThread = pgTable(
	'forum_thread',
	{
		id: id(),
		categoryId: integer()
			.notNull()
			.references(() => forumCategory.id, { onDelete: 'cascade' }),
		authorId: text().references(() => user.id, { onDelete: 'set null' }),
		title: text().notNull(),
		body: text().notNull(),
		pinned: boolean().notNull().default(false),
		locked: boolean().notNull().default(false),
		acceptedReplyId: integer(),
		lastActivityAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
		createdAt: createdAt(),
		editedAt: timestamp({ withTimezone: true })
	},
	(t) => [index().on(t.categoryId, t.lastActivityAt)]
);

export const forumReply = pgTable(
	'forum_reply',
	{
		id: id(),
		threadId: integer()
			.notNull()
			.references(() => forumThread.id, { onDelete: 'cascade' }),
		authorId: text().references(() => user.id, { onDelete: 'set null' }),
		body: text().notNull(),
		createdAt: createdAt(),
		editedAt: timestamp({ withTimezone: true })
	},
	(t) => [index().on(t.threadId, t.createdAt)]
);

export const postKind = pgEnum('post_kind', ['news', 'ad']);

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
	imageUrl: text(),
	isNew: boolean().notNull().default(false),
	active: boolean().notNull().default(true),
	createdAt: createdAt(),
	updatedAt: updatedAt()
});

export const cartItem = pgTable(
	'cart_item',
	{
		id: id(),
		municipalityId: integer()
			.notNull()
			.references(() => municipality.id, { onDelete: 'cascade' }),
		productId: integer()
			.notNull()
			.references(() => product.id, { onDelete: 'cascade' }),
		quantity: integer().notNull().default(1),
		note: text().notNull().default(''),
		addedById: text().references(() => user.id, { onDelete: 'set null' }),
		createdAt: createdAt()
	},
	(t) => [unique().on(t.municipalityId, t.productId)]
);

export const quoteStatus = pgEnum('quote_status', ['new', 'in_progress', 'answered', 'closed']);

export const quoteRequest = pgTable(
	'quote_request',
	{
		id: id(),
		municipalityId: integer()
			.notNull()
			.references(() => municipality.id, { onDelete: 'restrict' }),
		submittedById: text().references(() => user.id, { onDelete: 'set null' }),
		status: quoteStatus().notNull().default('new'),
		message: text().notNull().default(''),
		adminNote: text().notNull().default(''),
		createdAt: createdAt(),
		updatedAt: updatedAt()
	},
	(t) => [index().on(t.status, t.createdAt)]
);

/** Product name and price are copied so a request stays readable after the catalog changes. */
export const quoteRequestItem = pgTable('quote_request_item', {
	id: id(),
	requestId: integer()
		.notNull()
		.references(() => quoteRequest.id, { onDelete: 'cascade' }),
	productId: integer().references(() => product.id, { onDelete: 'set null' }),
	productName: text().notNull(),
	unitPriceNok: integer(),
	priceUnit: text(),
	quantity: integer().notNull(),
	note: text().notNull().default('')
});

export const moduleSetting = pgTable('module_setting', {
	key: text().primaryKey(),
	enabled: boolean().notNull().default(true),
	updatedAt: updatedAt()
});

export const forumThreadRelations = relations(forumThread, ({ one, many }) => ({
	category: one(forumCategory, {
		fields: [forumThread.categoryId],
		references: [forumCategory.id]
	}),
	author: one(user, { fields: [forumThread.authorId], references: [user.id] }),
	replies: many(forumReply)
}));

export const forumReplyRelations = relations(forumReply, ({ one }) => ({
	thread: one(forumThread, { fields: [forumReply.threadId], references: [forumThread.id] }),
	author: one(user, { fields: [forumReply.authorId], references: [user.id] })
}));

export const productRelations = relations(product, ({ one }) => ({
	category: one(productCategory, {
		fields: [product.categoryId],
		references: [productCategory.id]
	})
}));

export const quoteRequestRelations = relations(quoteRequest, ({ one, many }) => ({
	municipality: one(municipality, {
		fields: [quoteRequest.municipalityId],
		references: [municipality.id]
	}),
	submittedBy: one(user, { fields: [quoteRequest.submittedById], references: [user.id] }),
	items: many(quoteRequestItem)
}));

export const quoteRequestItemRelations = relations(quoteRequestItem, ({ one }) => ({
	request: one(quoteRequest, {
		fields: [quoteRequestItem.requestId],
		references: [quoteRequest.id]
	})
}));
