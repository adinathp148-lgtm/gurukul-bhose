/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./apps/**/*.{html,js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gurukul: {
          saffron: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316', // Primary Kesari / Saffron (accents/borders)
            600: '#c2410c', // WCAG AA accessible Saffron (5.18:1 on white, 4.94:1 on slate-50)
            700: '#9a3412',
            800: '#7c2d12',
            900: '#63220d',
          },
          navy: {
            50: '#f0f4f8',
            100: '#d9e2ec',
            200: '#bcccdc',
            300: '#9fb3c8',
            400: '#829ab1',
            500: '#627d98',
            600: '#486581',
            700: '#334e68',
            800: '#243b53',
            900: '#102a43', // Deep military navy
            950: '#0b1d30',
          },
          maroon: {
            500: '#9b1c1c',
            600: '#771d1d',
            700: '#5c1616',
          },
          gold: {
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Mukta', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        marathi: ['Mukta', 'Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 30px -10px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
