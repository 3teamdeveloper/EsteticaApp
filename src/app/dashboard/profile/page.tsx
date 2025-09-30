import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { profileMetadata } from '@/app/dashboard/profile/metadata';
import dynamic from 'next/dynamic';

export const metadata = profileMetadata;

const ProfileClientWrapper = dynamic(() => import('./ProfileClientWrapper'), { ssr: true });

interface ProfileData {
  urlName: string;
  bio: string | null;
  coverImage: string | File | null;
  profileImage: string | File | null;
  publicLinks: Array<{ name: string; url: string }>;
  isActive: boolean;
}

async function getProfileData(): Promise<ProfileData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token) as { id: number; email: string };
    const profile = await prisma.publicProfile.findUnique({
      where: { userId: decoded.id },
    });
    if (!profile) return null;
    const publicLinks = typeof profile.publicLinks === 'string'
      ? JSON.parse(profile.publicLinks)
      : profile.publicLinks || [];
    return {
      ...profile,
      publicLinks
    };
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
    return null;
  }
}

export default async function Profile() {
  const profileData = await getProfileData();
  return <ProfileClientWrapper initialProfileData={profileData} />;
} 