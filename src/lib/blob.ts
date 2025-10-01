// src/lib/blob.ts
import { put, del } from '@vercel/blob';

/**
 * Sube un archivo a Vercel Blob Storage
 * @param file - Archivo a subir
 * @param folder - Carpeta donde guardar (ej: 'services', 'employees', 'profiles')
 * @returns Objeto con url y otras propiedades del blob
 */
export async function uploadToBlob(file: File, folder: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no está configurado');
  }

  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/\s/g, '_');
  const filename = `${folder}/${timestamp}_${sanitizedName}`;

  // Subir a Vercel Blob
  const blob = await put(filename, file, {
    access: 'public',
    token,
  });

  return blob;
}

/**
 * Elimina un archivo de Vercel Blob Storage
 * @param url - URL completa del blob a eliminar
 */
export async function deleteFromBlob(url: string) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN no está configurado');
  }

  // Solo intentar eliminar si es una URL de Vercel Blob
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return;
  }

  try {
    await del(url, { token });
  } catch (error) {
    console.error('Error al eliminar blob:', error);
    // No lanzar error para no bloquear la operación principal
  }
}