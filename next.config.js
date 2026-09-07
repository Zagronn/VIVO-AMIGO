/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['vivoamigo.com', 'payvivoamigo.com', 'cargovivo.com', 'cdn.vivoamigo.com', 'cargoexpreso.com', 'guateex.com']
  },
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://vivoamigo.com',
    NEXT_PUBLIC_DEFAULT_CURRENCY: 'GTQ',
    NEXT_PUBLIC_LAUNCH_CITY: 'Guatemala City'
  },
  async rewrites() {
    return [
      { source: '/marketplace/:path*', destination: 'https://vivoamigo.com/:path*' },
      { source: '/wallet/:path*', destination: 'https://payvivoamigo.com/:path*' },
      { source: '/logistics/:path*', destination: 'https://cargovivo.com/:path*' }
    ];
  }
};

module.exports = nextConfig;
