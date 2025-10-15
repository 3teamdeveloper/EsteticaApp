'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface ProfilePreviewProps {
  profileData: {
    urlName: string;
    bio: string | null;
    coverImage: string | null;
    profileImage: string | null;
    slogan?: string;
    fontFamily?: string;
    backgroundColor?: string;
    textColor?: string;
    primaryColor?: string;
    cardBackgroundColor?: string;
    publicLinks?: Array<{ name: string; url: string }>;
  } | null;
}

export function ProfilePreview({ profileData }: ProfilePreviewProps) {
  const t = useTranslations('profile');
  const themeStyles = {
    backgroundColor: profileData?.backgroundColor || '#ffffff',
    color: profileData?.textColor || '#111827',
    fontFamily: profileData?.fontFamily || 'inherit'
  };

  const primaryColor = profileData?.primaryColor || '#e11d48';
  const cardBgColor = profileData?.cardBackgroundColor || '#ffffff';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{t('preview')}</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {t('preview_subtitle')}
        </div>
      </div>
      
      {/* Preview container with theme colors */}
      <div 
        className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm"
        style={themeStyles}
      >
        {/* Cover image section */}
        <div className="relative h-32 overflow-hidden">
          {profileData?.coverImage ? (
            <Image
              src={profileData.coverImage}
              alt={t('preview_placeholders.cover_alt')}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 7v10h16V7H4zm8 2l4 4H8l4-4z"/>
              </svg>
            </div>
          )}
        </div>
        
        {/* Profile content */}
        <div className="p-4 space-y-3">
          {/* Profile image and basic info */}
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2" style={{ borderColor: primaryColor }}>
              {profileData?.profileImage ? (
                <Image
                  src={profileData.profileImage}
                  alt={t('preview_placeholders.profile_alt')}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg" style={{ color: themeStyles.color }}>
                {profileData?.urlName || t('preview_placeholders.your_name')}
              </h3>
              {profileData?.slogan && (
                <p className="text-sm opacity-80" style={{ color: themeStyles.color }}>
                  {profileData.slogan}
                </p>
              )}
            </div>
          </div>
          
          {/* Bio */}
          {profileData?.bio && (
            <div 
              className="p-3 rounded-lg text-sm"
              style={{ backgroundColor: cardBgColor, color: themeStyles.color }}
            >
              {profileData.bio}
            </div>
          )}
          
          {/* Public links preview */}
          {profileData?.publicLinks && profileData.publicLinks.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium opacity-70" style={{ color: themeStyles.color }}>Enlaces:</p>
              <div className="flex flex-wrap gap-2">
                {profileData.publicLinks.slice(0, 3).map((link, index) => (
                  <div
                    key={index}
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: primaryColor, 
                      color: '#ffffff'
                    }}
                  >
                    {link.name}
                  </div>
                ))}
                {profileData.publicLinks.length > 3 && (
                  <div className="px-2 py-1 rounded text-xs opacity-60" style={{ color: themeStyles.color }}>
                    +{profileData.publicLinks.length - 3} más
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}