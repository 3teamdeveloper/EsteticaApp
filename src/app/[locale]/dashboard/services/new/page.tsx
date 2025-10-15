"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"

export default function NewServicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error al crear el servicio")
      }

      router.push("/dashboard/services")
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageName(file.name)
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImageName("")
      setImagePreview(null)
    }
  }

  const clearImage = () => {
    const input = document.getElementById("serviceImage") as HTMLInputElement | null
    if (input) {
      input.value = ""
    }
    setImageName("")
    setImagePreview(null)
  }

  return (
    <div className="container  text-gray-600 mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl text-gray-900 font-bold">Nuevo Servicio</h1>
        <p className="text-gray-500">Crea un nuevo servicio para tu negocio</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nombre del Servicio
          </label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Ej: Corte de Cabello"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="duration" className="text-sm font-medium">
              Duración (minutos)
            </label>
            <Input
              id="duration"
              name="duration"
              type="number"
              required
              min="1"
              placeholder="30"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Precio
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="1000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Descripción
          </label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe el servicio..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="serviceImage" className="text-sm font-medium">
            Imagen del Servicio
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="h-16 w-16 rounded-md object-cover border border-gray-200"
              />
            )}
            <div className="flex items-center gap-2">
              <label
                htmlFor="serviceImage"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? "Cambiar imagen" : "Subir imagen"}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> Quitar
                </button>
              )}
            </div>
          </div>
          {imageName && (
            <p className="text-xs text-gray-500">Seleccionado: {imageName}</p>
          )}
          <p className="text-xs text-gray-500">Formatos JPG o PNG, tamaño recomendado cuadrado.</p>
          <input
            id="serviceImage"
            name="serviceImage"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Servicio"}
          </button>
        </div>
      </form>
    </div>
  )
} 