'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import {
  // Cotización
  FileText,
  MapPin,
  Mail,
  // Oferta
  Box,
  Boxes,
  Puzzle,
  Layers,
  DollarSign,
  Star,
  // Contenido
  ClipboardList,
  ArrowRightLeft,
  Calendar,
  CreditCard,
  Table,
  AlertTriangle,
  Flag,
  HelpCircle,
  Shield,
  Phone,
  Scale,
  // Historial
  History,
  // Preferencias
  Settings,
  RefreshCw,
  Users,
  ShieldCheck,
  BarChart3,
  Building2,
  // CRM
  Building2 as BuildingIcon,
  Package,
  Target,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  // Footer
  MailCheckIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSidebarStore, type SidebarSection, type SidebarCategory } from '@/stores/sidebarStore'

// Los tipos se importan del store (useSidebarStore)

interface SidebarItem {
  id: SidebarSection
  label: string
  icon: React.ReactNode
  category: SidebarCategory
  badge?: number
  description?: string
}

interface SidebarCategoryGroup {
  id: SidebarCategory
  label: string
  icon: React.ReactNode
  items: SidebarItem[]
}

// Función para obtener badges dinámicos (conteos de elementos)
const getBadgeCount = (itemId: SidebarSection): number => {
  const badgeCounts: Record<SidebarSection, number> = {
    // Cotización
    'cot-info': 0, 'cot-cliente': 0, 'cot-proveedor': 0,
    // Oferta
    'oferta-desc': 0, 'oferta-base': 2, 'oferta-opt': 1, 'oferta-fin': 0, 'oferta-paq': 3, 'oferta-caract': 0,
    // Contenido
    'cont-resumen': 0, 'cont-analisis': 0, 'cont-fortale': 0, 'cont-compar': 0, 'cont-crono': 0, 'cont-cuotas': 0, 'cont-paq': 3, 'cont-notas': 0, 'cont-concl': 0, 'cont-faq': 0, 'cont-garant': 0, 'cont-contact': 0, 'cont-terminos': 0,
    // Historial
    'hist-versiones': 0,
    // CRM
    'crm-clientes': 0, 'crm-contactos': 0, 'crm-productos': 0, 'crm-oportunidades': 0, 'crm-interacciones': 0, 'crm-historial': 0, 'crm-pricing': 0, 'crm-suscripciones': 0, 'crm-compliance': 0, 'crm-reglas': 0, 'crm-plantillas': 0,
    // Preferencias
    'pref-config': 0, 'pref-sync': 0, 'pref-usuarios': 0, 'pref-org': 0, 'pref-roles': 0, 'pref-permisos': 0, 'pref-matriz': 0, 'pref-permuser': 0, 'pref-logs': 0, 'pref-backups': 0, 'pref-reportes': 0,
  }
  return badgeCounts[itemId] || 0
}

