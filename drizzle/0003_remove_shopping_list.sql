DROP TABLE "cart_item" CASCADE;--> statement-breakpoint
DROP TABLE "module_setting" CASCADE;--> statement-breakpoint
DROP TABLE "quote_request" CASCADE;--> statement-breakpoint
DROP TABLE "quote_request_item" CASCADE;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "order_url" text;--> statement-breakpoint
DROP TYPE "public"."quote_status";