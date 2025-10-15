CREATE INDEX `idx_image_tag_tag_id` ON `image_tag` (`tag_id`);--> statement-breakpoint
CREATE INDEX `idx_image_tag_image_id` ON `image_tag` (`image_id`);--> statement-breakpoint
CREATE INDEX `idx_tag_user_id` ON `tag` (`user_id`);