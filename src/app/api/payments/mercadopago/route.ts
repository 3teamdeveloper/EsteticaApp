import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { mercadopago } from "@/lib/apimp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('===========================================');
    console.log('🔔 Webhook recibido de Mercado Pago');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Verificamos que venga el id
    const paymentId = body?.data?.id;
    if (!paymentId) {
      console.error("❌ No se encontró paymentId en el webhook");
      return new Response("Bad Request", { status: 400 });
    }

    // Obtenemos el pago
    const payment = await new Payment(mercadopago).get({ id: paymentId });
    console.log("💳 Pago encontrado:", {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      metadata: payment.metadata
    });

    if (payment?.status === "approved") {
      console.log("✅ Pago aprobado - ID:", paymentId);
      console.log("📦 Metadata del pago:", payment.metadata);
      
      // TODO: Aquí deberías actualizar la base de datos
      // Ejemplo: Actualizar el usuario a plan PRO
      // await prisma.user.update({
      //   where: { id: payment.metadata.userId },
      //   data: { plan: 'PRO', subscriptionActive: true }
      // });
      
      // revalidatePath("/dashboard");
    } else {
      console.log("⚠️ Pago no aprobado - Status:", payment?.status);
    }

    // IMPORTANTE: Siempre retornar 200 para confirmar recepción
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("❌ Error procesando webhook:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}