"use client"

import Link from "next/link"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <main className="min-h-screen ">

      <Navbar />
      
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-600">
                    Gestiona tu negocio de belleza con facilidad
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl">
                    Sistema de reservas y gestión de clientes para peluquerías, barberías y centros de estética.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link 
                    href="/register"
                    className="px-8 py-3 text-sm md:text-base font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors"
                  >
                    Comenzar ahora
                  </Link>
                  <button className="px-8 py-3 text-sm md:text-base font-medium text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Ver demostración
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-rose-600" />
                  <span>Prueba gratuita de 14 días</span>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative h-[360px] overflow-hidden rounded-xl border border-gray-200 shadow-lg">
                <Image
                  src="/images/dashboard-preview.png"
                  alt="Dashboard de BeautyBook"
                  width={1280}
                  height={720}
                  className="object-cover h-full w-full"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        
      <footer className="border-t bg-gray-50 py-6 ">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} BeautyBook. Todos los derechos reservados.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Diseñado y desarrollado con ❤️ para profesionales de la belleza
            </p>
          </div>
        </div>
      </footer>
      
      </main>
  )
}
