import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        vivo: {
          orange: '#FF6A1A',
          'orange-dark': '#E4590F',
          black: '#161616',
          cream: '#FFF8F2',
        },
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(22, 22, 22, 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