const SIDEBAR_CONFIG: SidebarCategoryGroup[] = [
  {
    id: 'cotizacion',
    label: 'Cotización',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { id: 'cot-info', label: 'Información', icon: <FileText className="w-3 h-3" />, category: 'cotizacion', description: 'Datos de la cotización' },
      { id: 'cot-cliente', label: 'Cliente', icon: <MapPin className="w-3 h-3" />, category: 'cotizacion', description: 'Información del cliente' },
      { id: 'cot-proveedor', label: 'Proveedor', icon: <Mail className="w-3 h-3" />, category: 'cotizacion', description: 'Información del proveedor' },
    ],
  },
  {
    id: 'oferta',
    label: 'Oferta',
    icon: <Box className="w-4 h-4" />,
    items: [
      { id: 'oferta-desc', label: 'Descripción', icon: <Box className="w-3 h-3" />, category: 'oferta', description: 'Descripción del paquete' },
      { id: 'oferta-base', label: 'Servicios Base', icon: <Boxes className="w-3 h-3" />, category: 'oferta', description: 'Servicios incluidos' },
      { id: 'oferta-opt', label: 'Opcionales', icon: <Puzzle className="w-3 h-3" />, category: 'oferta', description: 'Servicios opcionales' },
      { id: 'oferta-fin', label: 'Financiero', icon: <DollarSign className="w-3 h-3" />, category: 'oferta', description: 'Pago y descuentos' },
      { id: 'oferta-paq', label: 'Paquetes', icon: <Layers className="w-3 h-3" />, category: 'oferta', description: 'Gestión de paquetes' },
      { id: 'oferta-caract', label: 'Características', icon: <Star className="w-3 h-3" />, category: 'oferta', description: 'Diferenciadoras' },
    ],
  },
  {
    id: 'contenido',
    label: 'Contenido',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { id: 'cont-resumen', label: 'Resumen', icon: <FileText className="w-3 h-3" />, category: 'contenido', description: 'Resumen ejecutivo' },
      { id: 'cont-analisis', label: 'Análisis', icon: <ClipboardList className="w-3 h-3" />, category: 'contenido', description: 'Análisis técnico' },
      { id: 'cont-fortale', label: 'Fortalezas', icon: <Star className="w-3 h-3" />, category: 'contenido', description: 'Ventajas competitivas' },
      { id: 'cont-compar', label: 'Comparativa', icon: <ArrowRightLeft className="w-3 h-3" />, category: 'contenido', description: 'Comparación' },
      { id: 'cont-crono', label: 'Cronograma', icon: <Calendar className="w-3 h-3" />, category: 'contenido', description: 'Timeline del proyecto' },
      { id: 'cont-cuotas', label: 'Cuotas', icon: <CreditCard className="w-3 h-3" />, category: 'contenido', description: 'Plan de pagos' },
      { id: 'cont-paq', label: 'Paquetes', icon: <Table className="w-3 h-3" />, category: 'contenido', description: 'Tabla de paquetes' },
      { id: 'cont-notas', label: 'Notas', icon: <AlertTriangle className="w-3 h-3" />, category: 'contenido', description: 'Observaciones' },
      { id: 'cont-concl', label: 'Conclusión', icon: <Flag className="w-3 h-3" />, category: 'contenido', description: 'Conclusiones' },
      { id: 'cont-faq', label: 'FAQ', icon: <HelpCircle className="w-3 h-3" />, category: 'contenido', description: 'Preguntas frecuentes' },
      { id: 'cont-garant', label: 'Garantías', icon: <Shield className="w-3 h-3" />, category: 'contenido', description: 'Garantías y responsabilidades' },
      { id: 'cont-contact', label: 'Contacto', icon: <Phone className="w-3 h-3" />, category: 'contenido', description: 'Información de contacto' },
      { id: 'cont-terminos', label: 'Términos', icon: <Scale className="w-3 h-3" />, category: 'contenido', description: 'Términos y condiciones' },
    ],
  },
  {
    id: 'historial',
    label: 'Historial',
    icon: <History className="w-4 h-4" />,
    items: [
      { id: 'hist-versiones', label: 'Versiones', icon: <History className="w-3 h-3" />, category: 'historial', description: 'Historial de versiones' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <BuildingIcon className="w-4 h-4" />,
    items: [
      { id: 'crm-clientes', label: 'Clientes', icon: <BuildingIcon className="w-3 h-3" />, category: 'crm', description: 'Gestión de cuentas' },
      { id: 'crm-contactos', label: 'Contactos', icon: <Users className="w-3 h-3" />, category: 'crm', description: 'Personas de contacto' },
      { id: 'crm-productos', label: 'Productos', icon: <Package className="w-3 h-3" />, category: 'crm', description: 'Catálogo centralizado' },
      { id: 'crm-oportunidades', label: 'Oportunidades', icon: <Target className="w-3 h-3" />, category: 'crm', description: 'Pipeline de ventas' },
      { id: 'crm-interacciones', label: 'Interacciones', icon: <MessageCircle className="w-3 h-3" />, category: 'crm', description: 'Historial de comunicaciones' },
      { id: 'crm-historial', label: 'Auditoría', icon: <BarChart3 className="w-3 h-3" />, category: 'crm', description: 'Cambios de datos' },
      { id: 'crm-pricing', label: 'Pricing', icon: <DollarSign className="w-3 h-3" />, category: 'crm', description: 'Listas de precios' },
      { id: 'crm-suscripciones', label: 'Suscripciones', icon: <TrendingUp className="w-3 h-3" />, category: 'crm', description: 'Servicios recurrentes' },
      { id: 'crm-compliance', label: 'Cumplimiento', icon: <CheckCircle2 className="w-3 h-3" />, category: 'crm', description: 'Validaciones fiscales' },
      { id: 'crm-reglas', label: 'Reglas', icon: <Settings className="w-3 h-3" />, category: 'crm', description: 'Reglas de negocio' },
      { id: 'crm-plantillas', label: 'Plantillas', icon: <FileText className="w-3 h-3" />, category: 'crm', description: 'Plantillas PDF' },
    ],
  },
  {
    id: 'preferencias',
    label: 'Preferencias',
    icon: <Settings className="w-4 h-4" />,
    items: [
      { id: 'pref-config', label: 'Configuración', icon: <Settings className="w-3 h-3" />, category: 'preferencias', description: 'Preferencias generales' },
      { id: 'pref-sync', label: 'Sincronización', icon: <RefreshCw className="w-3 h-3" />, category: 'preferencias', description: 'Caché y sincronización' },
      { id: 'pref-usuarios', label: 'Usuarios', icon: <Users className="w-3 h-3" />, category: 'preferencias', description: 'Gestión de usuarios' },
      { id: 'pref-org', label: 'Organizaciones', icon: <Building2 className="w-3 h-3" />, category: 'preferencias', description: 'Estructura organizacional' },
      { id: 'pref-roles', label: 'Roles', icon: <ShieldCheck className="w-3 h-3" />, category: 'preferencias', description: 'Definición de roles' },
      { id: 'pref-permisos', label: 'Permisos', icon: <Shield className="w-3 h-3" />, category: 'preferencias', description: 'Gestión de permisos' },
      { id: 'pref-matriz', label: 'Matriz Acceso', icon: <Table className="w-3 h-3" />, category: 'preferencias', description: 'Matriz de control de acceso' },
      { id: 'pref-permuser', label: 'Permisos individuales', icon: <Users className="w-3 h-3" />, category: 'preferencias', description: 'Permisos por usuario' },
      { id: 'pref-logs', label: 'Logs', icon: <FileText className="w-3 h-3" />, category: 'preferencias', description: 'Auditoría de eventos' },
      { id: 'pref-backups', label: 'Backups', icon: <Shield className="w-3 h-3" />, category: 'preferencias', description: 'Copias de seguridad' },
      { id: 'pref-reportes', label: 'Reportes', icon: <BarChart3 className="w-3 h-3" />, category: 'preferencias', description: 'Reportes de auditoría' },
    ],
  },
]

interface UnifiedAdminSidebarProps {
  onSectionChange?: (section: SidebarSection) => void
}

export default function UnifiedAdminSidebar({
  onSectionChange,
}: Readonly<UnifiedAdminSidebarProps>) {
  // Usar el store para obtener y actualizar estado
  const activeSection = useSidebarStore((state) => state.activeSection)
  const expandedCategories = useSidebarStore((state) => state.expandedCategories)
  const setActiveSection = useSidebarStore((state) => state.setActiveSection)
  const toggleCategory = useSidebarStore((state) => state.toggleCategory)
  const collapseAll = useSidebarStore((state) => state.collapseAll)
  const expandCategory = useSidebarStore((state) => state.expandCategory)

  const handleCategoryClick = (category: SidebarCategory) => {
    const isExpanded = expandedCategories.has(category)
    if (isExpanded) {
      useSidebarStore.getState().collapseCategory(category)
    } else {
      collapseAll()
      expandCategory(category)
    }
  }

  const handleItemClick = (item: SidebarItem) => {
    setActiveSection(item.id)
    // Asegurar que su categoría esté expandida (comportamiento acordeón)
    if (!expandedCategories.has(item.category)) {
      collapseAll()
      expandCategory(item.category)
    }
    // Callback opcional al cambiar sección
    if (onSectionChange) {
      onSectionChange(item.id)
    }
  }

  // Colores unificados a verde para coherencia visual
  const anyExpanded = expandedCategories.size > 0
  const getCategoryColor = (categoryId: SidebarCategory, isExpanded: boolean, hasActiveItem: boolean) => {
    // Prioridad: Si está expandida, mostrar color de acento. 
    // Si no está expandida pero tiene el item activo, mostrar color sutil SOLO si no hay ninguna otra expandida.
    if (isExpanded) {
      return 'text-gh-success bg-gh-success/10 border-gh-success/20'
    }
    if (hasActiveItem && !anyExpanded) {
      return 'text-gh-success/80 bg-gh-success/5 border-transparent'
    }
    return 'text-gh-text-muted hover:text-gh-success hover:bg-gh-success/5'
  }

  return (
    <div className="w-56 bg-[#0d1117] border-r border-gh-border flex flex-col relative z-20 h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gh-border bg-[#161b22]/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-gh-success rounded-full" />
          <h2 className="text-[11px] font-bold text-gh-text uppercase tracking-[0.2em]">Panel Admin</h2>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none p-2 space-y-1.5 pb-10">
        {SIDEBAR_CONFIG.map((group) => {
          const isExpanded = expandedCategories.has(group.id)
          const hasActiveItem = group.items.some((item) => item.id === activeSection)
          const categoryStyle = getCategoryColor(group.id, isExpanded, hasActiveItem)

          return (
            <div key={group.id} className="space-y-1">
              {/* Category Header - Button */}
              <motion.button
                onClick={() => handleCategoryClick(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all duration-200 border border-transparent outline-none ${categoryStyle}`}
                whileTap={{ scale: 0.97 }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'scale-110' : 'scale-100'}`}>
                    {group.icon}
                  </div>
                  <span className="truncate uppercase tracking-wider">{group.label}</span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex-shrink-0 opacity-60"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.div>
              </motion.button>

              {/* Category Items - Expandable */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden space-y-1 pl-2"
                  >
                    {group.items.map((item) => {
                      const isActive = activeSection === item.id

                      return (
                        <motion.button
                          key={item.id}
                          onClick={() => handleItemClick(item)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] transition-all duration-200 outline-none group relative ${
                            isActive
                              ? 'bg-gh-success/10 text-gh-success font-semibold border border-gh-success/20'
                              : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-success/5'
                          }`}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.96 }}
                          title={item.description}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeIndicator"
                              className="absolute left-0 w-0.5 h-3.5 bg-gh-success rounded-full"
                            />
                          )}
                          <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-gh-success' : 'group-hover:text-gh-success'}`}>
                            {item.icon}
                          </div>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {getBadgeCount(item.id) > 0 && (
                            <span className={`ml-auto flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-gh-success/20 text-gh-success' : 'bg-gh-success/10 text-gh-success border border-gh-success/20'
                            }`}>
                              {getBadgeCount(item.id)}
                            </span>
                          )}
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>
    </div>
  )
}
