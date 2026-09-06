/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}', './mobile/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vivo: {
          background: '#111111',
          shield: '#111111',
          silver: '#7A808A',
          accent: '#FF6A00',
          dark: '#0B021C',
          surface: '#150A33',
          primary: '#5B21B6',
          violet: '#7C3AED',
          neon: '#A855F7',
          blue: '#3B82F6',
          light: '#F5F3FF'
        }
      },
      backgroundImage: {
        'vivo-gradient': 'linear-gradient(135deg, #0B021C 0%, #1E0A45 45%, #4C1D95 100%)',
        'vivo-card-gradient': 'linear-gradient(180deg, rgba(124, 58, 237, 0.15) 0%, rgba(15, 5, 35, 0.8) 100%)',
        'vivo-neon-glow': 'radial-gradient(circle at center, rgba(168, 85, 247, 0.3) 0%, transparent 70%)'
      }
    }
  },
  plugins: []
};
