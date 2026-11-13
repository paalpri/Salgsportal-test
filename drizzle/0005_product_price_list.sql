ALTER TABLE "product" ADD COLUMN "price_from" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "prices" jsonb DEFAULT '[]'::jsonb NOT NULL;