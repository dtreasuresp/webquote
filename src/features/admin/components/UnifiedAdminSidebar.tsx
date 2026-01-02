'use client'

import React from 'react'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
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
  LayoutDashboard,
  MessageSquare,
  // CRM
  Package,
  Target,
  MessageCircle,
  CheckCircle2,
  TrendingUp,
  // Nuevos
  ShoppingCart,
  Wallet,
  Monitor,
  Globe,
  Key,
  Layout,
  Activity,
  Briefcase,
  Percent,
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
    // Analytics
    'analytics-dashboard': 0, 'analytics-ventas': 0, 'analytics-clientes': 0,
    // CRM
    'crm-dashboard': 0, 'crm-clientes': 0, 'crm-contactos': 0, 'crm-oportunidades': 0, 'crm-interacciones': 0, 'crm-productos': 0, 'crm-historial': 0, 'crm-pricing': 0,
    'crm-suscripciones': 0, 'crm-facturas': 0, 'crm-cotizaciones': 0, 'crm-reportes': 0, 'crm-compliance': 0, 'crm-reglas': 0, 'crm-plantillas': 0, 'crm-configuracion': 0,
    // Sales
    'sales-cotizaciones': 0, 'sales-pedidos': 0, 'sales-facturas': 0, 'sales-descuentos': 0, 'sales-reportes': 0,
    // Inventory
    'inv-productos': 0, 'inv-stock': 0, 'inv-movimientos': 0, 'inv-categorias': 0,
    // Finance
    'fin-cobros': 0, 'fin-pagos': 0, 'fin-impuestos': 0, 'fin-contabilidad': 0,
    // People
    'ppl-empleados': 0, 'ppl-nomina': 0, 'ppl-asistencia': 0,
    // Projects
    'prj-proyectos': 0, 'prj-tareas': 0, 'prj-recursos': 0,
    // POS
    'pos-venta': 0, 'pos-caja': 0, 'pos-tickets': 0,
    // eCommerce
    'eco-tiendas': 0, 'eco-pedidos': 0, 'eco-clientes': 0,
    // Licensing
    'lic-suscripciones': 0, 'lic-planes': 0, 'lic-modulos': 0,
    // Settings
    'set-general': 0, 'set-personalizacion': 0, 'set-integraciones': 0,
    // Cotización (Legacy/Contextual)
    'cot-info': 0, 'cot-cliente': 0, 'cot-proveedor': 0,
    // Oferta (Legacy/Contextual)
    'oferta-desc': 0, 'oferta-base': 2, 'oferta-opt': 1, 'oferta-fin': 0, 'oferta-paq': 3, 'oferta-caract': 0,
    // Contenido (Legacy/Contextual)
    'cont-resumen': 0, 'cont-analisis': 0, 'cont-fortale': 0, 'cont-compar': 0, 'cont-crono': 0, 'cont-cuotas': 0, 'cont-paq': 3, 'cont-notas': 0, 'cont-concl': 0, 'cont-faq': 0, 'cont-garant': 0, 'cont-contact': 0, 'cont-terminos': 0,
    // Historial
    'hist-versiones': 0,
    // CRM
    'crm-dashboard': 0, 'crm-clientes': 0, 'crm-contactos': 0, 'crm-productos': 0, 'crm-oportunidades': 0, 'crm-interacciones': 0, 'crm-historial': 0, 'crm-pricing': 0, 'crm-suscripciones': 0, 'crm-compliance': 0, 'crm-reglas': 0, 'crm-plantillas': 0, 'crm-facturas': 0, 'crm-cotizaciones': 0, 'crm-reportes': 0, 'crm-configuracion': 0,
    // Preferencias
    'pref-config': 0, 'pref-sync': 0, 'pref-usuarios': 0, 'pref-org': 0, 'pref-roles': 0, 'pref-permisos': 0, 'pref-matriz': 0, 'pref-permuser': 0, 'pref-logs': 0, 'pref-backups': 0, 'pref-reportes': 0,
  }
  return badgeCounts[itemId] || 0
}

