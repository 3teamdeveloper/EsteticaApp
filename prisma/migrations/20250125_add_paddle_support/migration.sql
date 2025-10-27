-- AlterTable Payment: Agregar soporte para múltiples proveedores de pago (MercadoPago y Paddle)

-- 1. Agregar columna provider con valor por defecto 'mercadopago'
ALTER TABLE "Payment" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'mercadopago';

-- 2. Hacer mpPaymentId nullable (solo se usa para MercadoPago)
ALTER TABLE "Payment" ALTER COLUMN "mpPaymentId" DROP NOT NULL;

-- 3. Agregar columnas para Paddle
ALTER TABLE "Payment" ADD COLUMN "paddleTransactionId" TEXT;
ALTER TABLE "Payment" ADD COLUMN "paddleSubscriptionId" TEXT;

-- 4. Crear índices únicos para Paddle
CREATE UNIQUE INDEX "Payment_paddleTransactionId_key" ON "Payment"("paddleTransactionId");

-- 5. Crear índices para búsquedas
CREATE INDEX "Payment_paddleTransactionId_idx" ON "Payment"("paddleTransactionId");
CREATE INDEX "Payment_provider_idx" ON "Payment"("provider");
