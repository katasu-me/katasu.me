ALTER TABLE `user` ADD `customUrl` text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_customUrl_unique` ON `user` (`customUrl`);