const SIDEBAR_CONFIG: SidebarCategoryGroup[] = [
  {
    id: 'analytics',
    label: 'Analítica',
    icon: <BarChart3 className="w-4 h-4" />,
    items: [
      { id: 'analytics-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3 h-3" />, category: 'analytics', description: 'Vista general' },
      { id: 'analytics-ventas', label: 'Ventas', icon: <TrendingUp className="w-3 h-3" />, category: 'analytics', description: 'Análisis de ventas' },
      { id: 'analytics-clientes', label: 'Clientes', icon: <Users className="w-3 h-3" />, category: 'analytics', description: 'Métricas de clientes' },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: <Building2 className="w-4 h-4" />,
    items: [
      { id: 'crm-dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3 h-3" />, category: 'crm', description: 'Panel de control CRM' },
      { id: 'crm-clientes', label: 'Clientes', icon: <Building2 className="w-3 h-3" />, category: 'crm', description: 'Gestión de cuentas' },
      { id: 'crm-contactos', label: 'Contactos', icon: <Users className="w-3 h-3" />, category: 'crm', description: 'Personas de contacto' },
      { id: 'crm-productos', label: 'Productos', icon: <Package className="w-3 h-3" />, category: 'crm', description: 'Catálogo centralizado' },
      { id: 'crm-oportunidades', label: 'Oportunidades', icon: <Target className="w-3 h-3" />, category: 'crm', description: 'Pipeline de ventas' },
      { id: 'crm-interacciones', label: 'Interacciones', icon: <MessageSquare className="w-3 h-3" />, category: 'crm', description: 'Historial de comunicaciones' },
    ],
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: <ShoppingCart className="w-4 h-4" />,
    items: [
      { id: 'sales-cotizaciones', label: 'Cotizaciones', icon: <FileText className="w-3 h-3" />, category: 'sales', description: 'Gestión de cotizaciones' },
      { id: 'sales-pedidos', label: 'Pedidos', icon: <ClipboardList className="w-3 h-3" />, category: 'sales', description: 'Órdenes de venta' },
      { id: 'sales-facturas', label: 'Facturación', icon: <CreditCard className="w-3 h-3" />, category: 'sales', description: 'Facturas emitidas' },
      { id: 'sales-descuentos', label: 'Descuentos', icon: <Percent className="w-3 h-3" />, category: 'sales', description: 'Reglas de precio' },
    ],
  },
  {
    id: 'inventory',
    label: 'Invetario',
    icon: <Package className="w-4 h-4" />,
    items: [
      { id: 'inv-productos', label: 'Productos', icon: <Box className="w-3 h-3" />, category: 'inventory', description: 'Catálogo de productos' },
      { id: 'inv-stock', label: 'Stock', icon: <Layers className="w-3 h-3" />, category: 'inventory', description: 'Control de inventario' },
      { id: 'inv-movimientos', label: 'Movimientos', icon: <ArrowRightLeft className="w-3 h-3" />, category: 'inventory', description: 'Kardex de productos' },
    ],
  },
  {
    id: 'finance',
    label: 'Finanzas',
    icon: <Wallet className="w-4 h-4" />,
    items: [
      { id: 'fin-cobros', label: 'Cuentas por Cobrar', icon: <DollarSign className="w-3 h-3" />, category: 'finance', description: 'Gestión de cobros' },
      { id: 'fin-pagos', label: 'Cuentas por Pagar', icon: <CreditCard className="w-3 h-3" />, category: 'finance', description: 'Gestión de pagos' },
      { id: 'fin-impuestos', label: 'Impuestos', icon: <ShieldCheck className="w-3 h-3" />, category: 'finance', description: 'Configuración fiscal' },
    ],
  },
  {
    id: 'people',
    label: 'RRHH',
    icon: <Users className="w-4 h-4" />,
    items: [
      { id: 'ppl-empleados', label: 'Empleados', icon: <Users className="w-3 h-3" />, category: 'people', description: 'Gestión de personal' },
      { id: 'ppl-nomina', label: 'Nómina', icon: <CreditCard className="w-3 h-3" />, category: 'people', description: 'Pago de salarios' },
    ],
  },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: <Briefcase className="w-4 h-4" />,
    items: [
      { id: 'prj-proyectos', label: 'Proyectos', icon: <Layout className="w-3 h-3" />, category: 'projects', description: 'Gestión de proyectos' },
      { id: 'prj-tareas', label: 'Tareas', icon: <CheckCircle2 className="w-3 h-3" />, category: 'projects', description: 'Control de actividades' },
    ],
  },
  {
    id: 'pos',
    label: 'POS',
    icon: <Monitor className="w-4 h-4" />,
    items: [
      { id: 'pos-venta', label: 'Terminal de Venta', icon: <Monitor className="w-3 h-3" />, category: 'pos', description: 'Punto de venta' },
      { id: 'pos-caja', label: 'Cierre de Caja', icon: <Wallet className="w-3 h-3" />, category: 'pos', description: 'Control de efectivo' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'eCommerce',
    icon: <Globe className="w-4 h-4" />,
    items: [
      { id: 'eco-tiendas', label: 'Tiendas Online', icon: <Globe className="w-3 h-3" />, category: 'ecommerce', description: 'Gestión multi-tienda' },
      { id: 'eco-pedidos', label: 'Pedidos Web', icon: <ShoppingCart className="w-3 h-3" />, category: 'ecommerce', description: 'Órdenes online' },
    ],
  },
  {
    id: 'licensing',
    label: 'Licenciamiento',
    icon: <Key className="w-4 h-4" />,
    items: [
      { id: 'lic-suscripciones', label: 'Suscripciones', icon: <Key className="w-3 h-3" />, category: 'licensing', description: 'Planes de clientes' },
      { id: 'lic-planes', label: 'Planes y Precios', icon: <Layers className="w-3 h-3" />, category: 'licensing', description: 'Configuración de planes' },
    ],
  },
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
    id: 'settings',
    label: 'Configuración',
    icon: <Settings className="w-4 h-4" />,
    items: [
      { id: 'set-general', label: 'General', icon: <Settings className="w-3 h-3" />, category: 'settings', description: 'Configuración general' },
      { id: 'set-personalizacion', label: 'Personalización', icon: <Activity className="w-3 h-3" />, category: 'settings', description: 'Apariencia y temas' },
      { id: 'set-integraciones', label: 'Integraciones', icon: <Globe className="w-3 h-3" />, category: 'settings', description: 'APIs y conexiones' },
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
  const showLabels = useSidebarStore((state) => state.showLabels)
  const isCompact = useSidebarStore((state) => state.isCompact)
  const setActiveSection = useSidebarStore((state) => state.setActiveSection)
  const collapseAll = useSidebarStore((state) => state.collapseAll)
  const expandCategory = useSidebarStore((state) => state.expandCategory)
  const toggleSidebarCompact = useSidebarStore((state) => state.toggleSidebarCompact)
  const setShowLabels = useSidebarStore((state) => state.setShowLabels)

  const handleCategoryClick = (category: SidebarCategory) => {
    const isExpanded = expandedCategories.has(category)
    if (isExpanded) {
      useSidebarStore.getState().collapseCategory(category)
    } else {
      collapseAll()
      expandCategory(category)
    }
  }

  const handleToggleCompact = () => {
    const newCompact = !isCompact
    toggleSidebarCompact()
    setShowLabels(!newCompact)
    if (newCompact) {
      collapseAll()
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
    if (isExpanded) {
      return 'text-gh-success bg-gh-success/10 border-gh-success/20 shadow-[0_0_15px_rgba(35,134,54,0.1)]'
    }
    if (hasActiveItem) {
      return 'text-gh-success bg-gh-success/5 border-gh-success/10'
    }
    return 'text-gh-text-muted hover:text-gh-success hover:bg-gh-success/5'
  }

  return (
    <div className={`${isCompact ? 'w-16' : 'w-56'} bg-transparent backdrop-blur-md border-r border-gh-border flex flex-col relative z-20 h-full transition-all duration-300`}>
      {/* Header */}
      <div className={`px-4 py-4 border-b border-gh-border bg-white/5 flex-shrink-0 flex items-center ${isCompact ? 'justify-center' : 'justify-between'}`}>
        {!isCompact && (
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gh-success rounded-full" />
            <h2 className="text-[11px] font-bold text-gh-text uppercase tracking-[0.2em]">MÓDULOS</h2>
          </div>
        )}
        
        <motion.button
          onClick={handleToggleCompact}
          className="p-1.5 rounded-md hover:bg-gh-bg-tertiary text-gh-text-muted hover:text-gh-text transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCompact ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Navigation - Scrollable */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden scrollbar-none ${isCompact ? 'p-1.5' : 'p-2'} space-y-1.5 pb-10`}>
        {SIDEBAR_CONFIG.map((group) => {
          const isExpanded = expandedCategories.has(group.id)
          const hasActiveItem = group.items.some((item) => item.id === activeSection)
          const categoryStyle = getCategoryColor(group.id, isExpanded, hasActiveItem)

          return (
            <div key={group.id} className="space-y-1">
              {/* Category Header - Button */}
              <motion.button
                onClick={() => handleCategoryClick(group.id)}
                className={`w-full flex items-center ${isCompact ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all duration-200 border border-transparent outline-none ${categoryStyle}`}
                whileTap={{ scale: 0.97 }}
                title={isCompact ? group.label : undefined}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`flex-shrink-0 transition-transform duration-300 ${isExpanded ? 'scale-110' : 'scale-100'}`}>
                    {group.icon}
                  </div>
                  {!isCompact && showLabels && (
                    <span className="truncate uppercase tracking-wider">{group.label}</span>
                  )}
                </div>
                {!isCompact && showLabels && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="flex-shrink-0 opacity-60"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </motion.div>
                )}
              </motion.button>

              {/* Category Items - Expandable */}
              <AnimatePresence initial={false}>
                {isExpanded && !isCompact && (
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
                              ? 'bg-gh-success/10 text-gh-success font-semibold border border-gh-success/20 shadow-[0_0_10px_rgba(35,134,54,0.05)]'
                              : 'text-gh-text-muted hover:text-gh-text hover:bg-gh-success/5'
                          }`}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.96 }}
                          title={item.description}
                        >
                          {isActive && (
                            <motion.div 
                              layoutId="activeIndicator"
                              className="absolute left-0 w-0.5 h-4 bg-gh-success rounded-full shadow-[0_0_8px_rgba(35,134,54,0.5)]"
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
