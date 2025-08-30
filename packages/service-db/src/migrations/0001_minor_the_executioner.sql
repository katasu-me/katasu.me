CREATE TABLE `photo` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`filename` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`title` text,
	`is_hidden` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_photo_user_id_created_at` ON `photo` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `photo_tag` (
	`photo_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`photo_id`, `tag_id`),
	FOREIGN KEY (`photo_id`) REFERENCES `photo`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_photo_tag_photo_id` ON `photo_tag` (`photo_id`);--> statement-breakpoint
CREATE INDEX `idx_photo_tag_tag_id` ON `photo_tag` (`tag_id`);--> statement-breakpoint
CREATE TABLE `tag` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`photo_count` integer DEFAULT 0 NOT NULL,
	`is_hidden` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_tag_user_id_photo_count` ON `tag` (`user_id`,`photo_count`);--> statement-breakpoint
CREATE INDEX `idx_tag_user_id_name` ON `tag` (`user_id`,`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_tag_name` ON `tag` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `plan` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plan_name_unique` ON `plan` (`name`);--> statement-breakpoint
ALTER TABLE `user` ADD `plan` text DEFAULT 'free' NOT NULL REFERENCES plan(id);--> statement-breakpoint
ALTER TABLE `user` ADD `maxPhotos` integer DEFAULT 1000 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `uploadedPhotos` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `isActive` integer DEFAULT true NOT NULL;