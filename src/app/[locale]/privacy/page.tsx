import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-rose-600 hover:text-rose-700 font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Políticas de Privacidad
          </h1>

          <div className="prose prose-gray max-w-none">
            <p className="text-sm text-gray-500 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introducción</h2>
              <p className="text-gray-700 mb-4">
                En EsteticaApp valoramos y respetamos su privacidad. Esta Política de Privacidad describe cómo recopilamos, 
                utilizamos, almacenamos y protegemos su información personal cuando utiliza nuestra plataforma y servicios.
              </p>
              <p className="text-gray-700 mb-4">
                Al utilizar EsteticaApp, usted acepta las prácticas descritas en esta política. 
                Si no está de acuerdo con estas prácticas, no utilice nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Información que Recopilamos</h2>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">2.1 Información Personal</h3>
              <p className="text-gray-700 mb-4">Recopilamos la siguiente información personal:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Información de registro:</strong> nombre, email, teléfono, tipo de negocio</li>
                <li><strong>Información de perfil:</strong> biografía, imágenes, servicios ofrecidos, horarios</li>
                <li><strong>Información de contacto:</strong> dirección, redes sociales, enlaces públicos</li>
                <li><strong>Información de empleados:</strong> datos de empleados y sus servicios asignados</li>
                <li><strong>Información de clientes:</strong> datos de contacto para gestión de citas</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">2.2 Información de Uso</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Registros de actividad en la plataforma</li>
                <li>Información sobre citas y servicios reservados</li>
                <li>Preferencias de configuración y personalización</li>
                <li>Datos de navegación y uso de funcionalidades</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">2.3 Información Técnica</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Dirección IP y ubicación geográfica aproximada</li>
                <li>Tipo de dispositivo y navegador utilizado</li>
                <li>Cookies y tecnologías de seguimiento similares</li>
                <li>Registros de errores y rendimiento del sistema</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Cómo Utilizamos su Información</h2>
              <p className="text-gray-700 mb-4">Utilizamos su información personal para:</p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">3.1 Prestación de Servicios</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Crear y gestionar su cuenta de usuario</li>
                <li>Facilitar la reserva y gestión de citas</li>
                <li>Mostrar su perfil público a potenciales clientes</li>
                <li>Procesar pagos y transacciones</li>
                <li>Enviar notificaciones sobre citas y actividades</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.2 Comunicación</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Enviar confirmaciones de citas y recordatorios</li>
                <li>Proporcionar soporte técnico y atención al cliente</li>
                <li>Informar sobre actualizaciones del servicio</li>
                <li>Enviar comunicaciones promocionales (con su consentimiento)</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">3.3 Mejora del Servicio</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Analizar el uso de la plataforma para mejoras</li>
                <li>Desarrollar nuevas funcionalidades</li>
                <li>Realizar investigación y análisis de mercado</li>
                <li>Prevenir fraudes y garantizar la seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Compartir Información</h2>
              <p className="text-gray-700 mb-4">
                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en las siguientes circunstancias:
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.1 Con su Consentimiento</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Información de perfil público visible para clientes potenciales</li>
                <li>Datos compartidos con otros usuarios para facilitar servicios</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.2 Proveedores de Servicios</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Procesadores de pago (MercadoPago, etc.)</li>
                <li>Servicios de hosting y almacenamiento en la nube</li>
                <li>Proveedores de servicios de email y notificaciones</li>
                <li>Servicios de análisis y monitoreo</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">4.3 Requerimientos Legales</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Cumplimiento de órdenes judiciales o requerimientos legales</li>
                <li>Protección de nuestros derechos y propiedad</li>
                <li>Investigación de actividades fraudulentas o ilegales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Seguridad de los Datos</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Encriptación de datos en tránsito y en reposo</li>
                <li>Autenticación segura con tokens JWT</li>
                <li>Acceso restringido a información personal</li>
                <li>Monitoreo regular de seguridad y vulnerabilidades</li>
                <li>Copias de seguridad regulares de los datos</li>
                <li>Protocolos de respuesta a incidentes de seguridad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Retención de Datos</h2>
              <p className="text-gray-700 mb-4">
                Conservamos su información personal durante el tiempo necesario para:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Proporcionar nuestros servicios mientras mantenga una cuenta activa</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
                <li>Mantener registros de transacciones por períodos requeridos por ley</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Cuando elimine su cuenta, procederemos a eliminar o anonimizar su información personal, 
                excepto cuando la ley requiera su conservación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Sus Derechos</h2>
              <p className="text-gray-700 mb-4">Usted tiene los siguientes derechos respecto a su información personal:</p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-3">7.1 Acceso y Portabilidad</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Solicitar una copia de su información personal</li>
                <li>Obtener sus datos en un formato estructurado y legible</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.2 Rectificación y Actualización</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Corregir información inexacta o incompleta</li>
                <li>Actualizar sus datos de perfil en cualquier momento</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.3 Eliminación</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Solicitar la eliminación de su cuenta y datos asociados</li>
                <li>Retirar el consentimiento para el procesamiento de datos</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">7.4 Limitación y Oposición</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Limitar el procesamiento de su información</li>
                <li>Oponerse a comunicaciones promocionales</li>
                <li>Configurar preferencias de privacidad</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookies y Tecnologías de Seguimiento</h2>
              
              <p className="text-gray-700 mb-6">
                EsteticaApp utiliza cookies para garantizar el funcionamiento correcto de la plataforma. 
                A continuación, detallamos qué tipos de cookies utilizamos y por qué son necesarias.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-3">8.1 Cookies Estrictamente Necesarias</h3>
              <p className="text-gray-700 mb-4">
                Estas cookies son <strong>esenciales</strong> para el funcionamiento de la plataforma y 
                <strong>no se pueden desactivar</strong> sin afectar gravemente la funcionalidad del sitio.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">Cookies que utilizamos:</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li><strong>• token:</strong> Cookie de autenticación JWT que mantiene su sesión activa</li>
                  <li><strong>• userSession:</strong> Información básica de sesión para el funcionamiento de la aplicación</li>
                  <li><strong>• cookieConsent:</strong> Registra que ha sido informado sobre nuestro uso de cookies</li>
                </ul>
              </div>

              <h4 className="font-medium text-gray-900 mb-2">Propósito de estas cookies:</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Autenticación:</strong> Verificar su identidad y mantener su sesión segura</li>
                <li><strong>Seguridad:</strong> Proteger su cuenta contra accesos no autorizados</li>
                <li><strong>Funcionalidad básica:</strong> Permitir navegación entre páginas manteniendo su estado</li>
                <li><strong>Persistencia de datos:</strong> Recordar sus preferencias durante la sesión</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">8.2 Almacenamiento Local</h3>
              <p className="text-gray-700 mb-4">
                Además de cookies, utilizamos el almacenamiento local del navegador (localStorage) para:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Sincronizar sesiones entre pestañas del navegador</li>
                <li>Mejorar el rendimiento evitando consultas repetidas al servidor</li>
                <li>Mantener preferencias de interfaz durante su visita</li>
              </ul>

              <h3 className="text-lg font-medium text-gray-900 mb-3">8.3 Lo que NO hacemos</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✗ No utilizamos cookies de seguimiento o marketing</li>
                  <li>✗ No compartimos datos con terceros para publicidad</li>
                  <li>✗ No utilizamos cookies de redes sociales</li>
                  <li>✗ No implementamos analytics que identifiquen usuarios</li>
                  <li>✗ No utilizamos cookies de perfilado o comportamiento</li>
                </ul>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-3">8.4 Gestión de Cookies</h3>
              <p className="text-gray-700 mb-4">
                Puede configurar su navegador para rechazar cookies, sin embargo, esto 
                <strong> impedirá el funcionamiento correcto</strong> de EsteticaApp, incluyendo:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Imposibilidad de iniciar sesión o mantener la sesión activa</li>
                <li>Pérdida de funcionalidades de seguridad</li>
                <li>Necesidad de reautenticarse constantemente</li>
              </ul>

              <p className="text-gray-700 mb-4">
                <strong>Duración:</strong> Las cookies de sesión se eliminan al cerrar el navegador. 
                Las cookies persistentes tienen una duración máxima de 7 días para mantener su sesión activa.
              </p>

              <p className="text-gray-700">
                <strong>Base legal:</strong> El uso de estas cookies se basa en nuestro interés legítimo 
                de proporcionar un servicio seguro y funcional, conforme a la Ley de Protección de Datos Personales de Argentina.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Transferencias Internacionales</h2>
              <p className="text-gray-700 mb-4">
                Sus datos pueden ser procesados en servidores ubicados fuera de Argentina. 
                En tales casos, nos aseguramos de que se implementen las salvaguardas adecuadas 
                para proteger su información de acuerdo con los estándares internacionales de privacidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Menores de Edad</h2>
              <p className="text-gray-700 mb-4">
                Nuestros servicios están dirigidos a personas mayores de 18 años. 
                No recopilamos intencionalmente información personal de menores de edad. 
                Si descubrimos que hemos recopilado información de un menor, 
                procederemos a eliminarla inmediatamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Cambios en esta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar 
                cambios en nuestras prácticas o por otros motivos operativos, legales o regulatorios. 
                Le notificaremos sobre cambios significativos a través de la plataforma o por email.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Contacto y Consultas</h2>
              <p className="text-gray-700 mb-4">
                Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, 
                puede contactarnos a través de:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Email:</strong> privacidad@esteticaapp.com</li>
                <li><strong>Teléfono:</strong> +54 11 1234-5678</li>
                <li><strong>Dirección:</strong> Buenos Aires, Argentina</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Nos comprometemos a responder a sus consultas dentro de los 30 días hábiles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Autoridad de Control</h2>
              <p className="text-gray-700 mb-4">
                Si considera que el tratamiento de sus datos personales infringe la normativa aplicable, 
                tiene derecho a presentar una reclamación ante la Agencia de Acceso a la Información Pública (AAIP) 
                de Argentina o la autoridad de protección de datos correspondiente.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link 
                href="/terms" 
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Ver Términos y Condiciones
              </Link>
              <Link 
                href="/" 
                className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
