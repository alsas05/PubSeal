/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mocha: {
          50: '#faf6f0',
          100: '#f4ebe1',
          200: '#e7d5c3',
          300: '#d4b89f',
          400: '#b58f70',
          500: '#976f50',
          600: '#7c573d',
          700: '#5a3e2a',
          800: '#38261b',
          900: '#231610',
          950: '#140c08',
        },
        gold: {
          50: '#fcfaf4',
          100: '#f8f2e2',
          200: '#f0e2be',
          300: '#e6cfa1',
          400: '#dbb97c',
          500: '#cb9f54', // Champagne Gold primary
          600: '#b4843e',
          700: '#91652f',
          800: '#724e29',
          900: '#5a3e23',
        },
        champagne: {
          DEFAULT: '#f3e8d2',
          light: '#fbf7ee',
          muted: '#dfceb0',
          border: 'rgba(219, 185, 124, 0.25)',
        }
      },
      fontFamily: {
        serif: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(203, 159, 84, 0.25)',
        'mocha-deep': '0 20px 40px -15px rgba(10, 6, 4, 0.7)',
        'inner-gold': 'inset 0 0 15px 0 rgba(203, 159, 84, 0.1)',
      },
      backgroundImage: {
        'radial-vignette': 'radial-gradient(circle at center, rgba(35, 22, 16, 0.7) 0%, rgba(20, 12, 8, 1) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f0e2be 0%, #dbb97c 50%, #b4843e 100%)',
      }
    },
  },
  plugins: [],
}

