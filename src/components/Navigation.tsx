'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import styles from '../styles/Navigation.module.css'

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

// Mapeo de secciones a estilos (rojo, negro, blanco - coherencia corporativa)
const sectionStyles: { [key: string]: { overlayClass: string; textClass: string } } = {
  resumen: { overlayClass: 'navOverlayResumen', textClass: 'navTextResumen' },
  analisis: { overlayClass: 'navOverlayAnalisis', textClass: 'navTextAnalisis' },
  'dinamico-vs-estatico': { overlayClass: 'navOverlayDinamico', textClass: 'navTextDinamico' },
  paquetes: { overlayClass: 'navOverlayPaquetes', textClass: 'navTextPaquetes' },
  comparativa: { overlayClass: 'navOverlayComparativa', textClass: 'navTextComparativa' },
  garantias: { overlayClass: 'navOverlayGarantias', textClass: 'navTextGarantias' },
  faq: { overlayClass: 'navOverlayFaq', textClass: 'navTextFaq' },
  contacto: { overlayClass: 'navOverlayContacto', textClass: 'navTextContacto' },
}

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSectionStyle, setActiveSectionStyle] = useState(sectionStyles.resumen)
  const navRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname === '/administrador'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer para detectar sección activa
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          const styleConfig = sectionStyles[sectionId] || sectionStyles.resumen
          setActiveSectionStyle(styleConfig)
        }
      }
    }, observerOptions)

    // Observar todas las secciones
    for (const item of navItems) {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id: string) => {
    if (isAdminPage) {
      // Si estamos en /administrador, navega a la página principal primero
      router.push(`/?section=${id}`)
    } else {
      // Si estamos en la página principal, desplázate a la sección
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setIsMobileMenuOpen(false)
      }
    }
  }

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? `shadow-lg py-3 ${styles.navBackdropActive} ${styles[activeSectionStyle.overlayClass]}`
            : 'bg-transparent py-4 md:py-5 lg:py-4'
        } ${styles.navBackdrop}`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-4">
          <div className="flex justify-between items-center">
            {/* Logo - Responsive */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-bold transition-all duration-300 ${
                isScrolled
                  ? `text-base md:text-lg lg:text-xl ${styles[activeSectionStyle.textClass]} ${styles.navTextWithShadow}`
                  : 'text-white text-base md:text-lg lg:text-xl'
              }`}
            >
              Urbanísima CONSTRUCTORA S.R.L
            </motion.div>

            {/* Desktop Navigation - xl y mayores */}
            <div className="hidden xl:flex space-x-4 2xl:space-x-6 items-center">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-2 py-2 text-sm 2xl:text-base rounded-lg transition-all duration-300 whitespace-nowrap font-medium ${
                    isScrolled
                      ? `hover:bg-white/20 ${styles[activeSectionStyle.textClass]} ${styles.navTextWithShadow}`
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              {/* Botón Admin */}
              <Link href="/administrador">
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`px-3 py-2 text-sm 2xl:text-base rounded-lg font-bold transition-all duration-300 flex items-center gap-2 ${
                    isScrolled
                      ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'
                      : 'bg-gradient-to-r from-accent to-accent-dark text-white hover:shadow-lg'
                  }`}
                >
                  Admin
                </motion.button>
              </Link>
            </div>

            {/* Tablet Navigation - lg y xl */}
            <div className="hidden lg:flex xl:hidden space-x-2 items-center">
              {navItems.slice(0, 4).map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-2 py-2 text-xs rounded-lg transition-all duration-300 whitespace-nowrap font-medium ${
                    isScrolled
                      ? `hover:bg-white/20 ${styles[activeSectionStyle.textClass]} ${styles.navTextWithShadow}`
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </motion.button>
              ))}
              
              <Link href="/administrador">
                <motion.button
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`px-2 py-2 text-xs rounded-lg font-bold transition-all duration-300 ${
                    isScrolled
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-gradient-to-r from-accent to-accent-dark text-white hover:shadow-lg'
                  }`}
                >
                  Admin
                </motion.button>
              </Link>
            </div>

            {/* Mobile Menu Button - md y menores */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 transition-colors duration-300 ${
                isScrolled ? `hover:opacity-80 ${styles[activeSectionStyle.textClass]} ${styles.navTextWithShadow}` : 'text-white hover:text-gray-200'
              }`}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm lg:hidden pt-20"
        >
          <div className="flex flex-col items-stretch justify-start h-full space-y-2 p-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-left px-4 py-3 text-lg text-gray-700 hover:text-white hover:bg-primary rounded-lg transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
            
            {/* Admin Link Mobile */}
            <Link href="/administrador" className="mt-4 pt-4 border-t border-gray-200">
              <motion.button
                className="w-full text-lg font-bold px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📊 Admin
              </motion.button>
            </Link>
          </div>
        </motion.div>
      )}
    </>
  )
}
