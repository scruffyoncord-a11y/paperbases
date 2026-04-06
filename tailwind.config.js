/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // The user code has logic for isDarkMode which sets "dark" class on a wrapper
  theme: {
    extend: {},
  },
  plugins: [],
}
