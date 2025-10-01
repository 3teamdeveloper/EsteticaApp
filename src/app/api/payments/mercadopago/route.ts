import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { mercadopago } from "@/lib/apimp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    //console.log('*****************************')
    //console.log('*****************************')
    //console.log("Webhook recibido:", body);

    // Verificamos que venga el id
    const paymentId = body?.data?.id;
    if (!paymentId) {
      console.error("No se encontró paymentId en el webhook");
      return new Response("Bad Request", { status: 400 });
    }
    return new Response(null, { status: 201 });

    // Obtenemos el pago
    const payment = await new Payment(mercadopago).get({ id: paymentId });
    //console.log("Pago encontrado:", payment);

    if (payment?.status === "approved") {
      //console.log("Suscripción ok");
      // TODO: actualizar base de datos, avisar usuario, etc.
      // revalidatePath("/");
    } else {
      //console.log("Suscripción falló");
    }

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Error procesando webhook:", err);
    return new Response("Internal Server Error", { status: 501 });
  }
}
// import {Payment} from "mercadopago";
// import {revalidatePath} from "next/cache";

// import api, {mercadopago} from "@/lib/apimp";

// export async function POST(request: Request) {
//   // Obtenemos el cuerpo de la petición que incluye información sobre la notificación
//   const body: {data: {id: string}} = await request.json();
//   //console.log(body)
//   console.log('🚀')

//   // Obtenemos el pago
//   const payment = await new Payment(mercadopago).get({id: body.data.id});

//   // TODO: Si se aprueba, avisamos al usuario y otras cosas
//   if (payment.status === "approved") {
//     // Obtenemos los datos
//     //console.log('Suscripcion ok');
    
//     // Revalidamos la página para mostrar los datos actualizados
//     // revalidatePath("/");
// }else{
    
//     //console.log('Suscripcion falló');
//   }

//   // Respondemos con un estado 200 para indicarle que la notificación fue recibida
//   return new Response(null, {status: 200});
// }