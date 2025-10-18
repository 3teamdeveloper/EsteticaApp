import { Payment } from "mercadopago";
import { revalidatePath } from "next/cache";
import { mercadopago } from "@/lib/apimp";
import { prisma } from "@/lib/db";
import { getPlanDuration } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('===========================================');
    console.log('🔔 WEBHOOK RECIBIDO DE MERCADO PAGO');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Body completo:', JSON.stringify(body, null, 2));

    // Mercado Pago envía webhooks con dos formatos:
    // 1. { topic: "payment", resource: "PAYMENT_ID" }
    // 2. { topic: "merchant_order", resource: "ORDER_ID" }
    
    const topic = body?.topic || body?.type;
    const resource = body?.resource || body?.data?.id;
    
    console.log('📌 Topic:', topic);
    console.log('📌 Resource:', resource);
    
    // Solo procesar webhooks de tipo "payment"
    if (topic !== 'payment') {
      console.log('ℹ️ Ignorando webhook de tipo:', topic);
      console.log('Solo procesamos webhooks de tipo "payment"');
      return new Response(null, { status: 200 });
    }
    
    // Extraer payment ID del resource
    // El resource puede ser: "123456" o "https://api.../payments/123456"
    let paymentId: string;
    if (typeof resource === 'string' && resource.includes('/')) {
      // Extraer ID de la URL
      const parts = resource.split('/');
      paymentId = parts[parts.length - 1];
    } else {
      paymentId = resource;
    }
    
    if (!paymentId) {
      console.error("❌ ERROR: No se pudo extraer paymentId");
      console.error("Body recibido:", body);
      return new Response("Bad Request", { status: 400 });
    }
    
    console.log("✅ Payment ID encontrado:", paymentId);

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
      
      // Obtener userId y planType del metadata
      const userId = payment.metadata?.userId ? parseInt(payment.metadata.userId as string) : null;
      const planType = (payment.metadata?.planType as string) || 'pro'; // Default a 'pro'
      const billingType = (payment.metadata?.billingType as string) || 'monthly';
      
      if (userId) {
        // Buscar usuario actual
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            trialEndDate: true,
            isTrialActive: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
          }
        });

        if (user) {
          const now = new Date();
          let newEndDate: Date;
          let paymentType: string;

          // Obtener duración del plan desde constantes
          const planDurationDays = getPlanDuration(planType as any, billingType as any);

          // Calcular nueva fecha de expiración
          if (user.trialEndDate && user.trialEndDate > now) {
            // Tiene días restantes → Sumar duración del plan desde trialEndDate
            newEndDate = new Date(user.trialEndDate.getTime() + planDurationDays * 24 * 60 * 60 * 1000);
            paymentType = user.subscriptionStatus === 'trial' ? 'initial' : 'renewal';
            console.log(`✅ Extendiendo desde ${user.trialEndDate.toISOString()} hasta ${newEndDate.toISOString()}`);
          } else {
            // Ya expiró → Sumar duración del plan desde ahora
            newEndDate = new Date(now.getTime() + planDurationDays * 24 * 60 * 60 * 1000);
            paymentType = user.subscriptionPlan ? 'renewal' : 'initial';
            console.log(`✅ Activando desde ahora hasta ${newEndDate.toISOString()}`);
          }

          // Actualizar usuario con NUEVOS campos
          await prisma.user.update({
            where: { id: userId },
            data: {
              trialEndDate: newEndDate,
              isTrialActive: true,
              subscriptionStatus: 'active',
              subscriptionPlan: planType,
              subscriptionBilling: billingType,
              trialExpirationNotified: false,
            }
          });

          // Guardar registro del pago con información del plan
          await prisma.payment.create({
            data: {
              userId,
              mpPaymentId: payment.id?.toString() || paymentId.toString(),
              mpPreferenceId: payment.metadata?.preferenceId as string | undefined,
              status: 'approved',
              statusDetail: payment.status_detail || undefined,
              amount: payment.transaction_amount || 0,
              currency: payment.currency_id || 'ARS',
              paymentType,
              planType,        // Nuevo: registrar qué plan se pagó
              billingType,     // Nuevo: registrar tipo de facturación
              paymentMethod: payment.payment_method_id || undefined,
              approvedAt: payment.date_approved ? new Date(payment.date_approved) : now,
            }
          });

          console.log(`✅ Suscripción ${planType} (${billingType}) activada para usuario ${userId} hasta: ${newEndDate.toISOString()}`);
          
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