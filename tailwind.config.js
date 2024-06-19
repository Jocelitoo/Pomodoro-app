/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        '3xl': '0 0 50px -20px rgb(0,0,0)',
      },
      colors: {
        'black-transparent': 'rgba(0, 0, 0, 0.90)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
