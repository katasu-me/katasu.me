ALTER TABLE `user` ADD `isBanned` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `isActive`;