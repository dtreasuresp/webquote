
-- Limpiar valores vacíos convirtiendo a NULL con NULLIF
UPDATE "public"."QuotationConfig"
SET "estado" = NULL
WHERE "estado" IS NOT NULL AND "estado"::text = '';

-- Poblar estado desde activo para los que están NULL
UPDATE "public"."QuotationConfig"
SET "estado" = CASE 
  WHEN "activo" = true THEN 'ACTIVA'
  WHEN "activo" = false THEN 'INACTIVA'
  ELSE 'CARGADA'
END
WHERE "estado" IS NULL;

-- Obtener estadísticas
SELECT 'Resumen de Estados:' as info;
SELECT 
  COALESCE("estado"::text, 'NULL') as estado,
  COUNT(*) as total
FROM "public"."QuotationConfig"
GROUP BY "estado"
ORDER BY "estado";
    