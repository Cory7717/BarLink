-- Add barType to Bar
ALTER TABLE "Bar" ADD COLUMN IF NOT EXISTS "barType" TEXT DEFAULT 'Unclassified';
CREATE INDEX IF NOT EXISTS "Bar_barType_idx" ON "Bar"("barType");
