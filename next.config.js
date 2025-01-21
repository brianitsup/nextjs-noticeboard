/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Handle source maps in development
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },
  // Ensure static assets are properly handled
  transpilePackages: ['lucide-react'],
};

module.exports = nextConfig; 