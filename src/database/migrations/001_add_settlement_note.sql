-- Adds a `note` column to the `settlements` table for optional user comments.
ALTER TABLE settlements ADD COLUMN IF NOT EXISTS note TEXT;
