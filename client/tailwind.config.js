/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0B3D2E',
          50: '#F2F9F6',
          100: '#E1F3EC',
          200: '#C2E5D7',
          300: '#95CFB9',
          400: '#5FB296',
          500: '#389476',
          600: '#26775E',
          700: '#1F5F4C',
          800: '#194C3E',
          900: '#0B3D2E',
          950: '#052219',
        },
        emerald: {
          DEFAULT: '#16A34A',
          soft: '#D1FAE5',
        },
        teal: {
          DEFAULT: '#0F766E',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9',
        },
        slate: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        warning: '#F59E0B',
        critical: '#DC2626',
        mint: '#D1FAE5',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(11, 61, 46, 0.08), 0 8px 10px -6px rgba(11, 61, 46, 0.04)',
        'panel': '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
