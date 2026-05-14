export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';

export const apiUrl = (path: string) =>
  `${BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`;