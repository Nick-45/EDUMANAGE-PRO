module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbea',
          100: '#fff3c4',
          200: '#fce588',
          300: '#fadb5f',
          400: '#f7c948',
          500: '#f0b429', // golden
          600: '#de911d',
          700: '#cb6e17',
          800: '#b44d12',
          900: '#8d2b0b',
        },
        gold: {
          50: '#fdf9ef',
          100: '#faf0d0',
          200: '#f4dd9b',
          300: '#eec466',
          400: '#e8ab3e',
          500: '#d4af37', // classic metallic gold
          600: '#b8912a',
          700: '#96721f',
          800: '#75551a',
          900: '#5c411a',
        },
        black: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#9e9e9e',
          400: '#757575',
          500: '#4a4a4a',
          600: '#2e2e2e',
          700: '#1f1f1f',
          800: '#141414',
          900: '#0a0a0a',
          950: '#000000',
        },
        ink: {
          DEFAULT: '#0b0b0d',
          soft: '#141418',
          muted: '#1c1c22',
          border: '#2a2a33',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f7c948 0%, #d4af37 40%, #b8912a 70%, #8d6b1f 100%)',
        'gold-shine': 'linear-gradient(110deg, #b8912a 10%, #f7e08a 35%, #d4af37 55%, #f7e08a 75%, #b8912a 90%)',
        'black-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #141418 50%, #1c1c22 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35), 0 0 40px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.45), 0 0 80px rgba(212, 175, 55, 0.2)',
        'inner-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'glow': 'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
