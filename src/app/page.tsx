"use client";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Star,
  MessageCircle,
  Calendar,
  Users,
  BarChart3,
  Shield,
  Zap,
  Mail,
  Phone,
} from "lucide-react";

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
  </svg>
);
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="py-8 md:py-24 lg:py-32 bg-white md:bg-gradient-to-b md:from-white md:to-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-600">
                  Gestiona tu negocio de belleza con facilidad
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl">
                  Una solución completa para administrar reservas en
                  peluquerías, barberías, centros de estética, depilación,
                  masajes y todo tipo de servicios de cuidado personal.
                </p>
              </div>
              <div className="flex items-center gap-4 min-[400px]:flex-row">
                <Link
                  href="/register"
                  className="px-4 py-3 text-sm md:text-base text-center font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
                >
                  Comenzar ahora
                </Link>
                <button className="px-4 py-3 text-sm md:text-base font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  Ver demostración
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-rose-600" />
                <span>Prueba gratuita de 14 días</span>
              </div>
            </div>

            <div className="mx-auto lg:mx-0 relative h-[360px] overflow-hidden rounded-2xl bg-white">
              <Image
                src="/images/dashboard3.png"
                alt="Dashboard de CitaUp"
                width={1280}
                height={720}
                className="object-contain md:object-cover w-full h-full rounded-2xl"
                priority
              />
              {/* Gradiente en los 4 bordes */}
              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                {/* Top */}
                <div
                  className="absolute inset-x-0 top-0 h-24 md:h-20 rounded-t-2xl"
                  style={{
                    background:
                      "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* Bottom */}
                <div
                  className="absolute inset-x-0 bottom-[42px] md:bottom-[-16px] h-[12px] md:h-12 rounded-b-2xl"
                  style={{
                    background:
                      "linear-gradient(to top, white 0%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* Left */}
                <div
                  className="absolute inset-y-0 left-0 w-16 md:w-20 rounded-l-2xl"
                  style={{
                    background:
                      "linear-gradient(to right, white 0%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0) 100%)",
                  }}
                />
                {/* Right */}
                <div
                  className="absolute inset-y-0 right-0 w-2 md:w-16 rounded-r-2xl"
                  style={{
                    background:
                      "linear-gradient(to left, white 0%, rgba(255,255,255,0.2) 80%, rgba(255,255,255,0) 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="features" className="py-0 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu negocio
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas completas para gestionar tu negocio de belleza de
              manera profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <Calendar className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sistema de Reservas
              </h3>
              <p className="text-gray-600">
                Gestiona turnos, horarios y disponibilidad de empleados de forma
                intuitiva
              </p>
            </div>

            <div className="text-center p-6">
              <Users className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gestión de Empleados
              </h3>
              <p className="text-gray-600">
                Administra tu equipo, asigna servicios y controla horarios
                individuales
              </p>
            </div>

            <div className="text-center p-6">
              <BarChart3 className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Reportes y Estadísticas
              </h3>
              <p className="text-gray-600">
                Analiza el rendimiento de tu negocio con reportes detallados
              </p>
            </div>

            <div className="text-center p-6">
              <MessageCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Notificaciones
              </h3>
              <p className="text-gray-600">
                Sistema de alertas para confirmaciones y recordatorios
                automáticos
              </p>
            </div>

            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Perfil Público
              </h3>
              <p className="text-gray-600">
                Página web para mostrar servicios, fotos, redes sociales y que
                tus clientes reserven online
              </p>
            </div>

            <div className="text-center p-6">
              <Zap className="w-12 h-12 text-rose-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fácil de Usar
              </h3>
              <p className="text-gray-600">
                Maneja tu negocio con una interfaz intuitiva diseñada para
                optimizar tus tareas diarias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-lg text-gray-600">
              Comienza gratis y escala según tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan Pro */}
            <div className="bg-white rounded-lg shadow-lg p-8 border border-rose-600 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-rose-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                <div className="text-4xl font-bold text-rose-600 mb-2">
                  $20<span className="text-lg text-gray-600">/mes</span>
                </div>
                <p className="text-gray-600">
                  Perfecto para negocios pequeños y medianos
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Sistema de reservas completo</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Gestión de empleados ilimitada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Perfil público personalizable</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Reportes y estadísticas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Notificaciones automáticas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte por email</span>
                </li>
              </ul>

              <div className="flex justify-center flex-col gap-4 md:flex-row">
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 bg-rose-600 text-white font-medium rounded-md hover:bg-rose-700 transition-colors"
                >
                  Comenzar gratis
                </Link>
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 text-rose-600 border-2 border-rose-600 font-semibold rounded-md hover:bg-gray-50 hover:text-rose-700 transition-colors"
                >
                  Contratar plan
                </Link>
              </div>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Enterprise
                </h3>
                <div className="text-4xl font-bold text-rose-600 mb-2">
                  A convenir
                </div>
                <p className="text-gray-600">Para cadenas y empresas grandes</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Todo lo del plan Pro</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Múltiples sucursales</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Integración con sistemas existentes</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Soporte prioritario 24/7</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>Capacitación personalizada</span>
                </li>
              </ul>

              <button className="w-full block text-center px-6 py-3 text-rose-600 border-2 border-rose-600 font-semibold rounded-md hover:bg-gray-50 hover:text-rose-700 transition-colors">
                Contactar ventas
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              <strong>Prueba gratuita de 14 días</strong> en todos los planes.
              Sin tarjeta de crédito requerida.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonials" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-gray-600">
              Historias reales de profesionales que transformaron su negocio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Testimonio 1 - Instagram style */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    Maria_Alvarez
                  </div>
                  <div className="text-sm text-gray-500">Peluquería María</div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">
                "Desde que uso CitaUp, mi agenda está perfectamente organizada.
                Los clientes pueden reservar online y yo tengo todo bajo
                control. ¡Totalmente recomendado! 💇‍♀️✨"
              </p>
            </div>

            {/* Testimonio 2 - Google style */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  C
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    Carlos Rodríguez
                  </div>
                  <div className="text-sm text-gray-500">Barbería Clásica</div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">
                "Excelente sistema. Me ahorra mucho tiempo en la gestión diaria.
                Los reportes me ayudan a entender mejor mi negocio y tomar
                decisiones informadas."
              </p>
            </div>

            {/* Testimonio 3 - WhatsApp style */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    Ana Martínez
                  </div>
                  <div className="text-sm text-gray-500">
                    Centro de Estética
                  </div>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-gray-700">
                "Las notificaciones automáticas son geniales. Mis clientes nunca
                más se olvidan de sus citas. El perfil público atrae nuevos
                clientes constantemente. ¡Muy satisfecha! 😊"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Tienes preguntas?
            </h2>
            <p className="text-lg text-gray-600">
              Estamos aquí para ayudarte. Contáctanos por cualquiera de estos
              medios:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <Link href="#" className="group inline-block">
                <IconInstagram className="w-10 h-10 text-rose-600 mx-auto mb-3 group-hover:opacity-90 transition" />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Instagram
                </h3>
                <p className="text-gray-600">@3teamdeveloper</p>
              </Link>
            </div>

            <div className="text-center">
              <Link href="#" className="group inline-block">
                <Mail className="w-10 h-10 text-rose-600 mx-auto mb-3 group-hover:opacity-90 transition" />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  Email
                </h3>
                <p className="text-gray-600">3team.developer@gmail.com</p>
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="https://wa.me/15551234567"
                className="group inline-block"
              >
                <Phone className="w-10 h-10 text-rose-600 mx-auto mb-3 group-hover:opacity-90 transition" />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  WhatsApp
                </h3>
                <p className="text-gray-600">+54 9 11 2233 4455</p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} CitaUp. Todos los derechos
              reservados.
            </p>
            <p className="text-sm text-gray-600">
              Desarrollado con ❤️ por{" "}
              <span className="font-semibold">3TeamDeveloper</span>
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a
                href="https://citaup.com/privacy"
                className="hover:text-rose-600"
              >
                Políticas de privacidad
              </a>
              <a
                href="https://citaup.com/terms"
                className="hover:text-rose-600"
              >
                Términos y condiciones
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
