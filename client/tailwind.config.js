/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#FFFFFF',
        surface: '#F4F4F2',
        card: '#FFFFFF',
        ink: '#0B0D10',
        panel: '#14171C',
        panel2: '#1C2027',
        accent: '#E5483A',
        accentHover: '#B3271E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

