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

    // ====================================
    // 🛡️ VERIFICACIÓN DE IDEMPOTENCIA
    // ====================================
    // ANTES de obtener detalles de MP (ahorra llamadas API), verificar si ya procesamos este pago
    const existingPayment = await prisma.payment.findUnique({
      where: { mpPaymentId: paymentId.toString() },
      select: { id: true, createdAt: true, userId: true }
    });

    if (existingPayment) {
      console.log("⚠️⚠️⚠️ WEBHOOK DUPLICADO DETECTADO ⚠️⚠️⚠️");
      console.log("Payment ID:", paymentId, "ya fue procesado");
      console.log("Fecha de procesamiento original:", existingPayment.createdAt);
      console.log("Usuario:", existingPayment.userId);
      console.log("✅ IGNORANDO webhook duplicado - retornando 200");
      console.log('===========================================');
      return new Response(null, { status: 200 });
    }

    console.log("✅ Payment ID es nuevo - continuando con procesamiento");

    // Obtenemos el pago desde Mercado Pago
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
      // IMPORTANTE: Mercado Pago convierte camelCase a snake_case automáticamente
      // userId → user_id, planType → plan_type, billingType → billing_type
      const userIdStr = (payment.metadata?.user_id || payment.metadata?.userId) as string;
      const userId = userIdStr ? parseInt(userIdStr) : null;
      const planType = (payment.metadata?.plan_type || payment.metadata?.planType || 'pro') as string;
      const billingType = (payment.metadata?.billing_type || payment.metadata?.billingType || 'monthly') as string;
      
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
          // IMPORTANTE: Usar setDate() para evitar problemas con días del mes
          if (user.trialEndDate && user.trialEndDate > now) {
            // Tiene días restantes → Sumar duración del plan desde trialEndDate
            newEndDate = new Date(user.trialEndDate);
            newEndDate.setDate(newEndDate.getDate() + planDurationDays);
            paymentType = user.subscriptionStatus === 'trial' ? 'initial' : 'renewal';
            console.log(`✅ Extendiendo desde ${user.trialEndDate.toISOString()} hasta ${newEndDate.toISOString()}`);
            console.log(`   (+${planDurationDays} días agregados)`);
          } else {
            // Ya expiró → Sumar duración del plan desde ahora
            newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + planDurationDays);
            paymentType = user.subscriptionPlan ? 'renewal' : 'initial';
            console.log(`✅ Activando desde ahora hasta ${newEndDate.toISOString()}`);
            console.log(`   (+${planDurationDays} días desde hoy)`);
          }

          // ====================================
          // 🔒 TRANSACCIÓN ATÓMICA CON DOBLE VERIFICACIÓN
          // ====================================
          // Usar transacción para garantizar atomicidad (ambas operaciones o ninguna)
          console.log('🔄 Iniciando transacción de DB...');
          
          await prisma.$transaction(async (tx) => {
            // DOBLE VERIFICACIÓN DENTRO DE LA TRANSACCIÓN
            // Esto protege contra race conditions (2 webhooks simultáneos)
            const paymentExists = await tx.payment.findUnique({
              where: { mpPaymentId: payment.id?.toString() || paymentId.toString() },
              select: { id: true }
            });
            
            if (paymentExists) {
              console.log('⚠️ Race condition: Payment ya existe dentro de transacción');
              throw new Error('PAYMENT_ALREADY_EXISTS'); // Lanzar error para rollback
            }
            
            // 1. Crear registro del pago PRIMERO (para que falle rápido si hay duplicado)
            const createdPayment = await tx.payment.create({
              data: {
                userId,
                mpPaymentId: payment.id?.toString() || paymentId.toString(),
                mpPreferenceId: payment.metadata?.preferenceId as string | undefined,
                status: 'approved',
                statusDetail: payment.status_detail || undefined,
                amount: payment.transaction_amount || 0,
                currency: payment.currency_id || 'ARS',
                paymentType,
                planType,
                billingType,
                paymentMethod: payment.payment_method_id || undefined,
                approvedAt: payment.date_approved ? new Date(payment.date_approved) : now,
              }
            });
            console.log('✅ Payment creado en transacción');
            
            // 2. Actualizar usuario DESPUÉS (solo si el payment se creó exitosamente)
            const updatedUser = await tx.user.update({
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
            console.log('✅ Usuario actualizado en transacción');
            
            return { updatedUser, createdPayment };
          });

          console.log('✅ Transacción completada exitosamente');
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
    console.log('✅ Webhook procesado exitosamente');
    console.log('===========================================');
    return new Response(null, { status: 200 });
  } catch (err: any) {
    console.error("❌❌❌ ERROR PROCESANDO WEBHOOK ❌❌❌");
    console.error("Error completo:", err);
    console.error("Mensaje:", err?.message);
    console.error("Stack:", err?.stack);
    
    // ====================================
    // 🛡️ MANEJO ESPECÍFICO DE ERRORES
    // ====================================
    
    // Error custom de verificación dentro de transacción
    if (err?.message === 'PAYMENT_ALREADY_EXISTS') {
      console.log("⚠️ Race condition detectada en transacción: Payment ya existe");
      console.log("✅ Transacción abortada - retornando 200");
      console.log('===========================================');
      return new Response(null, { status: 200 });
    }
    
    // P2002: Unique constraint failed (race condition - otro webhook ya procesó este pago)
    if (err?.code === 'P2002' && err?.meta?.target?.includes('mpPaymentId')) {
      console.log("⚠️ Race condition detectada: Otro webhook ya procesó este pago");
      console.log("✅ Retornando 200 para evitar reintentos");
      console.log('===========================================');
      return new Response(null, { status: 200 });
    }
    
    // Otros errores P2002 (constraints diferentes)
    if (err?.code === 'P2002') {
      console.error("❌ Constraint violation en:", err?.meta?.target);
      console.log("✅ Retornando 200 para evitar reintentos");
      console.log('===========================================');
      return new Response(null, { status: 200 });
    }
    
    // Errores de Mercado Pago API (payment no encontrado, etc)
    if (err?.message?.includes('not found') || err?.status === 404) {
      console.error("❌ Payment no encontrado en Mercado Pago");
      console.log("✅ Retornando 200 para evitar reintentos de un payment inexistente");
      console.log('===========================================');
      return new Response(null, { status: 200 });
    }
    
    // Otros errores: retornar 500 para que MP reintente más tarde
    console.error("❌ Error no manejado - Mercado Pago reintentará");
    console.log('===========================================');
    return new Response("Internal Server Error", { status: 500 });
  }
}