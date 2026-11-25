CREATE TABLE `plate_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`plate` text NOT NULL,
	`chef` text NOT NULL,
	`message` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`plate`) REFERENCES `plates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `plates` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`chef` text NOT NULL,
	`draft` text NOT NULL,
	`servings` text NOT NULL,
	`version` integer NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plates_owner_unique` ON `plates` (`owner`);