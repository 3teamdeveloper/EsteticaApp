import Image from 'next/image';

interface AvatarProps {
  src?: string | null;
  alt: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  const baseClasses = 'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br from-rose-500 to-rose-600';

  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
} 