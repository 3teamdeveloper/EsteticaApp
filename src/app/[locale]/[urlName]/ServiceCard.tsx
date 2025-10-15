'use client';
import { useState } from 'react';
import BookingModal from '@/components/BookingModal';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string | null;
  serviceImage?: string | null;
}

interface ThemeColors {
  primary: string;
  text: string;
  backgroundColor?: string; // Agregamos el color de fondo del tema
}

export default function ServiceCard({ 
  service, 
  themeColors 
}: { 
  service: Service;
  themeColors: ThemeColors;
}) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Función para truncar descripción a 30 palabras
  const truncateDescription = (text: string, wordLimit: number = 30) => {
    const words = text.split(' ');
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ');
  };

  const shouldShowToggle = service.description && service.description.split(' ').length > 30;

  // Detectar si es tema oscuro (Eclipse)
  const isDarkTheme = themeColors.backgroundColor === '#121212';
  
  // Estilos dinámicos para el tema
  const cardStyles = isDarkTheme 
    ? {
        backgroundColor: 'rgba(30, 30, 30, 0.9)', // Fondo oscuro semi-transparente
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)' // Borde sutil para tema oscuro
      }
    : {};
  
  const titleTextColor = isDarkTheme ? '#EAEAEA' : '#111827'; // Texto del título
  const descriptionTextColor = isDarkTheme ? '#B0B0B0' : '#6B7280'; // Texto de descripción
  const durationTextColor = isDarkTheme ? '#9CA3AF' : '#6B7280'; // Texto de duración

  return (
    <>
      <div 
        className={`group rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${
          isDarkTheme 
            ? 'backdrop-blur-sm' 
            : 'border-black/5 bg-white/60 backdrop-blur-sm'
        }`}
        style={cardStyles}
      >
        {service.serviceImage && (
          <div className="relative w-full h-64">
            <img src={service.serviceImage} alt={service.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />
          </div>
        )}
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <h3 
              className="text-base sm:text-lg font-semibold pr-3"
              style={{ color: titleTextColor }}
            >
              {service.name}
            </h3>
            <span 
              className="text-sm sm:text-base font-semibold" 
              style={{ color: themeColors.text }}
            >
              ${service.price}
            </span>
          </div>
          <div className="flex items-center text-xs" style={{ color: durationTextColor }}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {service.duration} minutos
          </div>
          {service.description && (
            <div className="text-sm mt-1" style={{ color: descriptionTextColor }}>
              <p className={`${!showFullDescription && shouldShowToggle ? 'line-clamp-2' : ''}`}>
                {showFullDescription || !shouldShowToggle 
                  ? service.description 
                  : truncateDescription(service.description)}
                {!showFullDescription && shouldShowToggle && '...'}
              </p>
              {shouldShowToggle && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs font-medium mt-1 transition-colors hover:opacity-80"
                  style={{ color: themeColors.text }}
                >
                  {showFullDescription ? 'Ver menos' : 'Ver más'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 mt-auto">
          <button
            onClick={() => setShowBookingModal(true)}
            className="w-full text-white py-2.5 px-4 rounded-lg font-medium text-sm shadow hover:opacity-90 active:opacity-80 transition-all"
            style={{ backgroundColor: themeColors.primary }}
          >
            Reservar turno
          </button>
        </div>
      </div>

      {/* Modal de Reserva */}
      <BookingModal
        service={service}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </>
  );
}