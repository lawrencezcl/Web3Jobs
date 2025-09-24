/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: ['*'] },
  },
  // Optimize for production builds
  compress: true,
  // Enable experimental features for better performance
  swcMinify: true,
};
export default nextConfig;
