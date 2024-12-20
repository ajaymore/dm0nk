CREATE TYPE "public"."share_intent" AS ENUM('read', 'read+update');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "changesets_001" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"db_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"changeset" text NOT NULL,
	"timestamp" integer NOT NULL,
	"resource_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "my_databases" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"db_ids" json DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shared_resources" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"resource_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"share_intent" "share_intent" NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "my_databases" ADD CONSTRAINT "my_databases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "shared_resources" ADD CONSTRAINT "shared_resources_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
