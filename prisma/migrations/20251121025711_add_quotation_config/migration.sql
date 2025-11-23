-- CreateTable
CREATE TABLE "QuotationConfig" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tiempoValidez" INTEGER NOT NULL DEFAULT 30,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "presupuesto" TEXT NOT NULL DEFAULT '',
    "moneda" TEXT NOT NULL DEFAULT 'USD',
    "empresa" TEXT NOT NULL DEFAULT '',
    "sector" TEXT NOT NULL DEFAULT '',
    "ubicacion" TEXT NOT NULL DEFAULT '',
    "profesional" TEXT NOT NULL DEFAULT '',
    "empresaProveedor" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "ubicacionProveedor" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuotationConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuotationConfig_createdAt_idx" ON "QuotationConfig"("createdAt");
