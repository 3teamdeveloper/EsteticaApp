import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import CookieBanner from "@/components/ui/CookieBanner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    es: "CitaUp - Sistema de Gestión de Turnos Online",
    en: "CitaUp - Online Appointment Management System"
  };
  
  const descriptions = {
    es: "Gestiona tu negocio de belleza con facilidad. Agenda turnos, administra empleados y automatiza notificaciones. Aumenta ventas y optimiza tiempo. Prueba 14 días gratis.",
    en: "Manage your beauty business with ease. Schedule appointments, manage employees, and automate notifications. Increase sales and optimize time. 14-day free trial."
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    openGraph: {
      type: "website",
      locale: locale === 'es' ? "es_ES" : "en_US",
      url: "/",
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      siteName: "CitaUp",
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            {children}
            <CookieBanner />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
