/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // A rich, metallic gold
        gold: {
          100: '#F9F1D8',
          200: '#EEDC9A',
          300: '#E2C768',
          400: '#D4AF37', // The classic "Metallic Gold"
          500: '#C5A028',
          600: '#A08018',
          700: '#7B6110',
        },
        // A deep, luxury black (better than #000000)
        'rich-black': '#0a0a0a',
        'dark-gray': '#171717',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F9F1D8 50%, #D4AF37 100%)',
      }
    },
  },
  plugins: [],
}