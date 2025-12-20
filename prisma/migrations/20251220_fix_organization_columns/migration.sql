-- Add missing columns to Organization table
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "direccion" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "ciudad" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "pais" TEXT;

-- Add missing organizationId column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "organizationId" TEXT;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'User_organizationId_fkey'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" 
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END
$$;

-- Create indices if they don't exist
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

