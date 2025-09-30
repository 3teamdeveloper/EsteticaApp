interface SessionData {
  userId: number;
  email: string;
  role: string;
  name?: string;
  username?: string;
  businessType?: string;
  expiresAt: number;
}

export const sessionManager = {
  // Guardar sesión
  saveSession: (data: SessionData) => {
    // Guardar en local storage para persistencia
    localStorage.setItem('userSession', JSON.stringify(data));
    
    // También en cookies para compatibilidad con SSR
    document.cookie = `userSession=${JSON.stringify(data)}; path=/; max-age=${7 * 24 * 60 * 60}`;
  },

  // Obtener sesión
  getSession: (): SessionData | null => {
    try {
      // Intentar local storage primero
      const localData = localStorage.getItem('userSession');
      if (localData) {
        const session = JSON.parse(localData);
        if (session.expiresAt > Date.now()) {
          return session;
        }
      }
      
      // Fallback a cookies
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(c => c.trim().startsWith('userSession='));
      if (sessionCookie) {
        const cookieValue = sessionCookie.split('=')[1];
        const session = JSON.parse(decodeURIComponent(cookieValue));
        if (session.expiresAt > Date.now()) {
          // Si encontramos una sesión válida en cookies, sincronizarla con localStorage
          localStorage.setItem('userSession', JSON.stringify(session));
          return session;
        }
      }
      
      return null;
    } catch {
      return null;
    }
  },

  // Limpiar sesión
  clearSession: () => {
    localStorage.removeItem('userSession');
    document.cookie = 'userSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  // Verificar si la sesión es válida
  isSessionValid: (): boolean => {
    const session = sessionManager.getSession();
    return session !== null && session.expiresAt > Date.now();
  }
};