/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './public/**/*.{html,js}', './mobile/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vivo: {
          background: '#111111',
          shield: '#111111',
          orange: '#FF6A00',
          orangeDark: '#EB5C00',
          yellow: '#FBF7AA',
          gray: '#F8F9FA',
          ship: '#2563EB',
          ads: '#7C3AED',
          support: '#16A34A'
        }
      },
      backgroundImage: {
        'vivo-gradient': 'linear-gradient(135deg, #FF6A00 0%, #EB5C00 100%)',
        'vivo-pay-glow': 'radial-gradient(circle at center, rgba(255, 106, 0, 0.32) 0%, transparent 65%)'
      }
    }
  },
  plugins: []
};
