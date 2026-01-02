'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { QuotationConfig, ContenidoGeneral, VisibilidadConfig } from '@/lib/types'
import UserProfileMenu from '@/components/UserProfileMenu'
import ChangePasswordDialog from '@/components/ChangePasswordDialog'
import AdminBreadcrumbs from '@/features/admin/components/AdminBreadcrumbs'
import { useSidebarStore } from '@/stores/sidebarStore'

/** Configuración de cada item de navegación con su clave de datos */
interface NavItemConfig {
  id: string
  label: string
  /** Clave del dato en contenidoGeneral que determina si la sección se muestra */
  dataKey?: keyof ContenidoGeneral
  /** Clave en visibilidad (para secciones que usan el patrón visibilidad.X) */
  visibilityKey?: keyof VisibilidadConfig
}

/** Configuración completa de items de navegación - una sección se muestra si:
 * 1. No tiene dataKey ni visibilityKey (siempre visible)
 * 2. Tiene dataKey y contenidoGeneral[dataKey] existe
 * 3. Tiene visibilityKey y visibilidad[visibilityKey] !== false
 */
const navItemsConfig: NavItemConfig[] = [
  { id: 'resumen', label: 'Inicio' }, // Siempre visible
  { id: 'analisis', label: 'Solicitudes', dataKey: 'analisisRequisitos' },
  { id: 'dinamico-vs-estatico', label: 'Definición', dataKey: 'dinamicoVsEstatico' },
  { id: 'paquetes', label: 'Paquetes' }, // Siempre visible (sección principal)
  { id: 'comparativa', label: 'Comparativa', dataKey: 'tablaComparativa' },
  { id: 'garantias', label: 'Garantías', dataKey: 'garantias' },
  { id: 'faq', label: 'FAQ', visibilityKey: 'faq', dataKey: 'faq' },
  { id: 'contacto', label: 'Contacto', visibilityKey: 'contacto', dataKey: 'contacto' },
]

// Logos: verde para admin, azul con fondo para el resto
const LOGO_ADMIN = '/img/logo-novasuite_blue_txt_white.png'
const LOGO_DEFAULT = '/img/logo-novasuite_blue_backgroud_txt_white.png'
const LOGO_DARK = '/img/logo-novasuite_blue_txt_black.png' // Logo para fondo claro

interface NavigationProps {
  /** Cotización activa para determinar visibilidad de secciones */
  readonly cotizacion?: QuotationConfig | null
}

