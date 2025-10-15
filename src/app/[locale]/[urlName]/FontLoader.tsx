'use client';

import { useEffect } from 'react';

function buildGoogleFontHref(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;600;700&display=swap`;
}

export default function FontLoader({ fontFamily }: { fontFamily?: string | null }) {
  useEffect(() => {
    const family = (fontFamily || '').trim();
    if (!family) return;

    const href = buildGoogleFontHref(family);

    // Avoid duplicates
    const existing = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
      .some((l) => (l as HTMLLinkElement).href.includes('/css2?family=') && (l as HTMLLinkElement).href.includes(encodeURIComponent(family)));
    if (existing) return;

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
      // Keep font cached; do not aggressively remove once added
    };
  }, [fontFamily]);

  return null;
}


