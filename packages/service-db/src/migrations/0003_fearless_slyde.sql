ALTER TABLE `user` ADD `has_avatar` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `image`;