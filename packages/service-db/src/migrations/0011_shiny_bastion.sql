PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_image` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`title` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`hidden_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_image`("id", "user_id", "width", "height", "title", "created_at", "updated_at", "hidden_at") SELECT "id", "user_id", "width", "height", "title", "created_at", "updated_at", "hidden_at" FROM `image`;--> statement-breakpoint
DROP TABLE `image`;--> statement-breakpoint
ALTER TABLE `__new_image` RENAME TO `image`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_image_user_id_created_at` ON `image` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `__new_tag` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`hidden_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_tag`("id", "user_id", "name", "created_at", "hidden_at") SELECT "id", "user_id", "name", "created_at", "hidden_at" FROM `tag`;--> statement-breakpoint
DROP TABLE `tag`;--> statement-breakpoint
ALTER TABLE `__new_tag` RENAME TO `tag`;--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_tag_name` ON `tag` (`user_id`,`name`);