ALTER TABLE `notes` ADD `shared` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `shared_permission` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `shared_db_id` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `shared_db_user_id` text;