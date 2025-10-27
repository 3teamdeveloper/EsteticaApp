import { Paddle, Environment } from '@paddle/paddle-node-sdk';

// Inicializar cliente de Paddle
// IMPORTANTE: Usar sandbox para testing, production para producción
const environment = process.env.PADDLE_ENVIRONMENT === 'production' 
  ? Environment.production 
  : Environment.sandbox;

export const paddle = new Paddle(
  process.env.PADDLE_API_KEY!,
  {
    environment,
  }
);

interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  planType: 'pro' | 'enterprise';
  billingType: 'monthly' | 'yearly';
}

const api = {
  checkout: {
    /**
     * Crea una sesión de checkout de Paddle para PAGO ÚNICO internacional
     * NO es suscripción recurrente, el usuario debe pagar manualmente cada vez
     * Similar al flujo de MercadoPago: pago → 30 días habilitados → expira → pago de nuevo
     * @param params Parámetros del checkout
     * @returns URL del checkout de Paddle
     */
    async create(params: CreateCheckoutParams) {
      const { userId, userEmail, planType, billingType } = params;

      // Definir el Price ID según el plan y tipo de facturación
      // IMPORTANTE: Estos IDs los obtienes desde el dashboard de Paddle
      // Deben ser precios ONE-TIME, NO suscripciones recurrentes
      const priceIds = {
        pro: {
          monthly: process.env.PADDLE_PRICE_PRO_MONTHLY!,
          yearly: process.env.PADDLE_PRICE_PRO_YEARLY!,
        },
        enterprise: {
          monthly: process.env.PADDLE_PRICE_ENTERPRISE_MONTHLY!,
          yearly: process.env.PADDLE_PRICE_ENTERPRISE_YEARLY!,
        },
      };

      const priceId = priceIds[planType][billingType];

      if (!priceId) {
        throw new Error(`Price ID no configurado para ${planType} ${billingType}`);
      }

      // Crear la transacción ONE-TIME (pago único, no suscripción)
      const transaction = await paddle.transactions.create({
        items: [
          {
            priceId: priceId,
            quantity: 1,
          },
        ],
        customData: {
          userId,
          planType,
          billingType,
        },
        customerEmail: userEmail,
        // URLs de retorno
        checkoutSettings: {
          successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success&provider=paddle`,
          // Paddle no tiene URL de failure separada, usa un parámetro en la success URL
        },
      });

      // Retornar la URL del checkout
      return transaction.checkoutUrl;
    },
  },

  /**
   * Verifica la firma del webhook de Paddle para seguridad
   * @param rawBody Body crudo del webhook
   * @param signature Firma del header Paddle-Signature
   * @returns true si es válido
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    try {
      // Paddle SDK maneja la verificación internamente
      // La firma viene en el header 'paddle-signature'
      const secretKey = process.env.PADDLE_WEBHOOK_SECRET!;
      
      // Extraer timestamp y firma del header
      // Formato: "ts=1234567890;h1=abc123..."
      const parts = signature.split(';');
      const tsMatch = parts.find(p => p.startsWith('ts='));
      const h1Match = parts.find(p => p.startsWith('h1='));
      
      if (!tsMatch || !h1Match) {
        return false;
      }

      const timestamp = tsMatch.split('=')[1];
      const providedSignature = h1Match.split('=')[1];

      // Crear la firma esperada
      const crypto = require('crypto');
      const signedPayload = timestamp + ':' + rawBody;
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signedPayload)
        .digest('hex');

      // Comparar firmas
      return crypto.timingSafeEqual(
        Buffer.from(providedSignature),
        Buffer.from(expectedSignature)
      );
    } catch (error) {
      console.error('Error verificando firma de Paddle:', error);
      return false;
    }
  },
};

export default api;
