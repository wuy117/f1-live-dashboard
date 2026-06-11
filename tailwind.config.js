/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#e10600',
          ember: '#ff3b30',
          black: '#07070b',
          panel: '#111119',
          line: '#262635',
          muted: '#9ca3af',
        },
      },
      boxShadow: {
        glow: '0 0 34px rgba(225, 6, 0, 0.22)',
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
