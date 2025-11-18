# Plan de pruebas después de los cambios de seguridad

> Recomendación: ejecutar todo con la app levantada en modo desarrollo (`npm run dev`) y revisar también la consola del navegador y los logs del servidor por si aparecen errores no manejados.

---

## 1. Perfiles públicos (`/dashboard/profile` y `/[urlName]`)

### 1.1. Flujo normal de edición de perfil

- **[ ]** Inicia sesión como usuario prestador.
- **[ ]** Ve a `/dashboard/profile`.
- **[ ]** Edita:
  - `urlName`
  - `pageTitle`
  - `bio`
  - `slogan`
- **[ ]** Guarda el perfil.
- **[ ]** Comprueba:
  - No aparece ningún error en UI.
  - Los datos se actualizan correctamente al refrescar `/dashboard/profile`.
  - El perfil público en `https://tu-dominio/[urlName]` se ve bien (hero, bio, slogan).

### 1.2. Sanitización de textos (prevención de XSS)

- **[ ]** En `/dashboard/profile`, prueba escribir en `pageTitle`, `bio` y `slogan` valores como:
  - `<img src=x onerror=alert('xss')>`
  - `<script>alert(1)</script>`
  - Cadenas con caracteres raros (control characters, etc.).
- **[ ]** Guarda y luego abre el perfil público `/[urlName]`:
  - **Esperado:** Se ve el texto “limpio”, sin `<`, `>`, ni ejecución de scripts.
  - React debería seguir mostrando texto plano (no HTML interpretado).

### 1.3. Enlaces públicos (`publicLinks`)

- **[ ]** En `/dashboard/profile`, agrega enlaces personalizados y de redes:
  - Uno válido: `https://instagram.com/loquesea`.
  - Uno con `mailto:email@dominio.com`.
  - Uno con `tel:+541111111111`.
  - Uno **malicioso**: `javascript:alert(1)` o `data:text/html,<script>alert(1)</script>`.
- **[ ]** Guarda el perfil.
- **[ ]** Vuelve a cargar `/dashboard/profile`:
  - **Esperado:**  
    - Los enlaces válidos se mantienen.  
    - Los enlaces con esquema no permitido deberían desaparecer o quedar sin URL.
- **[ ]** Abre el perfil público `/[urlName]`:
  - **Esperado:**  
    - Los botones de redes / enlaces abren solo `http(s)`, `mailto:`, `tel:`.
    - No existe ningún link con `javascript:` en el atributo `href` (puedes inspeccionar con DevTools).

---

## 2. Empleados (API y dashboard)

### 2.1. Crear empleado

- **[ ]** Ve a `/dashboard/employees`.
- **[ ]** Crea un nuevo empleado:
  - Nombre: normal (`Juan Pérez`).
  - Email: válido.
  - Teléfono: válido.
  - Imagen: una foto `.jpg` o `.png`.
- **[ ]** Guarda y confirma que:
  - El empleado aparece en la lista.
  - La imagen se ve en el avatar.
  - No hay errores en consola ni en la API.

### 2.2. Sanitización de `name`, `email`, `phone`

- **[ ]** Edita ese empleado.
- **[ ]** En el campo `Nombre` escribe:
  - `<img src=x onerror=alert('xss')>`
- **[ ]** Guarda y luego vuelve a abrir el empleado:
  - **Esperado:** el nombre aparece sin `<` ni `>`, por ejemplo `img src=x onerror=alert('xss')`.
  - No se ejecuta ningún JavaScript en ninguna vista donde aparece el nombre.
- **[ ]** Haz algo similar con `email` y `phone` (incluyendo caracteres raros):
  - Guardar, volver a abrir y confirmar que se ven razonables/sanitizados.

### 2.3. Uso del empleado en otras vistas

