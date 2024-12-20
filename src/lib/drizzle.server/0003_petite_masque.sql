ALTER TABLE "changesets_001" ADD COLUMN "created_by_id" varchar(36) NOT NULL;--> statement-breakpoint
ALTER TABLE "changesets_001" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "changesets_001" ADD CONSTRAINT "changesets_001_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
