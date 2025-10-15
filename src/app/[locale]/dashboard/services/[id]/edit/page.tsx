"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import { useTrial } from '@/hooks/useTrial';
import { useTranslations, useLocale } from 'next-intl';

interface Service {
  id: number
  name: string
  duration: number
  price: number
  description: string | null
  isActive: boolean
  serviceImage?: string | null
}

export default function EditServicePage() {
  const t = useTranslations('services');
  const locale = useLocale();
  const { trialStatus } = useTrial();
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>("")

  useEffect(() => {
    if (params.id !== "new") {
      fetchService()
    } else {
      setLoading(false)
    }
  }, [params.id])

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        //console.log("Datos del servicio cargados:", data)
        setService(data)
        if (data?.serviceImage) {
          setImagePreview(data.serviceImage)
        }
      } else {
        console.error(t('errors.load'), response.status)
        if (response.status === 404) {
          router.push(`/${locale}/dashboard/services`)
        }
      }
    } catch (error) {
      console.error(t('errors.load'), error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const response = await fetch(
        params.id === "new" ? "/api/services" : `/api/services/${params.id}`,
        {
          method: params.id === "new" ? "POST" : "PUT",
          body: formData,
        }
      )

      if (response.ok) {
        router.push(`/${locale}/dashboard/services`)
      } else {
        console.error(t('form.error_save'))
      }
    } catch (error) {
      console.error(t('form.error_save'), error)
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
      setImagePreview(service?.serviceImage ?? null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {params.id === "new" ? t('form.title_new') : t('form.title_edit')}
      </h1>
      {trialStatus && !trialStatus.isActive && (
        <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm">
          {t('trial_expired')}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6 text-gray-600 max-w-2xl">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('form.name_label')}
          </label>
          <Input   
            id="name"
            name="name"
            defaultValue={service?.name}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            {t('form.duration_label')}
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="1"
            defaultValue={service?.duration}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            {t('form.price_label')}
          </label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={service?.price}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {t('form.description_label')}
          </label>
          <Textarea
            id="description"
            name="description"
            defaultValue={service?.description || ""}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="serviceImage" className="block text-sm font-medium text-gray-700">
            {t('form.image_label')}
          </label>
          <div className="flex items-center gap-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt={service?.name || t('form.image_preview_alt')}
                className="h-16 w-16 rounded-md object-cover border border-gray-200"
              />
            )}
            <div className="flex items-center gap-2">
              <label
                htmlFor="serviceImage"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <Upload className="h-4 w-4" />
                {imagePreview ? t('form.change_image') : t('form.upload_image')}
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <X className="h-4 w-4" /> {t('form.remove_image')}
                </button>
              )}
            </div>
          </div>
          {imageName && (
            <p className="text-xs text-gray-500">{t('form.selected_file')} {imageName}</p>
          )}
          <p className="text-xs text-gray-500">{t('form.image_help')}</p>
          <input
            id="serviceImage"
            name="serviceImage"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={trialStatus ? !trialStatus.isActive : false}>
            {params.id === "new" ? t('form.button_create') : t('form.button_save')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${locale}/dashboard/services`)}
          >
            {t('form.button_cancel')}
          </Button>
        </div>
      </form>
    </div>
  )
} 