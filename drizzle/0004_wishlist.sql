CREATE TYPE "public"."wish_status" AS ENUM('new', 'reviewing', 'planned', 'done', 'declined');--> statement-breakpoint
CREATE TABLE "wish" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wish_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"author_id" text,
	"municipality_id" integer,
	"category_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "wish_status" DEFAULT 'new' NOT NULL,
	"admin_note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wish_category" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wish_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wish" ADD CONSTRAINT "wish_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wish" ADD CONSTRAINT "wish_municipality_id_municipality_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."municipality"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wish" ADD CONSTRAINT "wish_category_id_wish_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."wish_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wish_author_id_created_at_index" ON "wish" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "wish_status_created_at_index" ON "wish" USING btree ("status","created_at");