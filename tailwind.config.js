/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './web/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#F9F7F4',
        parchment: '#F0EBE3',
        gold: {
          DEFAULT: '#9C7D5A',
          light: '#C4A882',
          dark: '#7A5F40',
        },
        stone: {
          850: '#1C1917',
        },
      },
    },
  },
  plugins: [],
};
