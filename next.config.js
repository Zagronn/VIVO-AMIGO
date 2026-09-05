/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vivoamigo.com', 'cdn.vivoamigo.com', 'cargoexpreso.com', 'guateex.com']
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://vivoamigo.com',
    NEXT_PUBLIC_DEFAULT_CURRENCY: 'GTQ',
    NEXT_PUBLIC_LAUNCH_CITY: 'Guatemala City'
  }
};

module.exports = nextConfig;
