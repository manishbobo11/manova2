export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? '' : 'https://manova2.onrender.com');

export async function apiFetch(path: string, options: RequestInit = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res;
}
