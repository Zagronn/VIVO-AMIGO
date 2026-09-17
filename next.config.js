/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This project was written without a working `npm install` in the build
    // environment, so ESLint couldn't be run against it before delivery.
    // Leave this off once you've run `npm run lint` locally and are clean.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
