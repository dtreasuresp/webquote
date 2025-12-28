UPDATE "QuotationConfig"
SET estado = CASE 
  WHEN activo = true THEN 'ACTIVA'
  WHEN activo = false THEN 'INACTIVA'
  ELSE 'CARGADA'
END
WHERE estado IS NULL OR estado = '';
