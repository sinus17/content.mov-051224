/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          light: '#e8e0d4',
          DEFAULT: '#dcc9a8',
          dark: '#b2a68c',
        },
        stone: {
          DEFAULT: '#50483b',
          dark: '#141215',
        },
        background: {
          DEFAULT: '#141215',
        },
        surface: {
          DEFAULT: '#50483b',
          secondary: '#3a342b',
        },
        primary: '#dcc9a8',
        border: '#50483b',
        text: {
          primary: '#e8e0d4',
          secondary: '#b2a68c',
        }
      },
      fontFamily: {
        sans: ['Helvetica', 'Helvetica Neue', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
};