"use client";

import {
  CheckCircle2,
  User,
  Briefcase,
  Clock,
  Users,
  Share2,
  BookOpen,
  LayoutDashboard,
  Calendar,
  BarChart2,
  Eye,
  Settings,
  Lightbulb,
  HelpCircle,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";

type StepContent = {
  subtitle: string;
  description?: string;
  example?: string;
  note?: string; // 👈 importante
};

type Step = {
  number: number;
  title: string;
  icon: any;
  color: string;
  gradient: string;
  content: StepContent[];
  stepTip?: string;
  note?: string;
  optional?: boolean;
  important?: string;
};

export default function UsagePage() {
  const steps: Step[] = [
    {
      number: 1,
      title: "Completa tu Perfil Público",
      icon: User,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      content: [
        {
          subtitle: "URL de tu perfil",
          description:
            "Esta será la dirección que compartirás con tus clientes.",
          example: "Ejemplo: citaup.com/bella-estetica",
          note: "Usa solo letras minúsculas, números y guiones",
        },
        {
          subtitle: "Título de tu página",
          description: "El nombre que verán tus clientes.",
          example: 'Ejemplo: "Bella Estética - Salón de Belleza"',
        },
        {
          subtitle: "Descripción o biografía",
          description:
            "Cuenta brevemente sobre tu negocio, servicios destacados, años de experiencia.",
        },
        {
          subtitle: "Imágenes",
          description:
            "Agrega una foto de portada atractiva de tu salón o trabajo, y tu logo o imagen representativa.",
        },
        {
          subtitle: "Personalización visual (Opcional)",
          description:
            "Elige colores que representen tu marca y selecciona el estilo de diseño que más te guste.",
        },
      ],
      stepTip: "Un perfil completo genera más confianza en tus clientes.",
    },
    {
      number: 2,
      title: "Crea tus Servicios",
      icon: Briefcase,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      content: [
        {
          subtitle: "Nombre del servicio",
          example:
            'Ejemplos: "Corte de cabello", "Manicura completa", "Masaje relajante"',
        },
        {
          subtitle: "Duración",
          description: "¿Cuánto tiempo te toma realizar este servicio?",
          example: "Ejemplo: 45 minutos",
          note: "Esto es importante para que el sistema calcule los horarios disponibles",
        },
        {
          subtitle: "Precio",
          description: "El costo que cobras por este servicio.",
        },
        {
          subtitle: "Descripción (Opcional pero recomendado)",
          description: "Explica qué incluye el servicio.",
          example:
            'Ejemplo: "Corte personalizado con lavado, secado y peinado incluido"',
        },
        {
          subtitle: "Foto del servicio (Opcional)",
          description: "Una imagen que muestre el resultado del servicio.",
        },
      ],
      stepTip:
        "Crea todos los servicios que ofreces. Puedes editarlos o agregar más después.",
    },
    {
      number: 3,
      title: "Configura tus Horarios de Atención",
      icon: Clock,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      content: [
        {
          subtitle: "Selecciona los días que trabajas",
          example: "Ejemplo: Lunes a Sábado",
        },
        {
          subtitle: "Horario de apertura y cierre",
          description: "Define el horario para cada día.",
          example:
            "Ejemplo: Lunes a Viernes de 9:00 a 18:00, Sábados de 10:00 a 14:00",
        },
        {
          subtitle: "Horarios divididos",
          description:
            "Si cierras al mediodía, puedes configurar dos períodos.",
          example: "Ejemplo: 9:00-13:00 y 15:00-19:00",
        },
      ],
      stepTip: "Solo se mostrarán turnos disponibles dentro de estos horarios.",
    },
    {
      number: 4,
      title: "Agrega a tu Equipo",
      icon: Users,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
      optional: false,
      content: [
        {
          subtitle: "Datos básicos",
          description: "Nombre completo, email, teléfono y foto (opcional).",
        },
        {
          subtitle: "Asigna servicios",
          description: "Selecciona qué servicios puede realizar este empleado.",
          example:
            'Ejemplo: María puede hacer "Corte" y "Coloración", pero no "Manicura"',
        },
        {
          subtitle: "Configura sus horarios",
          description:
            "Define qué días y horarios trabaja cada empleado. Pueden ser diferentes a los horarios generales del negocio.",
        },
      ],
      note: "Al agregar un empleado, el sistema te envía un correo con un enlace para que el empleado pueda confirmar su cuenta. Una vez confirmado, podrá iniciar sesión y gestionar sus propios turnos, sin visualizar informacion privada como tu perfil público, servicios, ingresos del negocio, etc.",
      important:
        "Si trabajas solo, debes crearte a ti mismo como empleado para que el sistema pueda asignar las reservas correctamente.",
    },
    {
      number: 5,
      title: "Comparte tu Página con Clientes",
      icon: Share2,
      color: "bg-rose-500",
      gradient: "from-rose-500 to-rose-600",
      content: [
        {
          subtitle: "Tu página pública está lista",
          description:
            "Encontrarás tu enlace personalizado en la sección de Perfil Público.",
          example: "citaup.com/tu-url-personalizada",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 p-2 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          {/* <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"> */}
          {/* <BookOpen className="w-6 h-6" /> */}
          {/* </div> */}
          <h1 className="text-3xl font-bold">
            Configuración inicial de tu cuenta
          </h1>
        </div>
        <p className="text-rose-100 text-lg">
          Sigue estos pasos para dejar tu cuenta lista y comenzar a recibir
          reservas de tus clientes. Desde la agenda de turnos, vas a poder
          gestionar tus citas de forma simple y rápida, organizar tu equipo y
          optimizar tu atención.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Step Header */}
              <div
                className={`bg-gradient-to-r ${step.gradient} p-4 md:p-6 text-white`}
              >
                {/* Mobile: Stack vertically */}
                <div className="flex flex-col gap-3 md:hidden">
                  <div className="flex flex-col gap-2 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium bg-white/20 px-3 py-1 rounded-full">
                        Paso {step.number}
                      </span>
                    </div>
                      <h3 className="text-xl font-semibold flex items-center gap-2"><Icon className="w-6 h-6" /> {step.title}</h3>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {/* <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0"> */}

                    {/* </div> */}
                    {step.optional && (
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        Opcional
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop: Horizontal layout */}
                <div className="hidden md:flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-2xl font-bold flex items-center gap-2"><Icon className="w-6 h-6" /> {step.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      Paso {step.number}
                    </span>
                    {step.optional && (
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        Opcional
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              <div className="p-6 space-y-4">
                {step.content.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${step.color}`}
                      ></span>
                      {item.subtitle}
                    </h4>
                    {item.description && (
                      <p className="text-gray-700 ml-4">{item.description}</p>
                    )}
                    {item.example && (
                      <div className="ml-4 bg-gray-50 border-l-4 border-gray-300 p-3 rounded">
                        <p className="text-sm text-gray-600 italic">
                          {item.example}
                        </p>
                      </div>
                    )}
                    {item.note && (
                      <div className="ml-4 bg-blue-50 border border-blue-400 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">💡 Nota:</span>{" "}
                          {item.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Step Tip */}
                {step.stepTip && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">💡 Consejo:</span>{" "}
                      {step.stepTip}
                    </p>
                  </div>
                )}

                {/* Note*/}
                {step.note && (
                  <div className="mt-4 bg-blue-50 border border-blue-400 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">💡 Nota:</span>{" "}
                      {step.note}
                    </p>
                  </div>
                )}

                {/* Important Note */}
                {step.important && (
                  <div className="mt-4 bg-rose-50 border border-rose-200 rounded-lg p-4">
                    <p className="text-sm text-rose-900">
                      <span className="font-semibold">⚠️ Importante:</span>{" "}
                      {step.important}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mb-12 ">
        <div className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-4 rounded-lg font-bold text-lg md:text-xl md:p-10 shadow-lg">
          ¡Listo! Tu sistema de reservas online está funcionando. 🎉
        </div>
      </div>

      {/* What clients will see */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 md:p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ThumbsUp className="w-7 h-7 text-purple-600" />
          ¿Qué verán tus clientes?
        </h2>
        <div className="space-y-3 p-6 text-gray-700">
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>
              Verán tu perfil con fotos, descripción y servicios disponibles
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>Elegirán un servicio de tu catálogo</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>
              Seleccionarán fecha y hora (solo verán horarios disponibles)
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>Completarán sus datos (nombre, email, teléfono)</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-purple-600 font-bold mt-1">•</span>
            <span>Confirmarán la reserva</span>
          </p>
        </div>
        
        <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
          <p className="font-semibold text-gray-900 mb-2">Tú recibirás:</p>
          <ul className="space-y-1 text-gray-700 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Notificación de la nueva reserva
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Los datos del cliente
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              La reserva aparecerá en tu Agenda de Turnos
            </li>
          </ul>
        </div>

      </div>

      {/* Management Tools */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 md:p-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-7 h-7 text-blue-600" />
          Herramientas de Gestión
        </h2>
        <p className="text-gray-700 mb-6">
          Una vez completados los pasos anteriores, tendrás acceso a estas
          herramientas para administrar tu negocio:
        </p>

        <div className="space-y-4">
          {/* Dashboard Principal */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  Dashboard Principal
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Tu centro de control. Aquí verás un resumen completo de tu
                  negocio:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Total de servicios activos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Cantidad de empleados en tu equipo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Citas del mes en curso
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                    Accesos rápidos a todas las secciones
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agenda de Turnos */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  Agenda de Turnos
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Gestiona todas tus reservas en un solo lugar:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Visualiza todas las citas en un calendario interactivo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Filtra por empleado, servicio o estado de la reserva
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Confirma, cancela o modifica turnos fácilmente
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Ve los detalles completos de cada cliente y reserva
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Crea reservas manualmente cuando sea necesario
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white rounded-lg p-5 border border-blue-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  Estadísticas
                </h3>
                <p className="text-gray-700 text-sm mb-3">
                  Analiza el rendimiento de tu negocio con datos claros:
                </p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Ingresos totales y proyecciones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Servicios más solicitados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Rendimiento de cada empleado
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Horarios con mayor demanda
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Gráficos y reportes para tomar mejores decisiones
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">💡 Tip:</span> Estas
            herramientas se actualizan automáticamente con cada nueva reserva.
            Revísalas regularmente para optimizar tu atención y hacer crecer tu
            negocio.
          </p>
        </div>
      </div>

      {/* Success Tips */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-7 h-7 text-white" />
          Consejos para el Éxito
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              title: "Mantén actualizado tu calendario",
              desc: "Revisa diariamente las nuevas reservas",
            },
            {
              title: "Responde rápido",
              desc: "Confirma o modificá turnos cuando sea necesario",
            },
            {
              title: "Comparte tu link regularmente",
              desc: "Cuanto más lo difundas, más reservas recibirás",
            },
            {
              title: "Mantén tu perfil atractivo",
              desc: "Actualiza fotos y descripciones periódicamente",
            },
          ].map((tip, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
            >
              <h3 className="font-semibold mb-1">{tip.title}</h3>
              <p className="text-sm text-green-100">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
          <HelpCircle className="w-7 h-7 text-rose-600" />
          ¿Necesitas Ayuda?
        </h2>
        <p className="text-gray-600 mb-6">
          Si tienes dudas o problemas, ve a{" "}
          <span className="font-semibold text-rose-600">
            <Link href="/dashboard/settings/support">Soporte</Link>
          </span>{" "}
          en el menú del dashboard y envía tu consulta. Te responderemos a la
          brevedad.
        </p>
      </div>
    </div>
  );
}
