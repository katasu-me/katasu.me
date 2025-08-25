-- Plan データのシード

-- 既存のプランデータを削除（必要に応じてコメントアウト）
-- DELETE FROM plan;

-- プランデータの挿入
INSERT OR IGNORE INTO plan (id, name) VALUES ('free', 'Free');
INSERT OR IGNORE INTO plan (id, name) VALUES ('pro', 'Pro');
INSERT OR IGNORE INTO plan (id, name) VALUES ('premium', 'Premium');
