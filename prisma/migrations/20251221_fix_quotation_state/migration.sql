-- Crear el nuevo enum QuotationState con 7 valores (si no existe)
DO $$ BEGIN
    CREATE TYPE "QuotationState" AS ENUM (
        'CARGADA',
        'ACTIVA',
        'INACTIVA',
        'ACEPTADA',
        'RECHAZADA',
        'NUEVA_PROPUESTA',
        'EXPIRADA'
    );
EXCEPTION
    WHEN duplicate_object THEN
        -- El tipo ya existe, intentamos agregar los nuevos valores
        BEGIN
            ALTER TYPE "QuotationState" ADD VALUE 'ACEPTADA';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER TYPE "QuotationState" ADD VALUE 'RECHAZADA';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER TYPE "QuotationState" ADD VALUE 'NUEVA_PROPUESTA';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
        BEGIN
            ALTER TYPE "QuotationState" ADD VALUE 'EXPIRADA';
        EXCEPTION WHEN OTHERS THEN NULL;
        END;
END $$;

-- Agregar la columna estado si no existe
ALTER TABLE "QuotationConfig"
ADD COLUMN IF NOT EXISTS "estado" "QuotationState" DEFAULT 'CARGADA';

-- Agregar columnas de auditoría si no existen
ALTER TABLE "QuotationConfig"
ADD COLUMN IF NOT EXISTS "activadoEn" TIMESTAMP(3);

ALTER TABLE "QuotationConfig"
ADD COLUMN IF NOT EXISTS "inactivadoEn" TIMESTAMP(3);

-- Crear índice para estado si no existe
CREATE INDEX IF NOT EXISTS "QuotationConfig_estado_idx" ON "QuotationConfig"("estado");
