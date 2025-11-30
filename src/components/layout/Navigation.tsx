'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'

const navItems = [
  { id: 'resumen', label: 'Inicio' },
  { id: 'analisis', label: 'Solicitudes' },
  { id: 'dinamico-vs-estatico', label: 'Definición' },
  { id: 'paquetes', label: 'Paquetes' },
  { id: 'comparativa', label: 'Comparativa' },
  { id: 'garantias', label: 'Garantías' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contacto', label: 'Contacto' },
]

// Logos: verde para admin, azul con fondo para el resto
const LOGO_ADMIN = '/img/logo-webquote_green_txt_white.png'
const LOGO_DEFAULT = '/img/logo-webquote_blue_backgroud_txt_white.png'
const LOGO_DARK = '/img/logo-webquote_blue_txt_black.png' // Logo para fondo claro

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname === '/administrador'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    if (isAdminPage) {
      router.push(`/?section=${id}`)
    } else {
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIsMobileMenuOpen(false)
      }
    }
  }

  return (
    <>
      {/* GitHub-style Navigation */}
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-github ${
          isAdminPage
            ? isScrolled
              ? 'bg-[#0d1117]/80 backdrop-blur-md border-b border-[#30363d]/50 shadow-lg py-2'
              : 'bg-[#0d1117]/70 backdrop-blur-sm border-b border-[#30363d]/40 py-3'
            : isScrolled 
              ? 'bg-light-bg/95 backdrop-blur-sm border-b border-light-border shadow-sm py-2'
              : 'bg-light-bg border-b border-light-border py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <Link href="/" className="flex items-center">
                <Image
                  src={isAdminPage ? LOGO_ADMIN : LOGO_DARK}
                  alt="WebQuote Logo"
                  width={160}
                  height={36}
                  className="h-8 md:h-9 w-auto transition-all duration-300"
                  priority
                />
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 font-medium ${
                    isAdminPage
                      ? 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                      : 'text-light-text-secondary hover:text-light-text hover:bg-light-bg-tertiary'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* Admin Button - GitHub style */}
              <Link href="/administrador" className="ml-3">
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="px-4 py-1.5 text-sm font-semibold bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Admin
                </motion.button>
              </Link>
            </div>

            {/* Tablet Navigation */}
            <div className="hidden lg:flex xl:hidden items-center gap-1">
              {navItems.slice(0, 5).map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-2 py-1.5 text-xs rounded-md transition-colors duration-200 font-medium ${
                    isAdminPage
                      ? 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                      : 'text-light-text-secondary hover:text-light-text hover:bg-light-bg-tertiary'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <Link href="/administrador" className="ml-2">
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="px-3 py-1.5 text-xs font-semibold bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Admin
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors duration-200 ${
                isAdminPage
                  ? 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                  : 'text-light-text-secondary hover:text-light-text hover:bg-light-bg-tertiary'
              }`}
            >
              {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - GitHub Light Style */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`fixed inset-x-0 top-14 z-40 shadow-lg lg:hidden ${
            isAdminPage
              ? 'bg-[#0d1117] border-b border-[#30363d]'
              : 'bg-light-bg border-b border-light-border'
          }`}
        >
          <div className="flex flex-col p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left px-4 py-2.5 text-sm rounded-md transition-colors duration-200 font-medium ${
                  isAdminPage
                    ? 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'
                    : 'text-light-text-secondary hover:text-light-text hover:bg-light-bg-secondary'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Admin Link Mobile */}
            <div className={`pt-3 mt-2 border-t ${isAdminPage ? 'border-[#30363d]' : 'border-light-border'}`}>
              <Link href="/administrador">
                <motion.button
                  className="w-full text-sm font-semibold px-4 py-2.5 bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>📊</span>
                  Panel de Administración
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}
