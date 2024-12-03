CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text,
	`data` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
