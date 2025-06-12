export function toFirestoreSafe(obj) {
  if (obj === null || typeof obj === 'undefined') return null;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') return obj;
  if (Array.isArray(obj)) return obj.map(toFirestoreSafe);
  if (obj instanceof Date) return obj; // Firestore can handle Date objects
  if (typeof obj === 'object') {
    const safe = {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      // Skip React internals and functions
      if (typeof obj[key] === 'function' || key.startsWith('$$') || key === 'render') continue;
      safe[key] = toFirestoreSafe(obj[key]);
    }
    return safe;
  }
  // Fallback: convert to string
  return String(obj);
} 