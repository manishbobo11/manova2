// In development, use relative paths to leverage Vite's proxy
// In production, use the configured base URL
export const API_BASE = 
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_BASE_URL ||
  (import.meta.env.MODE === 'development' ? '' : 'https://manova2.onrender.com');

// Debug logging in development
if (import.meta.env.MODE === 'development') {
  console.log('🔧 API Configuration:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: import.meta.env.NEXT_PUBLIC_API_BASE_URL,
    MODE: import.meta.env.MODE,
    API_BASE: API_BASE || '(using relative paths)'
  });
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  // Ensure path starts with / for consistency
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // In development (empty API_BASE), use relative path to leverage Vite proxy
  // In production, prepend the base URL
  const url = API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
  
  // Debug logging in development
  if (import.meta.env.MODE === 'development') {
    console.log(`🌐 API Call: ${url} (${options.method || 'GET'})`);
  }
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status} ${res.statusText}: ${msg}`);
  }
  return res;
}
