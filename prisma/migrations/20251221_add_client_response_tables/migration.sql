-- Agregar nuevos campos a QuotationConfig
ALTER TABLE "QuotationConfig" ADD COLUMN "respondidoEn" TIMESTAMP(3),
ADD COLUMN "diasParaAceptar" INTEGER,
ADD COLUMN "expiradoEn" TIMESTAMP(3);

-- Crear tabla ClientResponse
CREATE TABLE "ClientResponse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quotationConfigId" TEXT NOT NULL,
    "clientUserId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "mensaje" TEXT,
    "respondidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diasRestantes" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClientResponse_quotationConfigId_fkey" FOREIGN KEY ("quotationConfigId") REFERENCES "QuotationConfig" ("id") ON DELETE CASCADE
);

-- Crear índices para ClientResponse
CREATE INDEX "ClientResponse_quotationConfigId_idx" ON "ClientResponse"("quotationConfigId");
CREATE INDEX "ClientResponse_clientUserId_idx" ON "ClientResponse"("clientUserId");
CREATE INDEX "ClientResponse_responseType_idx" ON "ClientResponse"("responseType");
CREATE INDEX "ClientResponse_respondidoEn_idx" ON "ClientResponse"("respondidoEn");

-- Crear tabla Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientResponseId" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoNotificacion" TEXT NOT NULL,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "leidoEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Notification_clientResponseId_fkey" FOREIGN KEY ("clientResponseId") REFERENCES "ClientResponse" ("id") ON DELETE SET NULL
);

-- Crear índices para Notification
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_clientResponseId_idx" ON "Notification"("clientResponseId");
CREATE INDEX "Notification_leida_idx" ON "Notification"("leida");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- Crear índices adicionales en QuotationConfig para los nuevos campos
CREATE INDEX "QuotationConfig_respondidoEn_idx" ON "QuotationConfig"("respondidoEn");
CREATE INDEX "QuotationConfig_expiradoEn_idx" ON "QuotationConfig"("expiradoEn");
