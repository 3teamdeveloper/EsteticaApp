"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, AlertCircle, Bug, CreditCard, Lightbulb, HelpCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { useSession } from "@/hooks/useSession";

const CATEGORIES = [
  { value: "TECHNICAL", label: "Problema Técnico", icon: Bug, color: "text-red-600" },
  { value: "FEATURE_REQUEST", label: "Solicitud de Funcionalidad", icon: Lightbulb, color: "text-yellow-600" },
  { value: "BILLING", label: "Facturación", icon: CreditCard, color: "text-green-600" },
  { value: "BUG_REPORT", label: "Reporte de Error", icon: AlertCircle, color: "text-orange-600" },
  { value: "OTHER", label: "Otro", icon: HelpCircle, color: "text-blue-600" }
];

const PRIORITIES = [
  { value: "LOW", label: "Baja", description: "Consulta general o mejora menor" },
  { value: "MEDIUM", label: "Media", description: "Problema que afecta el uso normal" },
  { value: "HIGH", label: "Alta", description: "Problema que impide trabajar correctamente" },
  { value: "URGENT", label: "Urgente", description: "Sistema completamente inaccesible" }
];

export default function Support() {
  const { session } = useSession();
  const toast = useToastContext();
  const router = useRouter();

  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "TECHNICAL",
    priority: "MEDIUM",
    userPhone: ""
  });
  const [loading, setLoading] = useState(false);
  interface Ticket {
    id: number;
    ticketNumber: string;
    subject: string;
    category: string;
    status: string;
    createdAt: string;
  }

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.push("error", "El asunto es obligatorio");
      return;
    }

    if (!formData.message.trim()) {
      toast.push("error", "El mensaje es obligatorio");
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.push("error", "El mensaje debe tener al menos 10 caracteres");
      return;
    }

    setLoading(true);
    try {
      // Collect browser and device info
      const browserInfo = navigator.userAgent;
      const deviceInfo = `${window.screen.width}x${window.screen.height}, ${navigator.platform}`;

      const ticketData = {
        ...formData,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        userPhone: formData.userPhone.trim() || null,
        browserInfo,
        deviceInfo
      };

      const res = await fetch("/api/support/create-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticketData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.push("error", data.error || "No se pudo enviar el ticket de soporte");
        return;
      }

      // Show success message with ticket ID
      const ticketId = data.ticketId || "#000000";
      toast.push("success", `Ticket ${ticketId} enviado correctamente. Guarda este número para seguimiento. Te contactaremos pronto.`);
      
      // Reset form
      setFormData({
        subject: "",
        message: "",
        category: "TECHNICAL",
        priority: "MEDIUM",
        userPhone: ""
      });
      
      // Refresh tickets list
      await fetchTickets();
      
      // Redirect to settings after a short delay
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting ticket:', err);
      toast.push("error", "Error de red o del servidor");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(cat => cat.value === formData.category);

  // Fetch user's previous tickets
  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch('/api/support/tickets');
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  // Load tickets on component mount
  useEffect(() => {
    if (session) {
      fetchTickets();
    }
  }, [session, fetchTickets]);

  // Status display helpers
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'CLOSED': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Abierto';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'RESOLVED': return 'Resuelto';
      case 'CLOSED': return 'Cerrado';
      default: return 'Desconocido';
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  return (
    <div className="max-w-4xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors pt-8"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Soporte Técnico</h1>
          <p className="text-gray-600">Contacta con nuestro equipo para recibir ayuda personalizada.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulario principal */}
        <div className="lg:col-span-2">
          <section className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Crear Ticket de Soporte</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Categoría y Prioridad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {PRIORITIES.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label} - {priority.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe brevemente tu consulta o problema"
                  required
                />
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción detallada *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Explica tu consulta o problema con el mayor detalle posible. Incluye pasos para reproducir el error si aplica."
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres. Cuanto más detallada sea tu descripción, mejor podremos ayudarte.
                </p>
              </div>

              {/* Información adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  name="userPhone"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opcional - para contacto urgente"
                />
              </div>


              {/* Botones */}
              <div className="flex justify-end gap-3">
                <Link
                  href="/dashboard/settings"
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar Ticket"}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Panel lateral con información */}
        <div className="space-y-6">
          {/* Categoría seleccionada */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Categoría Seleccionada</h3>
            <div className="flex items-center gap-3">
              {selectedCategory && (
                <>
                  <selectedCategory.icon className={`h-6 w-6 ${selectedCategory.color}`} />
                  <span className="font-medium">{selectedCategory.label}</span>
                </>
              )}
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Información Importante</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Responderemos en un plazo máximo de 24 horas</li>
              <li>• Para problemas urgentes, incluye tu teléfono</li>
              <li>• <strong>Guarda el número de ticket que aparecerá al enviar</strong></li>
              <li>• Recibirás actualizaciones por email</li>
            </ul>
          </div>

          {/* Consejos */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consejos para un mejor soporte</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Describe los pasos exactos que realizaste</li>
              <li>• Incluye capturas de pantalla si es posible</li>
              <li>• Menciona qué navegador estás usando</li>
              <li>• Indica si el problema es recurrente</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tickets Previos */}
      <div className="mt-8">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Mis Tickets de Soporte</h2>
          
          {loadingTickets ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tienes tickets de soporte aún.</p>
              <p className="text-sm text-gray-400">Cuando envíes tu primer ticket, aparecerá aquí.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asunto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket: Ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.ticketNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {ticket.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {getCategoryLabel(ticket.category)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm text-gray-900">
                            {getStatusLabel(ticket.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
