/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './public/**/*.{html,js}', './mobile/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        vivo: {
          background: '#111111',
          shield: '#111111',
          ink: '#18212F',
          surface: '#FFFFFF',
          mist: '#F4F7FB',
          line: '#DDE4EE',
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
        'vivo-pay-glow': 'radial-gradient(circle at center, rgba(255, 106, 0, 0.32) 0%, transparent 65%)',
        'vivo-surface-gradient': 'linear-gradient(145deg, #FFFFFF 0%, #F4F7FB 100%)',
        'vivo-night-gradient': 'linear-gradient(145deg, #18212F 0%, #111111 100%)'
      },
      boxShadow: {
        'vivo-card': '0 12px 30px rgba(24, 33, 47, 0.08)',
        'vivo-lift': '0 18px 38px rgba(24, 33, 47, 0.16)'
      },
      transitionTimingFunction: {
        'vivo-spring': 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      transitionDuration: {
        'vivo-fast': '180ms',
        vivo: '320ms'
      },
      letterSpacing: {
        tight: '-0.02em'
      }
    }
  },
  plugins: []
};
