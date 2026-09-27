-- Ingestion watermarks also retain ignored posts, preventing stale resurrection.
CREATE TABLE news_post_state (
  channel_id TEXT NOT NULL,
  message_id INTEGER NOT NULL CHECK(message_id > 0),
  event_at INTEGER NOT NULL,
  update_id INTEGER NOT NULL,
  media_group_id TEXT,
  PRIMARY KEY(channel_id, message_id)
) STRICT;
ALTER TABLE news ADD COLUMN media_group_id TEXT;
CREATE INDEX news_album ON news(channel_id, media_group_id, hidden, message_id);
