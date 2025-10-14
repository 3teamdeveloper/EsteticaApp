import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import CookieBanner from "@/components/ui/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CitaUp - Sistema de Gestión de Turnos Online",
  description: "Gestiona tu negocio de belleza con facilidad. Agenda turnos, administra empleados y automatiza notificaciones. Aumenta ventas y optimiza tiempo. Prueba 14 días gratis.",
 keywords: [
  // High-intent (compra inmediata)
  "sistema de turnos online gratis",
  "agenda de turnos para peluquería",
  "software de reservas para estética",
  "booking online 24/7",
  
  // Core keywords (volumen alto)
  "gestión de turnos",
  "reservas online",
  "agenda digital",
  "sistema de citas online",
  
  // Nicho específico (conversión alta)
  "turnos online para barbería",
  "software para salón de belleza",
  "sistema de turnos para spa",
  "agenda online centro de estética",
  "reservas online masajes",
  
  // Long-tail (búsquedas reales)
  "como gestionar turnos de peluquería",
  "agenda digital con pagos online",
  "sistema de turnos con mercadopago",
  
  // Diferenciadores únicos
  "landing personalizable para turnos",
  "reservas automáticas para clientes",
  "notificaciones automáticas de turnos",
  
  // Features específicos
  "gestión de empleados peluquería",
  "calendario de citas compartido",
  "reportes de ventas para estética",
  
  // Local + social proof
  "booking belleza argentina",
  "sistema de turnos más usado",
],
  authors: [{ name: "3Team Developer" }],
  creator: "3Team Developer",
  publisher: "CitaUp",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "/",
    title: "CitaUp - Sistema de Gestión de Turnos Online",
    description: "Plataforma profesional para gestionar turnos y citas online. Agenda, organiza y administra reservas de manera eficiente para tu negocio.",
    siteName: "CitaUp",
  },
  twitter: {
    card: "summary_large_image",
    title: "CitaUp - Sistema de Gestión de Turnos Online",
    description: "Plataforma profesional para gestionar turnos y citas online. Agenda, organiza y administra reservas de manera eficiente.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
          <CookieBanner />
        </ToastProvider>
      </body>
    </html>
  );
}
