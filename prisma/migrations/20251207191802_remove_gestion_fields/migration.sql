-- AlterTable: Remove gestion fields from PackageSnapshot
-- These fields are now obsolete as gestión is handled through otrosServicios

ALTER TABLE "PackageSnapshot" DROP COLUMN IF EXISTS "gestionPrecio";
ALTER TABLE "PackageSnapshot" DROP COLUMN IF EXISTS "gestionMesesGratis";
ALTER TABLE "PackageSnapshot" DROP COLUMN IF EXISTS "gestionMesesPago";
