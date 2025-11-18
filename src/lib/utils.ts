import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizePlainText(input: unknown, options?: { maxLength?: number }): string {
  if (input === null || input === undefined) return "";
  let value = String(input);

  // Remove control characters and trim
  value = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

  // Remove angle brackets to avoid accidental HTML-like payloads
  value = value.replace(/[<>]/g, "");

  if (options?.maxLength && value.length > options.maxLength) {
    value = value.slice(0, options.maxLength);
  }

  return value;
}

export function sanitizeUrl(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Permitir solo esquemas seguros típicos para enlaces públicos
  if (!/^(https?:|mailto:|tel:)/i.test(raw)) {
    return null;
  }

  return raw;
}