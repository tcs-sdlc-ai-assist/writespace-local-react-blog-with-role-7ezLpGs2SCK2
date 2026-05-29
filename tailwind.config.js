/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        violet: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        writespace: {
          primary: '#7c3aed',
          secondary: '#4f46e5',
          accent: '#8b5cf6',
          light: '#ede9fe',
          dark: '#2e1065',
          'gradient-from': '#7c3aed',
          'gradient-via': '#6366f1',
          'gradient-to': '#4338ca',
        },
      },
      backgroundImage: {
        'writespace-gradient': 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4338ca 100%)',
        'writespace-gradient-hover': 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #3730a3 100%)',
      },
    },
  },
  plugins: [],
};