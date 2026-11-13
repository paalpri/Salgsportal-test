DELETE FROM "post" WHERE "kind" = 'ops';--> statement-breakpoint
ALTER TABLE "forum_category" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_reply" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "forum_thread" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "forum_category" CASCADE;--> statement-breakpoint
DROP TABLE "forum_reply" CASCADE;--> statement-breakpoint
DROP TABLE "forum_thread" CASCADE;--> statement-breakpoint
ALTER TABLE "wish" DROP CONSTRAINT "wish_author_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "kind" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "kind" SET DEFAULT 'news'::text;--> statement-breakpoint
DROP TYPE "public"."post_kind";--> statement-breakpoint
CREATE TYPE "public"."post_kind" AS ENUM('news', 'release', 'ad');--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "kind" SET DEFAULT 'news'::"public"."post_kind";--> statement-breakpoint
ALTER TABLE "post" ALTER COLUMN "kind" SET DATA TYPE "public"."post_kind" USING "kind"::"public"."post_kind";--> statement-breakpoint
DROP INDEX "wish_author_id_created_at_index";--> statement-breakpoint
ALTER TABLE "municipality" DROP COLUMN "email_domain";--> statement-breakpoint
ALTER TABLE "wish" DROP COLUMN "author_id";