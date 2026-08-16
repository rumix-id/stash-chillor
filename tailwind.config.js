/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cr-orange': '#f47521',
        'cr-dark': '#000000',
        'cr-card': '#141519',
        'cr-nav': '#23252b',
      }
    },
  },
  plugins: [],
}