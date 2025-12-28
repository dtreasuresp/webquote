-- Agregar enum QuotationState si no existe
DO $$ BEGIN
    CREATE TYPE "QuotationState" AS ENUM ('CARGADA', 'ACTIVA', 'INACTIVA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Agregar columna estado a QuotationConfig
ALTER TABLE "QuotationConfig" ADD COLUMN IF NOT EXISTS "estado" "QuotationState" DEFAULT 'CARGADA';

-- Agregar columnas de auditoría
ALTER TABLE "QuotationConfig" ADD COLUMN IF NOT EXISTS "activadoEn" TIMESTAMP(3);
ALTER TABLE "QuotationConfig" ADD COLUMN IF NOT EXISTS "inactivadoEn" TIMESTAMP(3);

-- Agregar índice al estado
CREATE INDEX IF NOT EXISTS "QuotationConfig_estado_idx" ON "QuotationConfig"("estado");
