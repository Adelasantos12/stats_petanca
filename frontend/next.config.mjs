/** @type {import('next').NextConfig} */

const backendOrigin =
  process.env.API_SERVER_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  '';

const nextConfig = {
  async rewrites() {
    if (!backendOrigin) {
      // Avoid proxying to localhost in production containers
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
