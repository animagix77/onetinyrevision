CREATE TABLE `chef_profiles` (
	`owner` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `plates` ADD `drink` text;