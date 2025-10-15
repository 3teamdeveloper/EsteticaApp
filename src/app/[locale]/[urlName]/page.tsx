import { notFound } from 'next/navigation';
import Image from 'next/image';
import ServiceCard from './ServiceCard';
import FontLoader from './FontLoader';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  serviceImage?: string | null;
}

interface PublicProfile {
  urlName: string;
  pageTitle?: string | null;
  bio: string | null;
  coverImage: string | null;
  profileImage: string | null;
  publicLinks: Array<{ name: string; url: string }>;
  services: Service[];
  fontFamily?: string | null;
  backgroundColor?: string | null;
  cardBackgroundColor?: string | null;
  primaryColor?: string | null;
  textColor?: string | null;
  slogan?: string | null;
}

// Componente para enlaces de redes sociales
function SocialLink({ name, url }: { name: string; url: string }) {
  const getSocialIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('instagram')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44-.795 0-1.439.645-1.439 1.44.644 1.44 1.439 1.44.795 0 1.439-.645 1.439-1.44.644-1.44-1.439-1.44zm0 2.88c-.795 0-1.439.645-1.439 1.44s.644 1.44 1.439 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44-.795 0-1.439.645-1.439 1.44.644 1.44 1.439 1.44.795 0 1.439-.645 1.439-1.44.644-1.44-1.439-1.44zm0 2.88c-.795 0-1.439.645-1.439 1.44s.644 1.44 1.439 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44-.795 0-1.439.645-1.439 1.44.644 1.44 1.439 1.44.795 0 1.439-.645 1.439-1.44.644-1.44-1.439-1.44zm0 2.88c-.795 0-1.439.645-1.439 1.44s.644 1.44 1.439 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44-.795 0-1.439.645-1.439 1.44.644 1.44 1.439 1.44.795 0 1.439-.645 1.439-1.44.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      );
    } else if (lowerName.includes('facebook')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      );
    } else if (lowerName.includes('whatsapp')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-green-500 rounded-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44-.795 0-1.439.645-1.439 1.44.644 1.44 1.439 1.44.795 0 1.439-.645 1.439-1.44.644-1.44-1.439-1.44zm0 2.88c-.795 0-1.439.645-1.439 1.44s.644 1.44 1.439 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl shadow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95"
      style={{ minWidth: '140px', maxWidth: '220px' }}
    >
      {getSocialIcon(name)}
      <span className="text-base sm:text-lg font-medium text-gray-900">{name}</span>
    </a>
  );
}

