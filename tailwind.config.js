/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Absolute black for Vercel look
        'gh-bg-absolute': '#0d1117',
        'gh-bg': '#010409',           // GitHub ultra dark background
        'gh-bg-overlay': '#0d1117',   // GitHub dark background
        'gh-bg-secondary': '#161b22', // GitHub secondary bg
        'gh-bg-tertiary': '#21262d',  // GitHub tertiary bg
        // Button tokens
        'gh-btn-primary': '#238636',
        'gh-btn-secondary': '#21262d',
        'gh-btn-ghost': 'transparent',
        // GitHub-inspired dark palette
        'gh-border': '#30363d',       // GitHub borders
        'gh-border-light': '#444c56', // GitHub light borders
        'gh-text': '#c9d1d9',         // GitHub primary text
        'gh-text-muted': '#8b949e',   // GitHub muted text
        'gh-text-secondary': '#6e7681', // GitHub secondary text
        'gh-button-bg': '#21262d',    // GitHub button background
        'gh-success': '#238636',      // GitHub green (success/primary)
        'gh-success-hover': '#2ea043', // GitHub green hover
        'gh-danger': '#f85149',       // GitHub red
        'gh-warning': '#d29922',      // GitHub yellow
        'gh-info': '#58a6ff',         // GitHub blue

        primary: {
          DEFAULT: '#DC2626', // Rojo corporativo - Energía y construcción
          dark: '#991B1B',     // Rojo oscuro - Hover y énfasis
          light: '#FCA5A5',    // Rojo claro - Fondos suaves
        },
        secondary: {
          DEFAULT: '#0F1419', // Negro corporativo - Elegancia y solidez
          dark: '#000000',    // Negro puro - Máximo contraste
          light: '#374151',   // Gris carbón - Elementos secundarios (WCAG AA compliant)
        },
        accent: {
          DEFAULT: '#F59E0B', // Dorado - Destacar ofertas y CTAs especiales
          dark: '#D97706',    // Dorado oscuro - Hover
          light: '#FCD34D',   // Dorado claro - Backgrounds
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      keyframes: {
        codeSymbol1: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.8) translateY(5px)' },
          '50%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        codeSymbol2: {
          '0%, 100%': { opacity: '0', transform: 'scale(0.8) translateY(5px)' },
          '33%': { opacity: '0', transform: 'scale(0.8) translateY(5px)' },
          '66%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        codeSymbol3: {
          '0%, 66%': { opacity: '0', transform: 'scale(0.8) translateY(5px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        progress: {
          '0%': { width: '0%' },
          '50%': { width: '70%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'code-symbol-1': 'codeSymbol1 2s ease-in-out infinite',
        'code-symbol-2': 'codeSymbol2 2s ease-in-out infinite',
        'code-symbol-3': 'codeSymbol3 2s ease-in-out infinite',
        'shimmer': 'shimmer 5s ease-in-out infinite',
        'progress': 'progress 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
