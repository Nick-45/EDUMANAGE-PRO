module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          100: '#dbe7ff',
          200: '#bed3ff',
          300: '#91b6ff',
          400: '#5d8eff',
          500: '#3a6bff',
          600: '#244ddb',
          700: '#1b3aae',
          800: '#17308a',
          900: '#132a6e',
          950: '#0a1540',
        },
        navy: {
          50: '#eef3fb',
          100: '#d6e0f2',
          200: '#adc2e6',
          300: '#7f9cd4',
          400: '#5677bf',
          500: '#3a5aa3',
          600: '#2c4585',
          700: '#233a6b',
          800: '#1b2d54',
          900: '#122040',
          950: '#0a1428', // deep navy canvas
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
        sky: {
          50: '#eff9ff',
          100: '#def3ff',
          200: '#b6e9ff',
          300: '#78d9ff',
          400: '#38c6ff',
          500: '#0ea9f0',
          600: '#0287cd',
          700: '#046ba6',
          800: '#0a5a89',
          900: '#0e4b71',
          950: '#093048',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f7c948 0%, #d4af37 40%, #b8912a 70%, #8d6b1f 100%)',
        'gold-shine': 'linear-gradient(110deg, #b8912a 10%, #f7e08a 35%, #d4af37 55%, #f7e08a 75%, #b8912a 90%)',
        'navy-gradient': 'linear-gradient(135deg, #0a1428 0%, #122040 50%, #1b2d54 100%)',
        'sky-gradient': 'linear-gradient(135deg, #78d9ff 0%, #38c6ff 50%, #0ea9f0 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.35), 0 0 40px rgba(212, 175, 55, 0.15)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.45), 0 0 80px rgba(212, 175, 55, 0.2)',
        'sky-glow': '0 0 20px rgba(56, 198, 255, 0.35), 0 0 40px rgba(56, 198, 255, 0.15)',
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
