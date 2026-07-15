/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'fade-up': {
          from: { opacity: '0', filter: 'blur(8px)', transform: 'translateY(20px)' },
          to:   { opacity: '1', filter: 'blur(0)',   transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .6s ease',
        'fade-in': 'fade-in .35s ease',
      },
    },
  },
  plugins: [],
}
