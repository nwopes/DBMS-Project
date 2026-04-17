/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        navy: {
          900: '#0a0f1e',
          800: '#0d1425',
          700: '#111827',
          600: '#1a2235',
          500: '#1e2d40',
          400: '#243447',
        }
      }
    },
  },
  plugins: [],
}
