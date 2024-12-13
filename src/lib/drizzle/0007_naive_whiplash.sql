ALTER TABLE `notes` ADD `is_deleted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `bg_color` text DEFAULT '#ffffff' NOT NULL;