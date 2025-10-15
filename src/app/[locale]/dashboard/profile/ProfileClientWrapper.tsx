"use client";

import { useState } from 'react';
import { ProfileForm } from '@/components/dashboard/ProfileForm';
import { ProfilePreview } from '@/components/dashboard/ProfilePreview';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface ProfileData {
  urlName: string;
  bio: string | null;
  coverImage: string | File | null;
  profileImage: string | File | null;
  publicLinks: Array<{ name: string; url: string }>;
  isActive: boolean;
}

export default function ProfileClientWrapper({ initialProfileData }: { initialProfileData: ProfileData | null }) {
  const t = useTranslations('profile');
  const locale = useLocale();
  const [profileData, setProfileData] = useState<ProfileData | null>(initialProfileData);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(typeof profileData?.profileImage === 'string' ? profileData?.profileImage : null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(typeof profileData?.coverImage === 'string' ? profileData?.coverImage : null);

  const handleProfileChange = (newData: Partial<ProfileData>) => {
    setProfileData(prev => ({ ...prev!, ...newData }));
    if ('profileImage' in newData) {
      if (typeof newData.profileImage === 'string') setProfileImagePreview(newData.profileImage);
      else if (newData.profileImage instanceof File) {
        const reader = new FileReader();
        reader.onload = (ev) => setProfileImagePreview(ev.target?.result as string);
        reader.readAsDataURL(newData.profileImage);
      } else if (newData.profileImage === null) setProfileImagePreview(null);
    }
    if ('coverImage' in newData) {
      if (typeof newData.coverImage === 'string') setCoverImagePreview(newData.coverImage);
      else if (newData.coverImage instanceof File) {
        const reader = new FileReader();
        reader.onload = (ev) => setCoverImagePreview(ev.target?.result as string);
        reader.readAsDataURL(newData.coverImage);
      } else if (newData.coverImage === null) setCoverImagePreview(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        {profileData?.urlName && (
          <Link
            href={`/${locale}/${profileData.urlName}`}
            target="_blank"
            className="text-gray-500 hover:text-gray-700 border border-gray-300 min-w-[140px] rounded-md px-2 py-1 flex items-center gap-2"
          >
            <span>{t('view_website')}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
      </div>
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Vista previa en tiempo real */}
          <ProfilePreview profileData={{
            ...profileData!,
            profileImage: profileImagePreview,
            coverImage: coverImagePreview,
          }} />
          {/* Formulario de edición */}
          <ProfileForm
            initialData={profileData}
            onProfileChange={handleProfileChange}
            setProfileImagePreview={setProfileImagePreview}
            setCoverImagePreview={setCoverImagePreview}
            profileImagePreview={profileImagePreview}
            coverImagePreview={coverImagePreview}
          />
        </div>
      </div>
    </div>
  );
} 