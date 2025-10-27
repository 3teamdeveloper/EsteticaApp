# 🌍 Configuración de Paddle para Pagos Internacionales

Esta guía te ayudará a configurar Paddle como método de pago internacional en tu aplicación.

## 📋 Requisitos Previos

1. **Cuenta de Paddle**: Regístrate en [Paddle.com](https://www.paddle.com/)
2. **Verificación de cuenta**: Completa el proceso de verificación KYC (puede tomar algunos días)
3. **Configuración fiscal**: Paddle maneja automáticamente los impuestos (Merchant of Record)

## 🔑 Paso 1: Obtener las Credenciales de Paddle

### 1.1 API Key

1. Ingresa a tu dashboard de Paddle: https://sandbox-vendors.paddle.com/ (sandbox) o https://vendors.paddle.com/ (production)
2. Ve a **Developer Tools** > **Authentication**
3. Crea una nueva **API Key**
4. Copia el API Key (solo se muestra una vez)

### 1.2 Webhook Secret

1. Ve a **Developer Tools** > **Notifications**
2. Crea un nuevo **Webhook endpoint**
3. URL del webhook: `https://tu-dominio.com/api/payments/paddle/webhook`
4. Selecciona los siguientes eventos:
   - ✅ `transaction.completed`
   - ✅ `transaction.paid`
   - ❌ **NO seleccionar eventos de subscription** (no los usamos)
5. Copia el **Webhook Secret** que se genera

## 🏗️ Paso 2: Crear Productos y Precios en Paddle

### ⚠️ IMPORTANTE: Modelo de Pagos Únicos

**NO uses suscripciones recurrentes**. Tu modelo de negocio es:
- Usuario paga → Se habilitan 30 días de uso
- Se expira → Usuario debe pagar manualmente de nuevo
- **NO hay renovación automática**

### 2.1 Crear Producto "Plan PRO"

1. Ve a **Catalog** > **Products**
2. Click en **+ New Product**
3. Configura:
   - **Product name**: Plan PRO - 30 días
   - **Description**: Acceso al Plan PRO por 30 días (pago único)
   - **Tax category**: Software as a Service (SaaS)

### 2.2 Crear Precios ONE-TIME (NO Recurrentes)

Crea **4 precios ONE-TIME** para tu producto:

#### Precio 1: PRO Mensual (30 días)
- **Billing type**: ONE-TIME (Standard)
- **Price**: USD $29 (o el precio que definas)
- ⚠️ **NO seleccionar "Recurring"**
- Copia el **Price ID** (ejemplo: `pri_01abc123...`)

#### Precio 2: PRO Anual (365 días)
- **Billing type**: ONE-TIME (Standard)
- **Price**: USD $290 (o el precio que definas)
- ⚠️ **NO seleccionar "Recurring"**
- Copia el **Price ID**

#### Precio 3: ENTERPRISE Mensual (30 días) - opcional
- **Billing type**: ONE-TIME (Standard)
- **Price**: USD $99
- ⚠️ **NO seleccionar "Recurring"**
- Copia el **Price ID**

#### Precio 4: ENTERPRISE Anual (365 días) - opcional
- **Billing type**: ONE-TIME (Standard)
- **Price**: USD $990
- ⚠️ **NO seleccionar "Recurring"**
- Copia el **Price ID**

## 🔧 Paso 3: Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```bash
# ========================================
# PADDLE - PAGOS INTERNACIONALES
# ========================================

# Environment: 'sandbox' para testing, 'production' para producción
PADDLE_ENVIRONMENT=sandbox

# API Key de Paddle (Developer Tools > Authentication)
PADDLE_API_KEY=tu_api_key_aqui

# Webhook Secret (Developer Tools > Notifications)
PADDLE_WEBHOOK_SECRET=tu_webhook_secret_aqui

# Price IDs (obtenerlos desde Catalog > Products > Prices)
PADDLE_PRICE_PRO_MONTHLY=pri_01abc123_pro_monthly
PADDLE_PRICE_PRO_YEARLY=pri_01abc456_pro_yearly
PADDLE_PRICE_ENTERPRISE_MONTHLY=pri_01def789_enterprise_monthly
PADDLE_PRICE_ENTERPRISE_YEARLY=pri_01ghi012_enterprise_yearly
```

### Variables de Entorno en Vercel

Configura las mismas variables en Vercel:

1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega cada variable con su valor correspondiente
4. **IMPORTANTE**: Usa valores de **production** cuando despliegues a producción

## 🗄️ Paso 4: Ejecutar Migración de Base de Datos

El schema de Prisma ya fue actualizado para soportar Paddle. Ahora debes crear la migración:

```bash
# Crear la migración
npx prisma migrate dev --name add_paddle_support

# O si prefieres ejecutarla directamente
npx prisma migrate deploy
```

Esto agregará los siguientes campos a la tabla `Payment`:
- `provider` (String): 'mercadopago' | 'paddle'
- `paddleTransactionId` (String, único)
- `paddleSubscriptionId` (String)

## 📦 Paso 5: Instalar Dependencias

```bash
pnpm install
```

Esto instalará el paquete `@paddle/paddle-node-sdk` que ya fue agregado al `package.json`.

## 🧪 Paso 6: Probar en Modo Sandbox

1. Asegúrate de que `PADDLE_ENVIRONMENT=sandbox` en tu `.env.local`
2. Inicia tu servidor de desarrollo: `pnpm dev`
3. Crea un botón de prueba o usa el endpoint directamente:

```typescript
// Ejemplo de llamada al endpoint
const response = await fetch('/api/payments/paddle/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planType: 'pro',      // 'pro' | 'enterprise'
    billingType: 'monthly' // 'monthly' | 'yearly'
  }),
});

