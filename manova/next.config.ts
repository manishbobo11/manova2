import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Generic proxy: forward anything under /api/* to Render backend
      { source: '/api/(.*)', destination: 'https://manova2.onrender.com/$1' },

      // If your backend routes don't start with /api, but with /ai/..., keep this too:
      // Allows calling /api/ai/... from the frontend which will go to /ai/...
      { source: '/api/ai/(.*)', destination: 'https://manova2.onrender.com/ai/$1' },

      // If you used `/api/gpt` in frontend but backend route is `/ai/sarthi/chat`,
      // temporarily add this exact mapping (remove if not needed):
      // { source: '/api/gpt', destination: 'https://manova2.onrender.com/ai/sarthi/chat' },
    ];
  },
};

export default nextConfig;
