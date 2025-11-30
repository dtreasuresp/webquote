import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
  title: 'Propuesta de Diseño Web - Urbanísima Constructora S.R.L',
  description: 'Página Catálogo Dinámica - Urbanísima Constructora S.R.L. Propuesta profesional de desarrollo web con 3 opciones de inversión.',
  keywords: 'diseño web, construcción, Urbanísima, página web, catálogo dinámico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`scroll-smooth ${inter.variable}`}>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
