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
    
    async submit(details: Suscription["details"]) {
      // Creamos la preferencia incluyendo el precio, titulo y metadata. La información de `items` es standard de Mercado Pago. La información que nosotros necesitamos para nuestra DB debería vivir en `metadata`.
      const preference = await new Preference(mercadopago).create({
        body: {
          items: [
            {
              id: "idpro",
              unit_price: 5,
              quantity: 1,
              title: "test suscripcion PRO",
            },
          ],
          metadata: {
            details,
          },
        },
      });

      // Devolvemos el init point (url de pago) para que el usuario pueda pagar
      return preference.init_point!;
    }
  },
};

export default api;
