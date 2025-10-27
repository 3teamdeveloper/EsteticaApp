import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import paddleApi from '@/lib/paddle';
import { getPlanDuration } from '@/lib/plans';

/**
 * POST /api/payments/paddle/webhook
 * 
 * Webhook de Paddle para procesar eventos de pagos internacionales
 * 
 * IMPORTANTE: Configurar esta URL en el dashboard de Paddle:
 * https://tu-dominio.com/api/payments/paddle/webhook
 * 
 * MODELO DE NEGOCIO: PAGOS ÚNICOS (NO SUSCRIPCIONES RECURRENTES)
 * - El usuario paga → Se habilitan 30 días
 * - Se expira → Usuario debe pagar manualmente de nuevo
 * - NO hay renovación automática
 * 
 * Eventos que procesamos:
 * - transaction.completed: Pago exitoso
 * - transaction.paid: Confirmación de pago
 */
export async function POST(request: Request) {
  try {
    console.log('===========================================');
    console.log('🔔 WEBHOOK RECIBIDO DE PADDLE');
    console.log('Timestamp:', new Date().toISOString());

    // 1. Obtener el body crudo y la firma
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');

    console.log('📌 Signature present:', !!signature);

    // 2. Verificar la firma del webhook (IMPORTANTE para seguridad)
    if (!signature) {
      console.error('❌ No se recibió firma de Paddle');
      return new Response('No signature', { status: 400 });
    }

    const isValid = paddleApi.verifyWebhookSignature(rawBody, signature);
    
    if (!isValid) {
      console.error('❌ Firma inválida del webhook de Paddle');
      return new Response('Invalid signature', { status: 401 });
    }

    console.log('✅ Firma verificada correctamente');

    // 3. Parsear el body
    const event = JSON.parse(rawBody);
    console.log('📦 Evento recibido:', {
      eventType: event.event_type,
      eventId: event.event_id,
    });
    console.log('Body completo:', JSON.stringify(event, null, 2));

    const eventType = event.event_type;
    const eventData = event.data;

    // 4. Procesar según el tipo de evento
    switch (eventType) {
      case 'transaction.completed':
      case 'transaction.paid':
        await handleTransactionCompleted(eventData);
        break;

      default:
        console.log('ℹ️ Evento ignorado (no manejamos suscripciones):', eventType);
        // Solo procesamos transacciones (pagos únicos)
        // Ignoramos eventos de suscripción porque nuestro modelo es de pago manual
    }

    console.log('✅ Webhook procesado exitosamente');
    console.log('===========================================');
    return new Response(null, { status: 200 });

  } catch (err: any) {
    console.error('❌❌❌ ERROR PROCESANDO WEBHOOK DE PADDLE ❌❌❌');
    console.error('Error completo:', err);
    console.error('Mensaje:', err?.message);
    console.error('Stack:', err?.stack);
    console.log('===========================================');

    // Retornar 500 para que Paddle reintente
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * Procesa el evento de transacción completada (pago único exitoso)
 * NO es suscripción recurrente - es un pago manual que habilita X días de uso
 */
async function handleTransactionCompleted(data: any) {
  console.log('💳 Procesando transacción completada (PAGO ÚNICO):', data.id);

  const transactionId = data.id;
  const status = data.status; // 'completed', 'paid'
  const customData = data.custom_data || {};
  
  // Extraer información del pago
  const userId = customData.userId ? parseInt(customData.userId) : null;
  const planType = customData.planType || 'pro';
  const billingType = customData.billingType || 'monthly';
  const amount = parseFloat(data.details?.totals?.total || 0) / 100; // Paddle envía en centavos
  const currency = data.currency_code || 'USD';

  console.log('📊 Datos del pago único:', {
    transactionId,
    userId,
    planType,
    billingType,
    amount,
    currency,
    status
  });

  if (!userId) {
    console.error('❌ No se encontró userId en custom_data');
    return;
  }

  // Verificar si ya procesamos esta transacción (idempotencia)
  const existingPayment = await prisma.payment.findUnique({
    where: { paddleTransactionId: transactionId },
    select: { id: true, createdAt: true, userId: true }
  });

  if (existingPayment) {
    console.log('⚠️⚠️⚠️ WEBHOOK DUPLICADO DETECTADO ⚠️⚠️⚠️');
    console.log('Transaction ID:', transactionId, 'ya fue procesado');
    console.log('Fecha de procesamiento original:', existingPayment.createdAt);
    console.log('Usuario:', existingPayment.userId);
    console.log('✅ IGNORANDO webhook duplicado');
    return;
  }

  console.log('✅ Transaction ID es nueva - continuando con procesamiento');

  // Obtener usuario actual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trialEndDate: true,
      isTrialActive: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
    }
  });

  if (!user) {
    console.error(`❌ Usuario ${userId} no encontrado`);
    return;
  }

  const now = new Date();
  let newEndDate: Date;
  let paymentType: string;

  // Obtener duración del plan
  const planDurationDays = getPlanDuration(planType as any, billingType as any);

  // Calcular nueva fecha de expiración
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

  // Transacción atómica
  console.log('🔄 Iniciando transacción de DB...');

  await prisma.$transaction(async (tx) => {
    // Doble verificación dentro de la transacción (race condition)
    const paymentExists = await tx.payment.findUnique({
      where: { paddleTransactionId: transactionId },
      select: { id: true }
    });

    if (paymentExists) {
      console.log('⚠️ Race condition: Payment ya existe dentro de transacción');
      throw new Error('PAYMENT_ALREADY_EXISTS');
    }

    // 1. Crear registro del pago
    const createdPayment = await tx.payment.create({
      data: {
        userId,
        provider: 'paddle',
        paddleTransactionId: transactionId,
        paddleSubscriptionId: null, // No manejamos suscripciones, solo pagos únicos
        status: 'approved',
        statusDetail: status,
        amount,
        currency,
        paymentType,
        planType,
        billingType,
        paymentMethod: 'paddle',
        approvedAt: now,
      }
    });
    console.log('✅ Payment creado en transacción');

    // 2. Actualizar usuario
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
  revalidatePath('/dashboard');
}
