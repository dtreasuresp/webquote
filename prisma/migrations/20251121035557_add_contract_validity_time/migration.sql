-- AlterTable
ALTER TABLE "QuotationConfig" ADD COLUMN     "tiempoVigenciaUnidad" TEXT NOT NULL DEFAULT 'meses',
ADD COLUMN     "tiempoVigenciaValor" INTEGER NOT NULL DEFAULT 12;
