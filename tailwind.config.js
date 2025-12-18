/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E50914',      // Netflix Red
        secondary: '#B20710',    // Darker Red
        accent: '#FFC107',       // Gold/Amber
        dark: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1F1F1F',
          600: '#2A2A2A',
        }
      },
      backgroundImage: {
        'cinema-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1F1F1F 50%, #141414 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(31, 31, 31, 0.8) 0%, rgba(20, 20, 20, 0.9) 100%)',
      }
    },
  },
  plugins: [],
}