// Componente para enlaces personalizados
function CustomLink({ name, url }: { name: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-xl shadow transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg active:scale-95"
    >
      <div className="flex items-center justify-between">
        <span className="text-base sm:text-lg font-medium text-gray-900">{name}</span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </a>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ urlName: string }>;
}) {
  const { urlName } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaup.com';

  const res = await fetch(`${baseUrl}/api/public-profile/${urlName}`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) return notFound();

  const profile: PublicProfile = await res.json();

  // Separar enlaces de redes sociales y enlaces personalizados
  const socialLinks = profile.publicLinks.filter(link =>
    link.name.toLowerCase().includes('instagram') ||
    link.name.toLowerCase().includes('facebook') ||
    link.name.toLowerCase().includes('whatsapp')
  );

  const customLinks = profile.publicLinks.filter(link =>
    !link.name.toLowerCase().includes('instagram') &&
    !link.name.toLowerCase().includes('facebook') &&
    !link.name.toLowerCase().includes('whatsapp')
  );

  const whatsappLink = socialLinks.find(l => l.name.toLowerCase().includes('whatsapp'))?.url || null;

  const styleVars = {
    fontFamily: profile.fontFamily || 'inherit',
    '--bb-bg': profile.backgroundColor || '#ffffff',
    '--bb-card-bg': profile.cardBackgroundColor || '#ffffff',
    '--bb-primary': profile.primaryColor || '#e11d48',
    '--bb-text': profile.textColor || '#111827',
  } as React.CSSProperties

  /*console.log('Profile colors:', {
    backgroundColor: profile.backgroundColor,
    cardBackgroundColor: profile.cardBackgroundColor,
    primaryColor: profile.primaryColor,
    textColor: profile.textColor
  });*/

  return (
    <div 
      className="min-h-screen" 
      style={{ 
        backgroundColor: 'var(--bb-bg)', 
        color: 'var(--bb-text)', 
        fontFamily: styleVars.fontFamily, 
        letterSpacing: '0.1em',
        ...(styleVars as any) 
      }}
    >
      <FontLoader fontFamily={profile.fontFamily || undefined} />
      {/* Hero Section - Elegante con overlay */}
      <div className="relative">
        <div className="w-full h-[70vh] relative overflow-hidden">
          <Image
            src={profile.coverImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200"}
            alt="Portada"
            fill
            className="object-cover scale-105 brightness-75"
            priority
          />
          {/* Overlay para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>

        <div className="absolute inset-0">
          <div className="h-full max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 relative rounded-full overflow-hidden ring-4 ring-white/90 shadow-2xl mb-4">
              <Image
                src={profile.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800"}
                alt="Perfil"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tight mb-3 text-white">
              {profile.pageTitle || profile.urlName}
            </h1>
            {profile.slogan && (
              <p className="text-base sm:text-lg md:text-xl mb-6 italic text-white/90 max-w-2xl">
                {profile.slogan}
              </p>
            )}
            {(profile as any).layoutVariant === 'signature' || !(profile as any).layoutVariant ? (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                <a
                  href="#services"
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: 'var(--bb-primary)', color: '#fff' }}
                >
                  Reservar turno
                </a>
                {whatsappLink && (
                  <a
                    href="#contact"
                    className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base font-semibold border-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-200 hover:scale-105"
                    style={{ borderColor: 'var(--bb-primary)', color: '#fff' }}
                  >
                    Contactanos
                  </a>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-10 sm:pt-12 md:pt-12 pb-12 sm:pb-16 md:pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
         
         
          {/* Servicios */}
          {profile.services && profile.services.length > 0 && (
            <section id="services" className="rounded-2xl p-6 sm:p-1 md:py-10  md:px-16 mb-10 mt-10" style={{ backgroundColor: 'var(--bb-card-bg)' }}>
              <div className="text-center mb-6 sm:mb-8">
                <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">Nuestros</p>
                <h2 className="text-4xl sm:text-5xl font-semibold" style={{ color: 'var(--bb-text)' }}>
                  Servicios
                </h2>
              </div>
              <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-2">
                {profile.services.map((service) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    themeColors={{
                      primary: profile.primaryColor || '#e11d48',
                      text: profile.textColor || '#111827',
                      backgroundColor: profile.backgroundColor || '#ffffff'
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Biografía */}
          {profile.bio && (
            <section className="rounded-2xl border border-black/5 shadow-sm mb-10" style={{ backgroundColor: 'transparent' }}>
             {/*  <div className="text-center mb-6">
                <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">Conócenos</p>
                <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--bb-text)' }}>Nuestra Historia</h3>
              </div> */}
              <div className="max-w-3xl mx-auto">
                <p className="text-lg sm:text-xl md:text-2xl leading-relaxed tracking-[2px] text-center italic" style={{ color: 'var(--bb-text)', opacity: 0.8 }}>
                  {profile.bio}
                </p>
              </div>
            </section>
          )}

          {profile.publicLinks?.length > 0 && (
            <div id="contact" className="space-y-10">
              {/* Redes Sociales */}
              {socialLinks.length > 0 && (
                <section className="rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8" style={{ backgroundColor: 'var(--bb-card-bg)' }}>
                  <div className="text-center mb-6">
                    <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">Síguenos</p>
                    <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--bb-text)' }}>Redes Sociales</h3>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                    {socialLinks.map((link, index) => (
                      <SocialLink key={index} name={link.name} url={link.url} />
                    ))}
                  </div>
                </section>
              )}

              {/* Enlaces Personalizados */}
              {customLinks.length > 0 && (
                <section className="rounded-2xl border border-black/5 shadow-sm p-6 sm:p-8" style={{ backgroundColor: 'var(--bb-card-bg)' }}>
                  <div className="text-center mb-6">
                    <p className="uppercase tracking-wider text-xs text-gray-500 mb-2">Descubrir</p>
                    <h3 className="text-lg sm:text-xl font-semibold" style={{ color: 'var(--bb-text)' }}>Enlaces</h3>
                  </div>
                  <div className="grid gap-3 sm:gap-4">
                    {customLinks.map((link, index) => (
                      <CustomLink key={index} name={link.name} url={link.url} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Action Bar (mobile)
      {((profile as any).layoutVariant === 'signature' || !(profile as any).layoutVariant) && (
        <div className="fixed bottom-4 inset-x-0 px-4 sm:hidden">
          <div className="mx-auto max-w-md rounded-xl shadow-lg border border-black/5 overflow-hidden flex">
            <a
              href="#services"
              className="flex-1 text-center py-3 font-medium"
              style={{ backgroundColor: 'var(--bb-primary)', color: '#fff' }}
            >
              Reservar
            </a>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-3 font-medium"
                style={{ color: 'var(--bb-primary)', backgroundColor: 'var(--bb-card-bg)' }}
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )} */}
    </div>
  );
}
