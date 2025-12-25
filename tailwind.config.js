/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a1a1a',
        'brand-accent': '#3498db',
        'brand-success': '#2ecc71',
        'brand-danger': '#e74c3c',
        'brand-warning': '#f1c40f',
      }
    },
  },
  plugins: [],
}
