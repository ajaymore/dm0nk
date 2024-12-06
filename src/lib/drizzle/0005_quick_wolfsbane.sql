PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'default' NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`list_display_view` text DEFAULT '' NOT NULL,
	`data` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`rand` text DEFAULT ''
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "type", "title", "list_display_view", "data", "created_at", "updated_at", "rand") SELECT "id", "type", '' as "title", '' as "list_display_view", "data", "created_at", "updated_at", "rand" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;