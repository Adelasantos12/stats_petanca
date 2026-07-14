import axios from 'axios';

const api = axios.create({
  // In production we default to same-origin so Next.js can proxy /api requests
  // to the backend via `next.config.mjs` rewrites.
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

// Adjunta el token del coach (si existe) a cada petición.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ciep_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Si el backend responde 401 en una ruta protegida, limpiamos la sesión y
// mandamos al login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith('/login')
    ) {
      const url: string = error?.config?.url ?? '';
      // No redirigimos por endpoints de auth (login/register/status/google).
      if (!url.includes('/auth/') && !url.includes('/player-auth/')) {
        localStorage.removeItem('ciep_token');
        localStorage.removeItem('ciep_coach');
        localStorage.removeItem('ciep_player');
        const player = window.location.pathname.startsWith('/player');
        window.location.href = player ? '/player/login' : '/login';
      }
    }
    return Promise.reject(error);
  },
);

/** Extrae un mensaje legible del error de axios/NestJS sin usar `any`. */
export function apiErrorMessage(e: unknown): string | undefined {
  if (typeof e === 'object' && e !== null && 'response' in e) {
    const response = (
      e as { response?: { data?: { message?: string | string[] } } }
    ).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message;
  }
  return undefined;
}

export default api;