- **[ ]** Verifica:
  - En `/dashboard/management` (agenda) y `/dashboard/history` las columnas/nombres de empleados se muestran bien y no rompen el layout.
  - En el Booking Modal, si se usa la foto/nombre del empleado, se ve correcto.

---

## 3. Servicios (API y dashboard)

### 3.1. Crear servicio

- **[ ]** Ve a `/dashboard/services`.
- **[ ]** Crea un servicio con:
  - Nombre: normal.
  - Descripción: normal.
  - Duración, precio: correctos.
  - Imagen de servicio: `.jpg` o `.png`.
- **[ ]** Guarda y confirma que:
  - Aparece en la lista de servicios.
  - Se ve correctamente en el dashboard y en el perfil público `/[urlName]` (en la sección Servicios).

### 3.2. Sanitización de `name` y `description`

- **[ ]** Edita el servicio:
  - Nombre: `<script>alert(1)</script>`.
  - Descripción: una cadena larga con HTML o `<img ...>` malicioso.
- **[ ]** Guarda y:
  - Reabre el servicio en el dashboard.
  - Revisa la sección Servicios en `/[urlName]`.
- **Esperado:**
  - Se ve texto plano sin `<` ni `>`.
  - No se ejecuta código.
  - El truncado de descripción sigue funcionando (line clamp, etc.).

---

## 4. Turnos (reservas) y datos de clientes

### 4.1. Booking desde la minilanding pública

- **[ ]** Abre un perfil público `/[urlName]`.
- **[ ]** Haz clic en “Reservar turno” en algún servicio.
- **[ ]** Completa el flujo de `BookingModal` con:
  - Nombre cliente: normal.
  - Email y teléfono válidos.
- **[ ]** Confirma la reserva.
- **[ ]** Verifica:
  - En `/dashboard/management` el turno aparece con el nombre del cliente correcto.
  - En `/dashboard/history` también.
  - No hay errores en consola.

### 4.2. Booking con payload malicioso

- **[ ]** Repite la reserva, pero ahora usando:
  - `Nombre`: `<img src=x onerror=alert('xss')>`
  - `Email`: algo con `<` y `>` incluidos.
- **[ ]** Completa el flujo.
- **[ ]** Verifica en:
  - `/dashboard/management`: el nombre aparece sin `<` `>`.
  - `/dashboard/history`: igual.
- **[ ]** Si el sistema envía email al cliente (según config):
  - Comprueba el correo: los valores deberían verse escapados correctamente (sin ejecutar HTML).

### 4.3. Reservas creadas desde `/dashboard/management`

- **[ ]** En la agenda (`/dashboard/management`), usa el formulario “directo” sobre un slot:
  - Carga `clientName`, `clientEmail`, `clientPhone`.
  - Incluye un caso con `<script>` en el nombre.
- **[ ]** Guarda.
- **[ ]** Verifica:
  - El turno se crea correctamente.
  - La lista de turnos y el historial muestran los datos saneados.
  - No hay errores en consola.

---

## 5. Upload de imágenes (servicios, empleados, perfil)

### 5.1. Archivos válidos

Para cada uno:

- Empleado (imagen de empleado).
- Servicio (`serviceImage`).
- Perfil (`profileImage`, `coverImage`).

**[ ]** Intenta subir:

- `.jpg`
- `.png`
- `.webp` o `.avif` (si tenés alguno)

**Esperado:**

- Se sube bien.
- Se ve la imagen en las vistas correspondientes.
- No hay errores en la consola.

### 5.2. Archivos inválidos

Para cada formulario de imagen:

- **[ ]** Intenta subir un `.pdf` o `.txt` o cualquier archivo no imagen.
- **Esperado:**
  - La API debería devolver un error de “Tipo de archivo no permitido” o error 500 si no está manejado en el frontend.
  - El UI no debería romperse: a lo sumo verás un toast genérico de error o el formulario no se guardará.

*(Si ves que el error llega fino al usuario, podrías luego mejorar el mensaje de error, pero funcionalmente la restricción está bien.)*

