import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#00b8e6',
          600: '#0099cc'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
