/*
  Warnings:

  - You are about to drop the column `dominioPrice` on the `PackageSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `hostingPrice` on the `PackageSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `mailboxPrice` on the `PackageSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `mesesGratis` on the `PackageSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `mesesPago` on the `PackageSnapshot` table. All the data in the column will be lost.
  - Added the required column `serviciosBase` to the `PackageSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PackageSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "serviciosBase" JSONB NOT NULL,
    "gestionPrecio" REAL NOT NULL,
    "gestionMesesGratis" INTEGER NOT NULL,
    "gestionMesesPago" INTEGER NOT NULL,
    "desarrollo" REAL NOT NULL,
    "descuento" INTEGER NOT NULL,
    "tipo" TEXT,
    "descripcion" TEXT,
    "otrosServicios" JSONB NOT NULL,
    "costoInicial" REAL NOT NULL,
    "costoAño1" REAL NOT NULL,
    "costoAño2" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PackageSnapshot" ("activo", "costoAño1", "costoAño2", "costoInicial", "createdAt", "desarrollo", "descuento", "gestionMesesGratis", "gestionMesesPago", "gestionPrecio", "id", "nombre", "otrosServicios", "updatedAt") SELECT "activo", "costoAño1", "costoAño2", "costoInicial", "createdAt", "desarrollo", "descuento", "gestionMesesGratis", "gestionMesesPago", "gestionPrecio", "id", "nombre", "otrosServicios", "updatedAt" FROM "PackageSnapshot";
DROP TABLE "PackageSnapshot";
ALTER TABLE "new_PackageSnapshot" RENAME TO "PackageSnapshot";
CREATE INDEX "PackageSnapshot_createdAt_idx" ON "PackageSnapshot"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
