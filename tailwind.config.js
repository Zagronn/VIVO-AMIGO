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
          accent: '#FF6A00'
        }
      }
    }
  },
  plugins: []
};