const data = await response.json();
if (data.success) {
  window.location.href = data.checkoutUrl;
}
```

4. Usa las [tarjetas de prueba de Paddle](https://developer.paddle.com/concepts/payment-methods/credit-debit-card) para testing

## 🚀 Paso 7: Pasar a Producción

1. Completa la verificación de tu cuenta en Paddle
2. Cambia `PADDLE_ENVIRONMENT=production` en Vercel
3. Actualiza el API Key y Webhook Secret con los de producción
4. Actualiza los Price IDs con los de producción
5. Verifica que el webhook esté configurado con tu URL de producción

## 📊 Endpoints Creados

### POST `/api/payments/paddle/checkout`
Crea una sesión de checkout de Paddle.

**Body:**
```json
{
  "planType": "pro",
  "billingType": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.paddle.com/...",
  "provider": "paddle"
}
```

### POST `/api/payments/paddle/webhook`
Recibe notificaciones de Paddle sobre pagos completados.

**Configurar en Paddle Dashboard:**
- URL: `https://tu-dominio.com/api/payments/paddle/webhook`
- Eventos: transaction.completed, transaction.paid, subscription.*

## 🔐 Seguridad

✅ **Verificación de firma**: El webhook verifica automáticamente la firma de Paddle
✅ **Idempotencia**: Previene procesamiento duplicado de transacciones
✅ **Transacciones atómicas**: Garantiza consistencia de datos
✅ **HTTPS requerido**: Paddle solo envía webhooks a URLs HTTPS

## 💡 Consejos

1. **Testing**: Usa siempre el modo sandbox antes de ir a producción
2. **Monitoreo**: Revisa los logs de webhooks en el dashboard de Paddle
3. **Impuestos**: Paddle calcula y cobra automáticamente los impuestos según la ubicación del cliente
4. **Facturación**: Paddle emite las facturas directamente a tus clientes
5. **Disputas**: Paddle maneja las disputas y chargebacks

## 🆘 Troubleshooting

### Error: "Cannot find module '@paddle/paddle-node-sdk'"
**Solución**: Ejecuta `pnpm install`

### Error: "Property 'paddleTransactionId' does not exist"
**Solución**: Ejecuta la migración de Prisma: `npx prisma migrate dev`

### Webhook no se recibe
1. Verifica que la URL sea HTTPS
2. Verifica que el webhook esté configurado en el dashboard de Paddle
3. Revisa los logs en Paddle Dashboard > Developer Tools > Notifications

### Firma inválida en webhook
1. Verifica que `PADDLE_WEBHOOK_SECRET` sea correcto
2. Asegúrate de usar el secret del ambiente correcto (sandbox vs production)

## 📚 Recursos

- [Documentación de Paddle](https://developer.paddle.com/)
- [API Reference](https://developer.paddle.com/api-reference/overview)
- [Webhooks Guide](https://developer.paddle.com/webhooks/overview)
- [Testing Guide](https://developer.paddle.com/concepts/sell/testing)
