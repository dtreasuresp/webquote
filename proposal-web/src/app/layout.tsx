import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Propuesta de Diseño Web - Urbanisima Constructora S.R.L',
  description: 'Página Catálogo Dinámica - Urbanisima Constructora S.R.L. Propuesta profesional de desarrollo web con 3 opciones de inversión.',
  keywords: 'diseño web, construcción, Urbanisima, página web, catálogo dinámico',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
