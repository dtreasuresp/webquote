-- CreateTable
CREATE TABLE "PackageSnapshot" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "serviciosBase" JSONB NOT NULL,
    "gestionPrecio" DOUBLE PRECISION NOT NULL,
    "gestionMesesGratis" INTEGER NOT NULL,
    "gestionMesesPago" INTEGER NOT NULL,
    "desarrollo" DOUBLE PRECISION NOT NULL,
    "descuento" INTEGER NOT NULL,
    "tipo" TEXT,
    "descripcion" TEXT,
    "emoji" TEXT,
    "tagline" TEXT,
    "precioHosting" DOUBLE PRECISION,
    "precioMailbox" DOUBLE PRECISION,
    "precioDominio" DOUBLE PRECISION,
    "tiempoEntrega" TEXT,
    "opcionesPago" JSONB,
    "descuentoPagoUnico" INTEGER,
    "otrosServicios" JSONB NOT NULL,
    "costoInicial" DOUBLE PRECISION NOT NULL,
    "costoAño1" DOUBLE PRECISION NOT NULL,
    "costoAño2" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageSnapshot_createdAt_idx" ON "PackageSnapshot"("createdAt");
