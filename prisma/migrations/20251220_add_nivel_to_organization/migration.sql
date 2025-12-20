-- Add nivel column to Organization table
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "nivel" TEXT NOT NULL DEFAULT 'RAIZ';

-- Create index for nivel
CREATE INDEX IF NOT EXISTS "Organization_nivel_idx" ON "Organization"("nivel");

-- Update all existing organizations without nivel to RAIZ (or calculate based on parent)
UPDATE "Organization" 
SET "nivel" = 'RAIZ' 
WHERE "nivel" IS NULL OR "nivel" = '';
