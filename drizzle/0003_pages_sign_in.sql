CREATE TABLE `pages_sessions` (
	`hash` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`challenge` text,
	`expires` integer NOT NULL
);
