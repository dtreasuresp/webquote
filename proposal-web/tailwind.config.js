/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626', // Rojo corporativo - Energía y construcción
          dark: '#991B1B',     // Rojo oscuro - Hover y énfasis
          light: '#FCA5A5',    // Rojo claro - Fondos suaves
        },
        secondary: {
          DEFAULT: '#0F1419', // Negro corporativo - Elegancia y solidez
          dark: '#000000',    // Negro puro - Máximo contraste
          light: '#1F2937',   // Gris carbón - Elementos secundarios
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
    },
  },
  plugins: [],
}
