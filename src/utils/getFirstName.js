export function getFirstName(user = {}) {
  try {
    const displayName = user.displayName || user.fullName || user.name || '';
    if (displayName) {
      const token = String(displayName).trim().split(/\s+/)[0];
      return token.charAt(0).toUpperCase() + token.slice(1);
    }
    const email = user.email || '';
    if (email && email.includes('@')) {
      const local = email.split('@')[0];
      if (local) {
        const token = local.replace(/[^a-zA-Z]/g, ' ').trim().split(/\s+/)[0] || 'Friend';
        return token.charAt(0).toUpperCase() + token.slice(1);
      }
    }
  } catch {
    // ignore
  }
  return 'Friend';
}

export default getFirstName;