export default function Navigation({ cotizacion }: Readonly<NavigationProps>) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const isCompact = useSidebarStore((s) => s.isCompact)
  const navRef = useRef<HTMLElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const isAdminPage = pathname === '/admin'
  const { data: session } = useSession()

  // Si navegamos a otra ruta o recargamos se cierra el modal
  useEffect(() => {
    setIsChangePasswordOpen(false)
  }, [pathname])

  // Filtrar navItems basado en la visibilidad configurada en la cotización
  const navItems = useMemo(() => {
    // En página de admin, mostrar todos los items
    if (isAdminPage) {
      return navItemsConfig.map(({ id, label }) => ({ id, label }))
    }
    
    // Si no hay cotización, mostrar solo items sin dataKey (básicos)
    if (!cotizacion) {
      return navItemsConfig
        .filter(item => !item.dataKey && !item.visibilityKey)
        .map(({ id, label }) => ({ id, label }))
    }
    
    const contenido = cotizacion.contenidoGeneral
    const visibilidad = contenido?.visibilidad
    
    return navItemsConfig
      .filter(item => {
        // Sin dataKey ni visibilityKey = siempre visible
        if (!item.dataKey && !item.visibilityKey) return true
        
        // Si tiene dataKey, verificar que el dato existe
        if (item.dataKey) {
          const data = contenido?.[item.dataKey]
          // Para arrays (como faq), verificar que tenga elementos
          if (Array.isArray(data)) {
            if (data.length === 0) return false
          } else if (!data) {
            // Si no hay datos, no mostrar
            return false
          }
        }
        
        // Si tiene visibilityKey, verificar que no esté explícitamente desactivado
        if (item.visibilityKey && visibilidad) {
          const visible = visibilidad[item.visibilityKey]
          if (visible === false) return false
        }
        
        return true
      })
      .map(({ id, label }) => ({ id, label }))
  }, [cotizacion, isAdminPage])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    // Cerrar modal de cambio de contraseña si estaba abierto para evitar superposición al navegar
    setIsChangePasswordOpen(false)

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
            ? `bg-white/5 backdrop-blur-md border-b border-white/10 shadow-xl shadow-black/20 h-[60px] flex items-center`
            : isScrolled 
              ? 'bg-light-bg/95 backdrop-blur-sm border-b border-light-border shadow-sm py-2'
              : 'bg-light-bg border-b border-light-border py-3'
        }`}
      >
        <div className={`w-full ${isAdminPage ? 'px-0' : 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8'}`}>
          <div className="flex justify-between items-center">
            {/* Logo Container - Centrado con el ancho de la sidebar en Admin */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center transition-all duration-300 ${isAdminPage ? (isCompact ? 'w-16' : 'w-56') + ' justify-center border-r border-white/10' : ''}`}
            >
              <Link href="/" className="flex items-center">
                <Image
                  src={isAdminPage ? LOGO_ADMIN : LOGO_DARK}
                  alt="WebQuote Logo"
                  width={160}
                  height={36}
                  className={`transition-all duration-300 ${isAdminPage && isCompact ? 'scale-0 w-0' : 'scale-100'}`}
                  style={{ height: '36px', maxHeight: '36px' }}
                  priority
                />
                {isAdminPage && isCompact && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-gh-success rounded-lg flex items-center justify-center shadow-lg shadow-gh-success/20">
                      <span className="text-white font-bold text-xl">W</span>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className={`hidden xl:flex items-center ${isAdminPage ? 'flex-1 h-full' : 'gap-1'}`}>
              {isAdminPage ? (
                <>
                  {/* Breadcrumbs in Navbar */}
                  <div className="flex-1 flex items-center px-6">
                    <AdminBreadcrumbs />
                  </div>

                  {/* Right-aligned User Profile */}
                  <div className="flex-shrink-0 px-4 border-l border-white/10 h-8 flex items-center ml-4">
                    {session ? (
                      <UserProfileMenu 
                        variant="dark" 
                        onChangePassword={() => setIsChangePasswordOpen(true)}
                      />
                    ) : (
                      <Link href="/login">
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="px-4 py-1.5 text-sm font-semibold bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                          Iniciar Sesión
                        </motion.button>
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => scrollToSection(item.id)}
                      className="px-3 py-1.5 text-sm rounded-md transition-colors duration-200 font-medium text-light-text-secondary hover:text-light-text hover:bg-light-bg-tertiary"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                  
                  {/* Admin Button / User Profile - Default style */}
                  {session ? (
                    <div className="ml-3">
                      <UserProfileMenu 
                        variant="light" 
                        onChangePassword={() => setIsChangePasswordOpen(true)}
                      />
                    </div>
                  ) : (
                    <Link href="/login" className="ml-3">
                      <motion.button
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="px-4 py-1.5 text-sm font-semibold bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                      >
                        Iniciar Sesión
                      </motion.button>
                    </Link>
                  )}
                </>
              )}
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
              
              {/* User Profile or Login - Tablet */}
              {session ? (
                <div className="ml-2">
                  <UserProfileMenu 
                    variant={isAdminPage ? 'dark' : 'light'} 
                    onChangePassword={() => setIsChangePasswordOpen(true)}
                  />
                </div>
              ) : (
                <Link href="/login" className="ml-2">
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="px-3 py-1.5 text-xs font-semibold bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                  >
                    Ingresar
                  </motion.button>
                </Link>
              )}
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
            
            {/* Mobile: User Profile or Login */}
            <div className={`pt-3 mt-2 border-t ${isAdminPage ? 'border-[#30363d]' : 'border-light-border'}`}>
              {session ? (
                <div className="px-2">
                  <UserProfileMenu 
                    variant={isAdminPage ? 'dark' : 'light'} 
                    onChangePassword={() => setIsChangePasswordOpen(true)}
                  />
                </div>
              ) : (
                <Link href="/login">
                  <motion.button
                    className="w-full text-sm font-semibold px-4 py-2.5 bg-light-success text-white rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>🔐</span>
                    Iniciar Sesión
                  </motion.button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Diálogo de cambio de contraseña */}
      <ChangePasswordDialog
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={() => {
          setIsChangePasswordOpen(false)
        }}
      />
    </>
  )
}
