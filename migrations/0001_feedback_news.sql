-- Dates are UTC ISO strings supplied by future server handlers.
-- No runtime schema creation; apply with Wrangler D1 migrations.
CREATE TABLE feedback (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('results', 'athlete', 'app', 'suggestion', 'other')),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 10 AND 4000),
  contact_email TEXT CHECK (contact_email IS NULL OR length(contact_email) BETWEEN 3 AND 254),
  screen TEXT NOT NULL,
  route TEXT NOT NULL,
  athlete_id INTEGER,
  athlete_name TEXT,
  race_edition_id TEXT,
  race_name TEXT,
  build_version TEXT NOT NULL,
  build_commit TEXT NOT NULL,
  viewport TEXT CHECK (viewport IS NULL OR json_valid(viewport)),
  client_info TEXT CHECK (client_info IS NULL OR length(client_info) <= 512),
  delivery_status TEXT NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
  delivery_attempts INTEGER NOT NULL DEFAULT 0 CHECK (delivery_attempts >= 0),
  last_delivery_at TEXT,
  next_delivery_at TEXT
) STRICT;
CREATE INDEX feedback_retry ON feedback(delivery_status, next_delivery_at, created_at);
CREATE INDEX feedback_created_at ON feedback(created_at);

CREATE TABLE news (
  id TEXT PRIMARY KEY NOT NULL,
  channel_id TEXT NOT NULL,
  message_id INTEGER NOT NULL CHECK (message_id > 0),
  published_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
  excerpt TEXT NOT NULL CHECK (length(excerpt) <= 1000),
  telegram_url TEXT NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1)),
  created_at TEXT NOT NULL,
  UNIQUE (channel_id, message_id)
) STRICT;
CREATE INDEX news_feed ON news(hidden, published_at DESC, message_id DESC);
-- Future webhook handler uses UPSERT on (channel_id, message_id) and compares
-- updated_at to ignore stale edits/retries. Authentication belongs to the handler.
