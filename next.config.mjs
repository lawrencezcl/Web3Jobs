/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Optimize for production builds
  compress: true,
  // Enable experimental features for better performance
  swcMinify: true,
};
export default nextConfig;
