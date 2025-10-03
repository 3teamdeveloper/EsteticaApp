'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';
import { useToastContext } from '@/components/ui/toast/ToastProvider';
import { useTrial } from '@/hooks/useTrial';

interface ProfileFormProps {
  initialData: {
    urlName: string;
    pageTitle?: string | null;
    bio: string | null;
    coverImage: string | File | null;
    profileImage: string | File | null;
    publicLinks: Array<{ name: string; url: string }>;
    isActive: boolean;
    fontFamily?: string | null;
    backgroundColor?: string | null;
    cardBackgroundColor?: string | null;
    primaryColor?: string | null;
    textColor?: string | null;
    slogan?: string | null;
    layoutVariant?: string | null;
  } | null;
  onProfileChange?: (newData: Partial<{
    urlName: string;
    pageTitle?: string | null;
    bio: string | null;
    coverImage: string | File | null;
    profileImage: string | File | null;
    publicLinks: Array<{ name: string; url: string }>;
    isActive: boolean;
    fontFamily?: string | null;
    backgroundColor?: string | null;
    cardBackgroundColor?: string | null;
    primaryColor?: string | null;
    textColor?: string | null;
    slogan?: string | null;
    layoutVariant?: string | null;
  }>) => void;
  setProfileImagePreview?: (url: string | null) => void;
  setCoverImagePreview?: (url: string | null) => void;
  profileImagePreview?: string | null;
  coverImagePreview?: string | null;
}

