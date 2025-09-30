"use client"

//TODO: 1/terminar de desarrollar funciones CRUD de servicios 2/revisar ui 3/mejorar SSR/SERVER COMPONENTS

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Eye, EyeOff, Trash2 } from "lucide-react"
import { useTrial } from '@/hooks/useTrial';

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string | null
  isActive: boolean
  deleted: boolean
}

export default function ServicesPage() {
  const { trialStatus } = useTrial();
  const [services, setServices] = useState<Service[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, service?: Service }>({ open: false })
  const router = useRouter()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services")
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error("Error al cargar los servicios:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRowExpanded = (id: number) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const getDescriptionPreview = (text: string, maxLength = 160) => {
    if (text.length <= maxLength) return text
    const slice = text.slice(0, maxLength)
    const lastSpace = slice.lastIndexOf(" ")
    return (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim()
  }

  const handleCreateService = () => {
    router.push("/dashboard/services/new")
  }

  const handleEditService = (id: number) => {
    router.push(`/dashboard/services/${id}/edit`)
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error al actualizar el estado del servicio:", error)
    }
  }

  const handleDeleteService = (service: Service) => {
    setDeleteModal({ open: true, service })
  }

  const confirmDeleteService = async () => {
    if (!deleteModal.service) return
    
    try {
      const response = await fetch(`/api/services/${deleteModal.service.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error al eliminar el servicio:", error)
    } finally {
      setDeleteModal({ open: false })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
        <Button
          onClick={handleCreateService}
          disabled={!trialStatus?.isActive}
          className={!trialStatus?.isActive ? 'opacity-50 cursor-not-allowed' : ''}
          title={!trialStatus?.isActive ? 'Actualiza tu plan para agregar servicios' : ''}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo
        </Button>
      </div>
      {trialStatus && !trialStatus.isActive && (
        <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm">
          Tu trial ha expirado. Actualiza tu plan para agregar o editar servicios.
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración (min)
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 break-words">
                    {service.name}
                    {/* Detalle móvil apilado */}
                    <div className="sm:hidden mt-2 space-y-2 text-xs text-gray-600">
                      <div className="flex flex-wrap gap-x-2">
                        <span className="font-medium text-gray-700">Duración:</span>
                        <span>{service.duration} min</span>
                      </div>
                      <div className="flex flex-wrap gap-x-2">
                        <span className="font-medium text-gray-700">Precio:</span>
                        <span>${service.price}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700">Estado:</span>
                        <span
                          className={`px-2 inline-flex text-[10px] leading-5 font-semibold rounded-full ${
                            service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {service.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      {service.description && (
                        <div className="text-gray-500 break-words">
                          {expandedRows[service.id] ? (
                            <>
                              <span>{service.description}</span>{' '}
                              <button
                                type="button"
                                onClick={() => toggleRowExpanded(service.id)}
                                className="text-rose-600 hover:underline font-medium"
                              >
                                ver menos
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{getDescriptionPreview(service.description)}</span>
                              {service.description.length > 160 && (
                                <>
                                  <span>… </span>
                                  <button
                                    type="button"
                                    onClick={() => toggleRowExpanded(service.id)}
                                    className="text-rose-600 hover:underline font-medium"
                                  >
                                    ver más
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={() => handleEditService(service.id)}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label="Editar servicio"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(service.id, service.isActive)}
                          className="text-gray-600 hover:text-gray-900"
                          aria-label={service.isActive ? 'Ocultar servicio' : 'Mostrar servicio'}
                        >
                          {service.isActive ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
                          className="text-gray-600 hover:text-red-600"
                          aria-label="Eliminar servicio"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {service.duration}
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    ${service.price}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {service.description || "-"}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        service.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {service.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditService(service.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(service.id, service.isActive)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {service.isActive ? (
                          <Eye className="h-5 w-5" />
                        ) : (
                          <EyeOff className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteService(service)}
                        className="text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">Eliminar servicio</span>
            </div>
            <p className="mb-6">¿Seguro que deseas eliminar el servicio "{deleteModal.service?.name}"?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteService}
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 