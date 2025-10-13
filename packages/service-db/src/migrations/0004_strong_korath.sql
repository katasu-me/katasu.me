ALTER TABLE `photo` RENAME TO `image`;--> statement-breakpoint
ALTER TABLE `photo_tag` RENAME TO `image_tag`;--> statement-breakpoint
ALTER TABLE `image_tag` RENAME COLUMN "photo_id" TO "image_id";--> statement-breakpoint
ALTER TABLE `tag` RENAME COLUMN "photo_count" TO "image_count";--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_image` (
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
INSERT INTO `__new_image`("id", "user_id", "filename", "width", "height", "title", "is_hidden", "created_at") SELECT "id", "user_id", "filename", "width", "height", "title", "is_hidden", "created_at" FROM `image`;--> statement-breakpoint
DROP TABLE `image`;--> statement-breakpoint
ALTER TABLE `__new_image` RENAME TO `image`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_image_user_id_created_at` ON `image` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_image_tag` (
	`image_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`image_id`, `tag_id`),
	FOREIGN KEY (`image_id`) REFERENCES `image`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_image_tag`("image_id", "tag_id") SELECT "image_id", "tag_id" FROM `image_tag`;--> statement-breakpoint
DROP TABLE `image_tag`;--> statement-breakpoint
ALTER TABLE `__new_image_tag` RENAME TO `image_tag`;--> statement-breakpoint
CREATE INDEX `idx_image_tag_image_id` ON `image_tag` (`image_id`);--> statement-breakpoint
CREATE INDEX `idx_image_tag_tag_id` ON `image_tag` (`tag_id`);--> statement-breakpoint
DROP INDEX `idx_tag_user_id_photo_count`;--> statement-breakpoint
CREATE INDEX `idx_tag_user_id_image_count` ON `tag` (`user_id`,`image_count`);