-- Distinguish explicit editorial seed approval from automated Telegram eligibility.
ALTER TABLE news ADD COLUMN source TEXT NOT NULL DEFAULT 'telegram'
  CHECK (source IN ('telegram', 'manually-approved-telegram-seed'));
