/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0d6efd',
        'brand-dark': '#0a58ca',
        'brand-light': '#e7f0ff',
        teal: '#0dcaf0',
        success: '#198754',
      },
    },
  },
  plugins: [],
};
