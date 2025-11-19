# Guía rápida: debugging de trial / días restantes

Este archivo resume cómo funciona hoy el sistema de días de uso (trial + pagos) y qué revisar cuando veas un número raro de días restantes.

## 1. Campos y modelos involucrados

- **Tabla `User`** (en `prisma/schema.prisma`):
  - `trialStartDate: DateTime?`
  - `trialEndDate: DateTime?`
  - `isTrialActive: Boolean @default(true)`
  - `trialExpirationNotified: Boolean @default(false)`
  - `subscriptionStatus: String? @default("trial")`  // 'trial' | 'active' | 'expired' | 'cancelled'
  - `subscriptionPlan: String? @default("free")`      // 'free' | 'pro' | 'enterprise'
  - `subscriptionBilling: String? @default("monthly")`// 'monthly' | 'yearly'

- **Tabla `Payment`** (historial de pagos):
  - `mpPaymentId` (único, usado para idempotencia de webhooks)
  - `planType` ('pro', 'enterprise', ...)
  - `billingType` ('monthly', 'yearly')
  - `approvedAt`, `createdAt`, etc.

## 2. Dónde se inicializa el trial (14 días)

Archivo: `src/lib/trial.ts`

- Función `initializeTrial(userId: number)`:
  - Calcula `trialEndDate = now + 14 días`.
  - Setea en `User`:
    - `trialStartDate = now`
    - `trialEndDate = now + 14 días`
    - `isTrialActive = true`
    - `trialExpirationNotified = false`.

Se llama desde:

- `src/app/api/auth/register/route.ts` (registro normal).
- `src/app/api/auth/google/callback/route.ts` (registro con Google) para usuarios nuevos.

## 3. Cómo se calculan los días restantes que muestra el banner

Archivo: `src/lib/trial.ts`

- Función `calculateTrialStatus(user)` devuelve `TrialStatus`:
  - Si **no hay** `trialStartDate` o `trialEndDate`:
    - Se considera nuevo usuario:
      - `isActive = true`
      - `daysRemaining = 14`
      - `isExpired = false`
      - `shouldNotify = false`
      - `trialEndDate = null`.
  - Si **sí hay** `trialEndDate`:
    - `timeDiff = trialEndDate - now` (en ms).
    - `daysRemaining = ceil(timeDiff / (1000 * 3600 * 24))`.
    - `isExpired = timeDiff <= 0`.
    - `isActive = user.isTrialActive && !isExpired`.
    - `daysRemaining` se clamp ea `Math.max(0, daysRemaining)`.

El frontend obtiene este estado vía:

- `GET /api/trial/status` → `getUserTrialStatus(userId)` → `calculateTrialStatus`.
- Hook `useTrial` (`src/hooks/useTrial.ts`) lee esa API y pasa `trialStatus` al banner verde (`TrialStatusCard`) y a otras vistas.

**Detalles a tener en cuenta:**

- Uso de `Math.ceil` puede causar diferencias de ±1 día según la hora del día en que se consulte.
- Siempre se trabaja sobre `trialEndDate` como "fecha de corte" real.

## 4. Cómo se suman días cuando hay pagos

Archivo principal: `src/app/api/payments/mercadopago/route.ts`.

Resumen del flujo del webhook de Mercado Pago (cuando status = "approved"):

1. **Idempotencia antes de todo:**
   - Busca `existingPayment` por `mpPaymentId`.
   - Si existe: se detecta webhook duplicado y se retorna 200 **sin tocar al usuario**.

2. Obtiene datos desde Mercado Pago (`Payment` SDK) y lee `metadata`:
   - `userId` (desde `user_id` / `userId`).
   - `planType` (ej. 'pro').
   - `billingType` ('monthly' | 'yearly').

3. Busca al usuario en `User` con:
   - `trialEndDate`
   - `isTrialActive`
   - `subscriptionStatus`
   - `subscriptionPlan`.

4. Calcula la duración del plan en días con `getPlanDuration(planType, billingType)`:
   - Definido en `src/lib/plans.ts`.

5. **Regla de suma de días:**

   ```ts
   if (user.trialEndDate && user.trialEndDate > now) {
     // Tiene días restantes → suma sobre trialEndDate actual
     newEndDate = new Date(user.trialEndDate);
     newEndDate.setDate(newEndDate.getDate() + planDurationDays);
     paymentType = user.subscriptionStatus === 'trial' ? 'initial' : 'renewal';
   } else {
     // Trial expiró o no existe → suma desde ahora
     newEndDate = new Date();
     newEndDate.setDate(newEndDate.getDate() + planDurationDays);
     paymentType = user.subscriptionPlan ? 'renewal' : 'initial';
   }
   ```

