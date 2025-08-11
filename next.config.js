/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ✅ Explicit map for failing route (adjust destination to match your backend route)
      { source: '/api/analyze-stress', destination: 'https://manova2.onrender.com/ai/analyze-stress' },

      // ✅ If you used /api/gpt earlier, keep this too:
      // { source: '/api/gpt', destination: 'https://manova2.onrender.com/ai/sarthi/chat' },

      // ✅ General proxy: forward /api/* to backend (keeps other calls working)
      { source: '/api/ai/:path*', destination: 'https://manova2.onrender.com/ai/:path*' },
      { source: '/api/:path*', destination: 'https://manova2.onrender.com/:path*' },
    ];
  },
};

module.exports = nextConfig;
