import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import AuthProvider from '@/components/providers/AuthProvider'
import '../styles/globals.css'
import '../styles/modal-scroll.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', 'arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'WebQuote - Cotizaciones Online',
  description: 'Crea y gestiona cotizaciones online de forma rápida y sencilla con WebQuote. Ideal para profesionales y empresas que buscan eficiencia y organización en sus procesos de venta.',
  keywords: 'cotizaciones online, gestión de cotizaciones, eficiencia, organización, profesionales, empresas',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
