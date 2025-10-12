-- Plan データのシード

-- 既存のプランデータを削除
DELETE FROM plan;

-- プランデータの挿入
INSERT OR IGNORE INTO plan (id, name, maxPhotos) VALUES ('free', 'Free', 1000);
INSERT OR IGNORE INTO plan (id, name, maxPhotos) VALUES ('pro', 'Pro', 5000);
INSERT OR IGNORE INTO plan (id, name, maxPhotos) VALUES ('premium', 'Premium', 100000);
