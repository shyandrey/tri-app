-- Keep applied foundation migration unchanged. Legacy reports remain deliverable.
ALTER TABLE feedback ADD COLUMN request_hash TEXT;
ALTER TABLE feedback ADD COLUMN active_gender TEXT CHECK (active_gender IS NULL OR active_gender IN ('M', 'W'));
ALTER TABLE feedback ADD COLUMN delivery_lease TEXT;
-- next_delivery_at doubles as an expiring claim deadline; lease guards stale completion.
CREATE INDEX feedback_delivery_claim ON feedback(delivery_status, next_delivery_at, delivery_attempts);
