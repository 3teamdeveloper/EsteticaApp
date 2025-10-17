import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { mercadopago } from "@/lib/apimp";
import { prisma } from "@/lib/db";

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
      
      // Obtener userId del metadata
      const userId = payment.metadata?.userId ? parseInt(payment.metadata.userId as string) : null;
      
      if (userId) {
        // Buscar usuario actual
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            trialEndDate: true,
            isTrialActive: true,
            subscriptionType: true,
          }
        });

        if (user) {
          const now = new Date();
          let newEndDate: Date;

          // Calcular nueva fecha de expiración
          if (user.trialEndDate && user.trialEndDate > now) {
            // Tiene días restantes → Sumar 30 días desde trialEndDate
            newEndDate = new Date(user.trialEndDate.getTime() + 30 * 24 * 60 * 60 * 1000);
            console.log(`✅ Extendiendo desde ${user.trialEndDate.toISOString()} hasta ${newEndDate.toISOString()}`);
          } else {
            // Ya expiró → Sumar 30 días desde ahora
            newEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            console.log(`✅ Activando desde ahora hasta ${newEndDate.toISOString()}`);
          }

          // Actualizar usuario
          await prisma.user.update({
            where: { id: userId },
            data: {
              trialEndDate: newEndDate,
              isTrialActive: true,
              subscriptionType: 'paid',
              trialExpirationNotified: false,
            }
          });

          // Guardar registro del pago
          await prisma.payment.create({
            data: {
              userId,
              mpPaymentId: payment.id?.toString() || paymentId.toString(),
              mpPreferenceId: payment.metadata?.preferenceId as string | undefined,
              status: 'approved',
              statusDetail: payment.status_detail || undefined,
              amount: payment.transaction_amount || 0,
              currency: payment.currency_id || 'ARS',
              paymentType: user.subscriptionType === 'trial' ? 'initial' : 'renewal',
              paymentMethod: payment.payment_method_id || undefined,
              approvedAt: payment.date_approved ? new Date(payment.date_approved) : now,
            }
          });

          console.log(`✅ Suscripción activada para usuario ${userId} hasta: ${newEndDate.toISOString()}`);
          
          // Revalidar dashboard
          revalidatePath("/dashboard");
        } else {
          console.error(`❌ Usuario ${userId} no encontrado`);
        }
      } else {
        console.warn("⚠️ No se encontró userId en metadata del pago");
      }
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