6. **Transacción atómica en Prisma:**

   ```ts
   await prisma.$transaction(async (tx) => {
     const paymentExists = await tx.payment.findUnique({
       where: { mpPaymentId: ... },
     });
     if (paymentExists) throw new Error('PAYMENT_ALREADY_EXISTS');

     // 1. Crear Payment
     await tx.payment.create({ ... });

     // 2. Actualizar User
     await tx.user.update({
       where: { id: userId },
       data: {
         trialEndDate: newEndDate,
         isTrialActive: true,
         subscriptionStatus: 'active',
         subscriptionPlan: planType,
         subscriptionBilling: billingType,
         trialExpirationNotified: false,
       },
     });
   });
   ```

7. Manejo adicional de errores:
   - Si hay `PAYMENT_ALREADY_EXISTS` o `P2002` sobre `mpPaymentId`, se devuelve 200 y **no se duplican días**.

## 5. Qué puede explicar un salto grande de días

Con el código actual es difícil que se "disparen" días arbitrariamente, pero sí se pueden dar estas situaciones:

- **Salto esperado por suma sobre días restantes:**
  - Ejemplo: empezás con 14 días; usaste 5 → quedan 9.
  - Pagás un plan de 30 días.
  - Regla: si `trialEndDate > now`, se suman 30 días **a la fecha de corte actual**.
  - Resultado aproximado: `9 + 30 = 39` días restantes.

- **Diferencias de 1 día arriba/abajo:**
  - Por el uso de `Math.ceil` y la hora exacta con la que se compara `trialEndDate`.

- **Datos históricos inconsistentes:**
  - Usuarios antiguos con un `trialEndDate` ya sobre-extendido por versiones anteriores.
  - Ediciones manuales en la base de datos.

## 6. Checklist de depuración cuando un usuario tenga días "disparados"

Supongamos que ves un usuario con, por ejemplo, 120 días restantes y te parece demasiado.

1. **Identificar al usuario**
   - Necesitás el `user.id` (lo podés ver en la base o en logs).

2. **Revisar la fila en `User`**
   - Mirar estos campos:
     - `trialStartDate`
     - `trialEndDate`
     - `isTrialActive`
     - `subscriptionStatus`, `subscriptionPlan`, `subscriptionBilling`.
   - Ver si `trialEndDate` parece razonable (ej. hoy + 30, +60, +90) o es una fecha muy lejana.

3. **Listar los `Payment` asociados al usuario**
   - Filtrar por `userId` en la tabla `Payment`.
   - Ordenar por `approvedAt` / `createdAt`.
   - Ver cuántos pagos `status = 'approved'` tiene el usuario y de qué tipo:
     - `planType`, `billingType`.

4. **Reconstruir la línea de tiempo**
   - Empezar desde el primer `trialEndDate` conocido (alta de usuario).
   - Por cada pago `approved`, aplicar la regla:
     - Si en ese momento `trialEndDate > fecha del pago` → sumar `planDurationDays` sobre `trialEndDate`.
     - Si ya había expirado → sumar `planDurationDays` sobre la fecha del pago.
   - Ver si, sumando manualmente, llegás aproximadamente a la fecha actual de `trialEndDate`.

5. **Verificar si hay pagos duplicados**
   - Si encontrás varios payments con el mismo flujo de compra pero fechas muy cercanas, chequear logs:
     - El webhook actual evita duplicar, pero puede haber datos históricos previos.

6. **Comprobar el cálculo de días restantes**
   - Fórmula manual:

     ```text
     daysRemaining = ceil( (trialEndDate - now) / (1000 * 3600 * 24) )
     ```

   - Aceptar que puede haber ±1 día de diferencia respecto a lo que "uno espera" si mira solo fechas sin horas.

## 7. Qué hacer si confirmás que los días realmente están mal

Si al reconstruir:

- **La suma de pagos justifica los días**:
  - El sistema está funcionando según las reglas actuales (suma sobre días restantes).
  - Revisar si la expectativa de negocio es distinta (ej. que un pago siempre resetee a 30 días desde hoy, ignorando lo que quede).

- **La suma de pagos NO justifica los días**:
  - Revisar si hubo:
    - Cambios manuales en DB.
    - Viejas versiones del webhook sin idempotencia.
    - Migraciones que hayan tocado `trialEndDate`.

- **Posibles acciones futuras** (no implementadas aún):
  - Agregar un campo solo informativo tipo `totalPaidDays` o logs de auditoría extras.
  - Ajustar la regla de negocio (por ejemplo, que ciertos planes no sumen sobre días restantes, sino que "reseteen" la fecha).

---

Este archivo es solo de referencia para cuando aparezca un caso concreto en producción. La lógica actual de código se encuentra principalmente en:

- `src/lib/trial.ts`
- `src/app/api/trial/status/route.ts`
- `src/app/api/payments/mercadopago/route.ts`
- `src/lib/plans.ts`
- Modelos `User` y `Payment` en `prisma/schema.prisma`.
