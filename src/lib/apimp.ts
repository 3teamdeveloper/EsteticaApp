import {readFileSync, writeFileSync} from "node:fs";
import { MercadoPagoConfig, Preference } from "mercadopago";

interface Suscription {
  id: string;
  details: string;
  // TODO:ver si necesitamos mas info
}

export const mercadopago = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN!});

const api = {
  message: {
    
    async submit(
      details: Suscription["details"], 
      userId?: string,
      planType: string = 'pro',
      billingType: string = 'monthly'
    ) {
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [
            {
              id: "idpro",
              unit_price: 15,
              quantity: 1,
              title: "Suscripcion PRO",
            },
          ],
          metadata: {
            details,
            userId,        // ID del usuario
            planType,      // Tipo de plan: 'pro', 'enterprise'
            billingType,   // Facturación: 'monthly', 'yearly'
          },
          // Configurar webhook para notificaciones de pago
          notification_url: process.env.NEXT_PUBLIC_BASE_URL 
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/mercadopago`
            : undefined,
          // URLs de retorno
          back_urls: {
            success: process.env.NEXT_PUBLIC_BASE_URL 
              ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`
              : undefined,
            failure: process.env.NEXT_PUBLIC_BASE_URL 
              ? `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade?payment=failure`
              : undefined,
            pending: process.env.NEXT_PUBLIC_BASE_URL 
              ? `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=pending`
              : undefined,
          },
          auto_return: 'approved' as any,
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    }
  },
};

export default api;