---

## 6. Enlaces públicos y prevención de `javascript:` (recheck end-to-end)

- **[ ]** En `/dashboard/profile`:
  - Intenta agregar manualmente un `publicLink` con `javascript:alert(1)` y guardar.
- **[ ]** Refresca `/dashboard/profile`:
  - El enlace no debería aparecer o su URL debe estar vacía / no válida.
- **[ ]** En el código, si inspeccionás la respuesta de `/api/profile`:
  - `publicLinks` devueltos por el API deberían contener solo URLs con `http(s)`, `mailto`, `tel`.

---

## 7. Sesión y cookies (`sessionManager`)

### 7.1. Login / logout

- **[ ]** Inicia sesión normalmente.
- **[ ]** Abre DevTools → Application → Local Storage & Cookies.
  - `localStorage['userSession']` debe contener un JSON legible.
  - La cookie `userSession` debe contener una cadena URL-encoded (no JSON crudo con comillas sin codificar).
- **[ ]** Cierra sesión:
  - Valida que `localStorage['userSession']` se borra.
  - Que la cookie `userSession` se elimine o quede con fecha expirada.

### 7.2. Persistencia entre pestañas

- **[ ]** Con sesión iniciada, abre otra pestaña en `/dashboard`.
- **[ ]** Refresca ambas: deben seguir autenticadas.
- **[ ]** Cierra sesión en una pestaña.
- **[ ]** Observa la otra pestaña:
  - En poco tiempo (o al siguiente check del hook) debería redirigirte a `/login` gracias a la lógica en [useSession](cci:1://file:///c:/Users/exe10/Desktop/EsteticaApp0924-pre-deploy/src/hooks/useSession.ts:15:0-103:1).

---

## 8. Regresión general rápida

- **[ ]** Navega por todo el dashboard:
  - `/dashboard`
  - `/dashboard/services`
  - `/dashboard/employees`
  - `/dashboard/profile`
  - `/dashboard/management`
  - `/dashboard/history`
- **[ ]** Ejecuta algunas acciones básicas:
  - Crear/editar servicio.
  - Crear/editar empleado.
  - Crear/cancelar/confirmar un turno.
- **[ ]** Monitoriza consola del navegador y logs de Next.js:
  - No deberían aparecer nuevos errores de TypeScript/Runtime relacionados a los cambios.

---

## 9. Opcional: verificación en base de datos

Si tenés acceso directo a la DB (por ejemplo, vía Prisma Studio o cliente SQL):

- **[ ]** Busca registros recientes en tablas:
  - [PublicProfile](cci:2://file:///c:/Users/exe10/Desktop/EsteticaApp0924-pre-deploy/src/app/%5BurlName%5D/page.tsx:14:0-28:1)
  - [Employee](cci:2://file:///c:/Users/exe10/Desktop/EsteticaApp0924-pre-deploy/src/app/dashboard/management/page.tsx:28:0-31:1)
  - [Service](cci:2://file:///c:/Users/exe10/Desktop/EsteticaApp0924-pre-deploy/src/app/dashboard/management/page.tsx:20:0-26:1)
  - `Client`
- **[ ]** Confirma que:
  - No hay valores con `<script>` o `<img ...>` recién guardados.
  - Los nuevos campos de texto se guardan ya sin `<` y `>`.

---

## Conclusión

Si todos estos checks pasan:

- Los intentos de XSS tipo `<img ... onerror=...>` quedan almacenados como texto “neutralizado”.
- Los `publicLinks` quedan limitados a esquemas seguros.
- Solo se suben imágenes válidas a Blob.
- No se rompieron los flujos normales de creación/edición de perfil, empleados, servicios y turnos.

En caso de que en alguno de los pasos veas un comportamiento distinto a lo esperado, anótalo (ruta, input usado, error exacto) y lo revisamos puntualmente.
```markdown