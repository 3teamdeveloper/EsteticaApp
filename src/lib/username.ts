import type { PrismaClient } from '@prisma/client';

export function slugifyUsername(base: string, maxLen = 20): string {
  if (!base) return 'user';
  const normalized = base
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '') // remueve acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const trimmed = normalized.slice(0, maxLen) || 'user';
  return trimmed;
}

export async function generateUniqueUsername(prisma: PrismaClient, base: string, maxAttempts = 100): Promise<string> {
  const sanitized = slugifyUsername(base);
  let attempt = sanitized;
  let counter = 0;

  while (counter < maxAttempts) {
    const existing = await prisma.user.findUnique({ where: { username: attempt } });
    if (!existing) return attempt;
    counter += 1;
    attempt = `${sanitized}-${counter}`;
  }

  // Fallback para evitar loop infinito
  return `${sanitized}-${Date.now()}`;
}


