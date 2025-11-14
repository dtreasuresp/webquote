-- CreateTable
CREATE TABLE "PackageSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "hostingPrice" REAL NOT NULL,
    "mailboxPrice" REAL NOT NULL,
    "dominioPrice" REAL NOT NULL,
    "mesesGratis" INTEGER NOT NULL,
    "mesesPago" INTEGER NOT NULL,
    "gestionPrecio" REAL NOT NULL,
    "gestionMesesGratis" INTEGER NOT NULL,
    "gestionMesesPago" INTEGER NOT NULL,
    "desarrollo" REAL NOT NULL,
    "descuento" INTEGER NOT NULL,
    "otrosServicios" JSONB NOT NULL,
    "costoInicial" REAL NOT NULL,
    "costoAño1" REAL NOT NULL,
    "costoAño2" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "PackageSnapshot_createdAt_idx" ON "PackageSnapshot"("createdAt");
