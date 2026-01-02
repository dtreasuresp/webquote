/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════════
        // GITHUB DARK MODE (Admin Panel) - Official GitHub Dark Theme
        // Reference: https://primer.style/primitives/colors
        // ═══════════════════════════════════════════════════════════════
        // Canvas (background) tokens
        'gh-bg-absolute': '#010409ff',  // Absolute darkest
        'gh-bg': '#0d1117',           // Primary canvas background
        'gh-bg-overlay': '#161b22ff',   // Overlay backgrounds (modals, dropdowns)
        'gh-bg-secondary': '#161b2265', // Secondary canvas (cards, containers - elevated)
        'gh-bg-tertiary': '#070a0f5c',  // Tertiary (headers, table rows)
        'gh-bg-inset': '#010409ff',     // Inset backgrounds
        'gh-bg-subtle': '#22282fff',    // Subtle background variation
        
        // Button tokens
        'gh-btn-primary': '#238636',
        'gh-btn-primary-hover': '#2ea043',
        'gh-btn-secondary': '#21262d',
        'gh-btn-secondary-hover': '#30363d',
        'gh-btn-ghost': 'transparent',
        
        // Border tokens
        'gh-border': '#30363d',       // Default borders
        'gh-border-light': '#21262d', // Subtle borders
        'gh-border-muted': '#21262d', // Muted borders
        'gh-border-emphasis': '#484f58', // Emphasis borders
        
        // Text tokens
        'gh-text': '#e6edf3',         // Primary text (high contrast)
        'gh-text-muted': '#8b949e',   // Muted/secondary text
        'gh-text-secondary': '#8b949e', // Secondary text
        'gh-text-placeholder': '#6e7681', // Placeholder text
        'gh-text-disabled': '#484f58', // Disabled text
        'gh-text-link': '#58a6ff',    // Link text
        
        // Accent/Brand colors
        'gh-accent': '#58a6ff',       // Primary accent (blue)
        'gh-accent-hover': '#79c0ff', // Accent hover
        'gh-accent-muted': '#388bfd', // Muted accent
        'gh-accent-emphasis': '#1f6feb', // Emphasis accent (backgrounds)
        'gh-accent-subtle': 'rgba(56, 139, 253, 0.15)', // Subtle accent bg
        
        // Success tokens
        'gh-success': '#3fb950ff',      // Success text/icons
        'gh-success-hover': '#56d364', // Success hover
        'gh-success-bg': '#238636',   // Success button background
        'gh-success-emphasis': '#238636', // Success emphasis
        'gh-success-subtle': 'rgba(46, 160, 67, 0.15)', // Subtle success bg
        
        // Danger tokens
        'gh-danger': '#f85149',       // Danger text/icons
        'gh-danger-hover': '#ff7b72', // Danger hover
        'gh-danger-bg': '#da3633',    // Danger button background
        'gh-danger-emphasis': '#b62324', // Danger emphasis
        'gh-danger-subtle': 'rgba(248, 81, 73, 0.15)', // Subtle danger bg
        
        // Warning tokens
        'gh-warning': '#d29922',      // Warning text/icons
        'gh-warning-hover': '#e3b341', // Warning hover
        'gh-warning-emphasis': '#9e6a03', // Warning emphasis
        'gh-warning-subtle': 'rgba(187, 128, 9, 0.15)', // Subtle warning bg
        
        // Info tokens (same as accent for GitHub)
        'gh-info': '#58a6ff',         // Info text
        'gh-info-subtle': 'rgba(56, 139, 253, 0.15)', // Subtle info bg
        
        // Modal specific tokens
        'gh-modal-bg': '#161b22',     // Modal background
        'gh-modal-overlay': 'rgba(1, 4, 9, 0.8)', // Modal overlay

        // ═══════════════════════════════════════════════════════════════
        // FLUENT 2 DARK MODE (Modern Microsoft Design)
        // ═══════════════════════════════════════════════════════════════
        // Base backgrounds - Neutral grays (not blue-tinted)
        'fluent-bg-base': '#1f1f1f',        // Deepest background
        'fluent-bg-layer1': '#292929',      // Card/container background
        'fluent-bg-layer2': '#323232',      // Elevated surfaces
        'fluent-bg-layer3': '#3b3b3b',      // Highest elevation
        'fluent-bg-subtle': '#252525',      // Subtle background variation
        
        // Borders - Very subtle white opacity
        'fluent-border': 'rgba(255, 255, 255, 0.08)',
        'fluent-border-subtle': 'rgba(255, 255, 255, 0.05)',
        'fluent-border-strong': 'rgba(255, 255, 255, 0.12)',
        
        // Text colors - White with opacity levels
        'fluent-text': '#ffffff',                    // Primary text
        'fluent-text-secondary': 'rgba(255, 255, 255, 0.7)',  // Secondary
        'fluent-text-tertiary': 'rgba(255, 255, 255, 0.5)',   // Tertiary/muted
        'fluent-text-disabled': 'rgba(255, 255, 255, 0.36)',  // Disabled
        
        // Accent colors - Microsoft Fluent blue
        'fluent-accent': '#60CDFF',                  // Primary accent (bright)
        'fluent-accent-hover': '#82D8FF',            // Accent hover
        'fluent-accent-pressed': '#4CC2FF',          // Accent pressed
        'fluent-accent-subtle': 'rgba(96, 205, 255, 0.15)',   // Subtle background
        'fluent-accent-dark': '#0078D4',             // Classic Microsoft blue
        
        // Success - Vibrant green
        'fluent-success': '#6CCB5F',                 // Success text/icons
        'fluent-success-bg': '#2D4A2D',              // Success background
        'fluent-success-subtle': 'rgba(108, 203, 95, 0.15)',
        
        // Warning - Warm yellow
        'fluent-warning': '#FCE100',                 // Warning text/icons
        'fluent-warning-bg': '#4A4522',              // Warning background
        'fluent-warning-subtle': 'rgba(252, 225, 0, 0.15)',
        
        // Danger/Error - Red
        'fluent-danger': '#FF6B6B',                  // Error text/icons
        'fluent-danger-bg': '#4A2D2D',               // Error background
        'fluent-danger-subtle': 'rgba(255, 107, 107, 0.15)',
        
        // Info - Cyan
        'fluent-info': '#60CDFF',                    // Info (same as accent)
        'fluent-info-bg': '#2D3E4A',                 // Info background
        'fluent-info-subtle': 'rgba(96, 205, 255, 0.12)',

        // ═══════════════════════════════════════════════════════════════
        // GITHUB LIGHT MODE (Public Page)
        // ═══════════════════════════════════════════════════════════════
        'light-bg': '#ffffff',              // Fondo principal
        'light-bg-secondary': '#f6f8fa',    // Fondo secundario (cards, sections)
        'light-bg-tertiary': '#f1f3f5',     // Fondo terciario (headers, hover)
        'light-bg-emphasis': '#eaeef2',     // Fondo énfasis
        'light-border': '#d1d9e0',          // Bordes principales
        'light-border-muted': '#d8dee4',    // Bordes suaves
        'light-text': '#1f2328',            // Texto principal
        'light-text-secondary': '#656d76',  // Texto secundario
        'light-text-muted': '#818b98',      // Texto silenciado
        'light-text-placeholder': '#6e7781', // Placeholders
        'light-accent': '#0969da',          // Acento principal (links, botones)
        'light-accent-hover': '#0860ca',    // Acento hover
        'light-success': '#1a7f37',         // Verde éxito
        'light-success-bg': '#dafbe1',      // Fondo verde claro
        'light-danger': '#d1242f',          // Rojo error
        'light-danger-bg': '#ffebe9',       // Fondo rojo claro
        'light-warning': '#bf8700',         // Amarillo advertencia
        'light-warning-bg': '#fff8c5',      // Fondo amarillo claro
        'light-info': '#0969da',            // Azul información
        'light-info-bg': '#ddf4ff',         // Fondo azul claro

        // ═══════════════════════════════════════════════════════════════
        // LEGACY COLORS (Mantener compatibilidad)
        // ═══════════════════════════════════════════════════════════════
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
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        github: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
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