export function ProfileForm(props: ProfileFormProps) {
  const { initialData, onProfileChange, setProfileImagePreview, setCoverImagePreview, profileImagePreview, coverImagePreview } = props;
  const { trialStatus } = useTrial();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    urlName: initialData?.urlName || '',
    pageTitle: initialData?.pageTitle || '',
    bio: initialData?.bio || '',
    coverImage: initialData?.coverImage || null as string | File | null,
    profileImage: initialData?.profileImage || null as string | File | null,
    publicLinks: initialData?.publicLinks || [],
    isActive: initialData?.isActive ?? true,
    fontFamily: initialData?.fontFamily || '',
    backgroundColor: initialData?.backgroundColor || '',
    cardBackgroundColor: initialData?.cardBackgroundColor || '',
    primaryColor: initialData?.primaryColor || '',
    textColor: initialData?.textColor || '',
    slogan: initialData?.slogan || '',
    layoutVariant: initialData?.layoutVariant || 'signature',
    socialLinks: {
      instagram: (() => {
        const instagramLink = (initialData?.publicLinks || []).find(link => link.name.toLowerCase().includes('instagram'))?.url || '';
        return instagramLink.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      })(),
      facebook: (() => {
        const facebookLink = (initialData?.publicLinks || []).find(link => link.name.toLowerCase().includes('facebook'))?.url || '';
        return facebookLink.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
      })(),
      whatsapp: (() => {
        const whatsappLink = (initialData?.publicLinks || []).find(link => link.name.toLowerCase().includes('whatsapp'))?.url || '';
        return whatsappLink.replace(/^https?:\/\/wa\.me\//, '');
      })(),
    }
  });
  const profileImageFileRef = useRef<HTMLInputElement>(null);
  const coverImageFileRef = useRef<HTMLInputElement>(null);
  const [removeProfileImage, setRemoveProfileImage] = useState(false);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);

  // Google Fonts selector (curated)
  const googleFonts = [
    'Poppins',
    'Inter',
    'Montserrat',
    'Lato',
    'Roboto',
    'Nunito',
    'Playfair Display',
    'Merriweather',
    'Source Sans 3',
    'Quicksand',
    'Raleway',
  ];

  const [selectedGoogleFont, setSelectedGoogleFont] = useState<string>(
    googleFonts.includes((initialData?.fontFamily || '').trim()) ? (initialData?.fontFamily as string) : ''
  );

  const buildGoogleFontHref = (family: string) =>
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700&display=swap`;

  // Link management functions

  // Inject link tag for preview
  useEffect(() => {
    const family = selectedGoogleFont || formData.fontFamily;
    if (!family) return;
    const href = buildGoogleFontHref(family);
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = '';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(link);
    return () => {
      document.head.contains(link) && document.head.removeChild(link);
      document.head.contains(preconnect1) && document.head.removeChild(preconnect1);
      document.head.contains(preconnect2) && document.head.removeChild(preconnect2);
    };
  }, [selectedGoogleFont]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Validación especial para urlName
    if (name === 'urlName') {
      // Solo permitir letras minúsculas, números y guiones
      const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
      onProfileChange && onProfileChange({ [name]: sanitizedValue });
      return;
    }

    if (name.startsWith('social.')) {
      const socialPlatform = name.split('.')[1];

      // Manejar el valor según la plataforma social
      let processedValue = value;

      // Remover prefijos existentes si el usuario los pega accidentalmente
      if (socialPlatform === 'instagram') {
        processedValue = value.replace(/^https?:\/\/(www\.)?instagram\.com\//, '');
      } else if (socialPlatform === 'facebook') {
        processedValue = value.replace(/^https?:\/\/(www\.)?facebook\.com\//, '');
      } else if (socialPlatform === 'whatsapp') {
        processedValue = value.replace(/^https?:\/\/wa\.me\//, '');
      }

      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: processedValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      onProfileChange && onProfileChange({ [name]: value });
    }
  };

  const handleLinkChange = (index: number, field: 'name' | 'url', value: string) => {
    const newLinks = [...formData.publicLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setFormData({ ...formData, publicLinks: newLinks });
  };

  const addLink = () => {
    setFormData({
      ...formData,
      publicLinks: [...formData.publicLinks, { name: '', url: '' }],
    });
  };

  const removeLink = (index: number) => {
    const newLinks = formData.publicLinks.filter((_, i) => i !== index);
    setFormData({ ...formData, publicLinks: newLinks });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileImagePreview && setProfileImagePreview(ev.target?.result as string);
        onProfileChange && onProfileChange({ profileImage: file });
      };
      reader.readAsDataURL(file);
      setRemoveProfileImage(false);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCoverImagePreview && setCoverImagePreview(ev.target?.result as string);
        onProfileChange && onProfileChange({ coverImage: file });
      };
      reader.readAsDataURL(file);
      setRemoveCoverImage(false);
    }
  };

  const handleRemoveProfileImage = () => {
    setFormData(prev => ({ ...prev, profileImage: null }));
    setRemoveProfileImage(true);
    onProfileChange && onProfileChange({ profileImage: null });
  };

  const handleRemoveCoverImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
    setRemoveCoverImage(true);
    onProfileChange && onProfileChange({ coverImage: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Preparar los enlaces combinando redes sociales y enlaces personalizados
    const socialLinks = [
      { name: 'Instagram', url: `https://www.instagram.com/${formData.socialLinks.instagram}` },
      { name: 'Facebook', url: `https://www.facebook.com/${formData.socialLinks.facebook}` },
      { name: 'WhatsApp', url: `https://wa.me/${formData.socialLinks.whatsapp}` },
    ].filter(link => link.url.trim() !== '');

    // Filtrar los enlaces personalizados para excluir las redes sociales
    const customLinks = formData.publicLinks.filter(link =>
      !link.name.toLowerCase().includes('instagram') &&
      !link.name.toLowerCase().includes('facebook') &&
      !link.name.toLowerCase().includes('whatsapp') &&
      link.url.trim() !== '' // Solo incluir enlaces con URL no vacía
    );

    // Combinar todos los enlaces
    const allLinks = [...socialLinks, ...customLinks];

    // Usar FormData para enviar archivos
    const form = new FormData();
    form.append('urlName', formData.urlName);
    if (formData.pageTitle) form.append('pageTitle', formData.pageTitle);
    form.append('bio', formData.bio);
    form.append('isActive', String(formData.isActive));
    form.append('publicLinks', JSON.stringify(allLinks));
    if (formData.fontFamily) form.append('fontFamily', formData.fontFamily);
    if (formData.backgroundColor) form.append('backgroundColor', formData.backgroundColor);
    if (formData.cardBackgroundColor) form.append('cardBackgroundColor', formData.cardBackgroundColor);
    if (formData.primaryColor) form.append('primaryColor', formData.primaryColor);
    if (formData.textColor) form.append('textColor', formData.textColor);
    if (formData.slogan) form.append('slogan', formData.slogan);
    if (formData.layoutVariant) form.append('layoutVariant', formData.layoutVariant);
    if (formData.profileImage) form.append('profileImage', formData.profileImage);
    if (formData.coverImage) form.append('coverImage', formData.coverImage);
    if (removeProfileImage) form.append('removeProfileImage', 'true');
    if (removeCoverImage) form.append('removeCoverImage', 'true');

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al guardar el perfil');
      }
      toast.push('success', 'Perfil guardado exitosamente');

      // Forzar la revalidación de la página pública
      await fetch(`/api/revalidate?path=/${formData.urlName}`);

      // Actualizar la página actual (permanecer en dashboard/profile)
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el perfil';
      setError(msg);
      toast.push('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Básico' },
    { id: 'images', label: 'Imágenes' },
    { id: 'theme', label: 'Personalización' },
    { id: 'links', label: 'Enlaces' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {trialStatus && !trialStatus?.isActive && (
        <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm">
          Tu trial ha expirado. Actualiza tu plan para editar el perfil público.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          {/* URL Name */}
          <div>
            <label htmlFor="urlName" className="block text-sm font-medium text-gray-700">
              URL del Perfil
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                citaup.vercel.app/
              </span>
              <input
                type="text"
                name="urlName"
                id="urlName"
                value={formData.urlName}
                onChange={handleChange}
                className="flex-1 min-w-0 block w-full text-gray-600 px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                placeholder="mi-salon"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Esta será la URL pública de tu perfil. Usa solo letras minúsculas, números y guiones.
            </p>
          </div>

          {/* Page Title */}
          <div>
            <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700">
              Título de la Página
            </label>
            <input
              type="text"
              name="pageTitle"
              id="pageTitle"
              value={formData.pageTitle}
              onChange={handleChange}
              className="mt-1 block w-full text-gray-600 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              placeholder="Mi Salón de Belleza"
            />
            <p className="mt-2 text-sm text-gray-500">
              Este será el título que aparece en tu página. Puedes usar espacios y caracteres especiales.
            </p>
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Slogan</label>
            <input
              type="text"
              name="slogan"
              value={formData.slogan}
              onChange={handleChange}
              placeholder="Belleza que inspira confianza"
              className="mt-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            />
          </div>
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 block text-gray-600 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              placeholder="Cuéntale a tus clientes sobre tu negocio..."
            />
          </div>

        </div>
      )}

      {activeTab === 'images' && (
        <div className="space-y-6">
          {/* Imágenes */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen de Perfil</label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="relative group focus:outline-none"
                  onClick={() => profileImageFileRef.current?.click()}
                  tabIndex={0}
                >
                  {profileImagePreview ? (
                    <img
                      src={profileImagePreview}
                      alt="Perfil"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300 shadow relative">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={profileImageFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                </button>
                {profileImagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveProfileImage}
                    className="ml-2 flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-300 text-gray-500 text-xs font-medium shadow-sm hover:bg-red-100 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Quitar imagen"
                  >
                    <Camera className="w-4 h-4 mr-1" /> Quitar
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen de Portada</label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  className="relative group focus:outline-none"
                  onClick={() => coverImageFileRef.current?.click()}
                  tabIndex={0}
                >
                  {coverImagePreview ? (
                    <img
                      src={coverImagePreview}
                      alt="Portada"
                      className="w-32 h-20 rounded-lg object-cover border-2 border-gray-300 shadow group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300 shadow relative">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={coverImageFileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </button>
                {coverImagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="ml-2 flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-300 text-gray-500 text-xs font-medium shadow-sm hover:bg-red-100 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-200"
                    title="Quitar imagen"
                  >
                    <Camera className="w-4 h-4 mr-1" /> Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="space-y-6">
          {/* Google Fonts selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Fonts</label>
            <select
              value={selectedGoogleFont}
              onChange={(e) => {
                const f = e.target.value;
                setSelectedGoogleFont(f);
                setFormData(prev => ({ ...prev, fontFamily: f ? f : prev.fontFamily }));
                onProfileChange && onProfileChange({ fontFamily: f });
              }}
              className="mt-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
            >
              <option value="">Sin seleccionar</option>
              {googleFonts.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {selectedGoogleFont && (
              <div className="mt-2 text-sm text-gray-700" style={{ fontFamily: selectedGoogleFont }}>
                Vista previa con {selectedGoogleFont}
              </div>
            )}
          </div>

          {/* Temas Predefinidos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tema de Colores</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* Tema Aurora (Light clásico) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#FFFFFF',
                    textColor: '#333333',
                    primaryColor: '#007BFF',
                    cardBackgroundColor: '#FAFAFA'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#FFFFFF' && formData.primaryColor === '#007BFF'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-100"></div>
                  <div className="w-4 h-4 rounded-full bg-white border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">✨ Aurora</p>
                <p className="text-xs text-gray-500">Light clásico</p>
              </div>

              {/* Tema Eclipse (Dark elegante) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#121212',
                    textColor: '#EAEAEA',
                    primaryColor: '#9400D4',
                    cardBackgroundColor: '#1E1E1E'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#121212' && formData.primaryColor === '#9400D4'
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-violet-600"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-800"></div>
                  <div className="w-4 h-4 rounded-full bg-gray-700 border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">🌑 Eclipse</p>
                <p className="text-xs text-gray-500">Dark elegante</p>
              </div>

              {/* Tema Esmeralda (Verde fresco) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#F0FDF4',
                    textColor: '#064E3B',
                    primaryColor: '#10B981',
                    cardBackgroundColor: '#FFFFFF'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#F0FDF4' && formData.primaryColor === '#10B981'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  <div className="w-4 h-4 rounded-full bg-emerald-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">🌿 Esmeralda</p>
                <p className="text-xs text-gray-500">Verde fresco</p>
              </div>

              {/* Tema Sakura (Pastel cálido) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#FFF7F9',
                    textColor: '#3D3D3D',
                    primaryColor: '#FF6B9C',
                    cardBackgroundColor: '#FFFFFF'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#FFF7F9' && formData.primaryColor === '#FF6B9C'
                  ? 'border-pink-400 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-pink-400"></div>
                  <div className="w-4 h-4 rounded-full bg-pink-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">🌸 Sakura</p>
                <p className="text-xs text-gray-500">Pastel cálido</p>
              </div>

              {/* Tema Terracota (Marrón terroso) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#FDF7F2',
                    textColor: '#4E342E',
                    primaryColor: '#A1887F',
                    cardBackgroundColor: '#FFFFFF'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#FDF7F2' && formData.primaryColor === '#A1887F'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                  <div className="w-4 h-4 rounded-full bg-orange-100"></div>
                  <div className="w-4 h-4 rounded-full bg-white border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">🏺 Terracota</p>
                <p className="text-xs text-gray-500">Marrón terroso</p>
              </div>

              {/* Tema Rubí (Rojo enérgico) */}
              <div
                onClick={() => {
                  const theme = {
                    backgroundColor: '#FFF5F5',
                    textColor: '#7B1C1C',
                    primaryColor: '#E53935',
                    cardBackgroundColor: '#FFFFFF'
                  };
                  setFormData(prev => ({ ...prev, ...theme }));
                  onProfileChange && onProfileChange(theme);
                }}
                className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${formData.backgroundColor === '#FFF5F5' && formData.primaryColor === '#E53935'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <div className="w-4 h-4 rounded-full bg-red-50"></div>
                  <div className="w-4 h-4 rounded-full bg-white border"></div>
                </div>
                <p className="text-xs font-medium text-gray-700">💎 Rubí</p>
                <p className="text-xs text-gray-500">Rojo enérgico</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Redes Sociales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Redes Sociales
            </label>
            <div className="space-y-4">
              {/* Instagram */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.059-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="social.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="flex-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="Nombre de usuario de Instagram"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, instagram: '' }
                  }))}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Eliminar
                </button>
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="social.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleChange}
                  className="flex-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="Nombre de usuario de Facebook"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, facebook: '' }
                  }))}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Eliminar
                </button>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="social.whatsapp"
                  value={formData.socialLinks.whatsapp}
                  onChange={handleChange}
                  className="flex-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="Número de WhatsApp"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    socialLinks: { ...prev.socialLinks, whatsapp: '' }
                  }))}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>

          {/* Otros Enlaces */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Otros Enlaces
            </label>
            <div className="space-y-4">
              {formData.publicLinks
                .filter(link =>
                  !link.name.toLowerCase().includes('instagram') &&
                  !link.name.toLowerCase().includes('facebook') &&
                  !link.name.toLowerCase().includes('whatsapp')
                )
                .map((link, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => handleLinkChange(index, 'name', e.target.value)}
                      className="flex-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      placeholder="Nombre del enlace"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="flex-1 block w-full border text-gray-600 border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                      placeholder="URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}

              <button
                type="button"
                onClick={addLink}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Agregar Enlace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button - Always visible */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || (trialStatus?.isActive === false)}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : 'Guardar Perfil'}
        </button>
      </div>
    </form>
  );
}