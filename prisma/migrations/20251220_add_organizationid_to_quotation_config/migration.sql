-- Add organizationId column to QuotationConfig table
ALTER TABLE "QuotationConfig" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'QuotationConfig_organizationId_fkey'
  ) THEN
    ALTER TABLE "QuotationConfig" ADD CONSTRAINT "QuotationConfig_organizationId_fkey" 
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS "QuotationConfig_organizationId_idx" ON "QuotationConfig"("organizationId");
