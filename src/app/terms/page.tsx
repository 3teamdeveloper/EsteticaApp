import Link from 'next/link';

export default function TermsPage() {
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
            Términos y Condiciones de Uso
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar EsteticaApp ("la Plataforma"), usted acepta estar sujeto a estos Términos y Condiciones de Uso. 
                Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 mb-4">
                EsteticaApp es una plataforma digital que conecta a profesionales de la belleza y estética con clientes, 
                permitiendo la gestión de citas, servicios y perfiles públicos. Nuestros servicios incluyen:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Sistema de gestión de citas y horarios</li>
                <li>Creación de perfiles públicos para profesionales</li>
                <li>Herramientas de administración de servicios y empleados</li>
                <li>Sistema de notificaciones y comunicación</li>
                <li>Procesamiento de pagos a través de terceros</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Registro y Cuentas de Usuario</h2>
              <p className="text-gray-700 mb-4">
                Para utilizar ciertos servicios de la Plataforma, debe crear una cuenta proporcionando información precisa y completa. 
                Usted es responsable de:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                <li>Todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Proporcionar información veraz y actualizada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Uso Aceptable</h2>
              <p className="text-gray-700 mb-4">Al utilizar la Plataforma, usted se compromete a:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
                <li>No utilizar el servicio para actividades ilegales o no autorizadas</li>
                <li>No interferir con el funcionamiento de la Plataforma</li>
                <li>No intentar acceder a cuentas de otros usuarios</li>
                <li>Respetar los derechos de propiedad intelectual</li>
                <li>No publicar contenido ofensivo, difamatorio o inapropiado</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Servicios Profesionales</h2>
              <p className="text-gray-700 mb-4">
                Los profesionales que utilizan la Plataforma son responsables de:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Poseer las licencias y certificaciones requeridas para sus servicios</li>
                <li>Cumplir con los estándares de higiene y seguridad aplicables</li>
                <li>Proporcionar servicios de calidad profesional</li>
                <li>Mantener la confidencialidad de la información del cliente</li>
                <li>Gestionar adecuadamente las citas y horarios</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Pagos y Facturación</h2>
              <p className="text-gray-700 mb-4">
                Los pagos se procesan a través de proveedores de servicios de pago terceros. Al realizar un pago:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Autoriza el cargo por los servicios contratados</li>
                <li>Acepta las políticas del procesador de pagos</li>
                <li>Reconoce que los reembolsos están sujetos a las políticas del profesional</li>
                <li>Entiende que EsteticaApp actúa como intermediario en las transacciones</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Período de Prueba</h2>
              <p className="text-gray-700 mb-4">
                Ofrecemos un período de prueba gratuito de 14 días para nuevos usuarios profesionales. 
                Durante este período, tiene acceso completo a las funcionalidades de la Plataforma. 
                Al finalizar el período de prueba, debe suscribirse a un plan de pago para continuar utilizando los servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                EsteticaApp actúa como una plataforma de conexión entre profesionales y clientes. No somos responsables de:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>La calidad de los servicios prestados por los profesionales</li>
                <li>Disputas entre usuarios de la Plataforma</li>
                <li>Daños resultantes del uso de los servicios profesionales</li>
                <li>Interrupciones temporales del servicio</li>
                <li>Pérdida de datos debido a fallas técnicas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Propiedad Intelectual</h2>
              <p className="text-gray-700 mb-4">
                Todos los derechos de propiedad intelectual de la Plataforma pertenecen a EsteticaApp. 
                Los usuarios conservan los derechos sobre el contenido que publican, pero otorgan a EsteticaApp 
                una licencia para usar dicho contenido en relación con la prestación de los servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Terminación</h2>
              <p className="text-gray-700 mb-4">
                Podemos suspender o terminar su acceso a la Plataforma en caso de violación de estos términos. 
                Usted puede cancelar su cuenta en cualquier momento contactando nuestro servicio de atención al cliente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Modificaciones</h2>
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación en la Plataforma. 
                El uso continuado de los servicios constituye la aceptación de los términos modificados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Ley Aplicable</h2>
              <p className="text-gray-700 mb-4">
                Estos términos se rigen por las leyes de Argentina. Cualquier disputa será resuelta 
                en los tribunales competentes de la Ciudad Autónoma de Buenos Aires.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email: soporte@esteticaapp.com</li>
                <li>Teléfono: +54 11 1234-5678</li>
                <li>Dirección: Buenos Aires, Argentina</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link 
                href="/privacy" 
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                Ver Políticas de Privacidad
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
