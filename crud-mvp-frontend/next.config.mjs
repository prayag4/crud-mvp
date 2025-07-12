/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL}/api/:path*`, // ← uses env var
      },
    ];
  },

  // expose to the browser if you need it there
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
};

export default nextConfig;
