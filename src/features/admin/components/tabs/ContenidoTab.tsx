'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  HelpCircle, 
  Shield, 
  Phone, 
  Scale,
  ClipboardList,
  Star,
  ArrowRightLeft,
  Calendar,
  Table,
  AlertTriangle,
  Flag,
  CreditCard
} from 'lucide-react'
import { deepEqual, formatBytes } from '@/lib/utils/deepCompare'
import AdminSidebar from '@/features/admin/components/AdminSidebar'
import {
  ResumenContent,
  FAQContent,
  GarantiasContent,
  ContactoContent,
  TerminosContent,
  // Nuevas secciones
  AnalisisRequisitosContent,
  FortalezasContent,
  DinamicoVsEstaticoContent,
  PresupuestoCronogramaContent,
  TablaComparativaContent,
  ObservacionesContent,
  ConclusionContent,
  CuotasContent,
  // Defaults
  defaultAnalisisRequisitos,
  defaultFortalezas,
  defaultDinamicoVsEstatico,
  defaultPresupuestoCronograma,
  defaultTablaComparativa,
  defaultObservaciones,
  defaultConclusion,
  defaultCuotas,
} from '@/features/admin/components/content/contenido'
import type { 
  AnalisisRequisitosData,
  FortalezasData,
  DinamicoVsEstaticoData,
  PresupuestoCronogramaData,
  TablaComparativaData,
  ObservacionesData,
  ConclusionData,
  CuotasData,
} from '@/features/admin/components/content/contenido'
import type { 
  QuotationConfig, 
  ContenidoGeneral, 
  FAQItem, 
  PoliticaCancelacion, 
  ContactoInfo,
  ResumenEjecutivoTextos,
  TerminosCondiciones,
  VisibilidadConfig,
  SeccionesColapsadasConfig 
} from '@/lib/types'

// ==================== VALORES POR DEFECTO ====================
const defaultFAQ: FAQItem[] = [
  { question: '¿Qué es SEO?', answer: 'SEO (Search Engine Optimization) es el proceso de optimizar un sitio web para mejorar su visibilidad en los motores de búsqueda como Google. Esto incluye aspectos técnicos, de contenido y de experiencia del usuario para atraer tráfico orgánico de calidad.' },
  { question: '¿Qué es Meta Pixel?', answer: 'Meta Pixel es una herramienta de análisis proporcionada por Meta (antes Facebook) que permite rastrear las interacciones de los usuarios en un sitio web. Ayuda a medir la efectividad de las campañas publicitarias y a optimizar la orientación de anuncios en plataformas de Meta.' },
  { question: '¿Puedo tener acceso al panel administrativo?', answer: 'No. Solo el proveedor (DGTecnova) tiene acceso. El cliente ve el sitio público. No obstante, puedes acceder con permisos limitados si lo acuerdas.' },
  { question: '¿Cómo solicito cambios?', answer: 'Por email, WhatsApp o una llamada. Describes lo que quieres y nosotros lo realizamos. El horario de atención es de lunes a viernes, 9am-6pm.' },
  { question: '¿Cuánto tarda en realizarse un cambio?', answer: ['Depende del paquete contratado:', '• Constructor: 12 horas', '• Obra Maestra: 8 horas', '• Imperio Digital: 2 horas'] },
  { question: '¿Qué pasa si quiero más cambios de los incluidos?', answer: ['Se debe valorar el impacto y complejidad de los cambios solicitados:', '• Constructor: Cambios extras = $1.5 USD cada uno', '• Obra Maestra: Ilimitados', '• Imperio Digital: Ilimitados'] },
  { question: '¿Puedo vender productos directamente en el sitio?', answer: 'No. El paquete Constructor es solo un catálogo. Los paquetes Obra Maestra e Imperio Digital incluyen un sistema de reservas online.' },
  { question: '¿El sitio funcionará en móvil?', answer: '100% garantizado. Será optimizado para que se vea perfecto en cualquier dispositivo (teléfono, tablet o computadora).' },
  { question: '¿Y si sube el tráfico? ¿El sitio se va a poner lento?', answer: 'No. La infraestructura a emplear escala automáticamente. Aunque tengas 100,000 visitantes/mes, seguirá rápido.' },
  { question: '¿Qué pasa con la información? ¿Es segura?', answer: 'Totalmente. La plataforma a emplear utiliza encriptación SSL 256-bit. Los datos son sagrados.' },
  { question: '¿Puedo transferir el sitio después?', answer: 'Sí, pero con nuestro consentimiento, teniendo en cuenta que se deben realizar acciones de traspasos de accesos a las plataformas.' },
  { question: '¿Incluye posicionamiento en Google?', answer: 'Si, se incluye el posicionamiento técnico, pero el posicionamiento orgánico toma de 3 a 6 meses.' },
  { question: '¿Qué pasa si no pago la gestión mensual?', answer: 'El sitio continúa funcionando, pero no habrá actualizaciones.' },
  { question: '¿Cuánto tiempo lleva ver los resultados?', answer: 'El sitio estará listo entre 4-8 semanas, dependiendo del paquete contratado. Los primeros contactos pueden llegar a los 2-3 días del lanzamiento, aunque el posicionamiento en Google puede demorar 2-3 meses.' },
  { question: '¿Incluye publicidad digital?', answer: 'No, eso es servicio adicional que puedes contratar.' },
  { question: '¿Necesito conocimientos técnicos?', answer: 'No. Nosotros hacemos todo el trabajo técnico. Tú solo te enfocas en tu negocio.' },
  { question: '¿Puedo agregar más servicios después?', answer: ['Sí. Podemos incluir servicios adicionales como:', '• Publicidad digital', '• Diseño gráfico', '• Posicionamiento en Redes sociales', '• Consultoría estratégica', '• Otros servicios digitales (Manual visual, gestión de marca, etc.)', '• Desarrollo de aplicaciones móviles', '• Elaboración de documentos del negocio', 'Estos servicios se cotizan por separado y según el paquete contratado se aplican descuentos por fidelidad del cliente.'] },
  { question: '¿Puedo dejar de pagar después?', answer: 'Sí, pero el sitio se desactivará, teniendo en cuenta que las plataformas que se usan para desplegarlo requieren pagos continuos. Pierdes el dominio y el hosting. Si lo retomas, existe el riesgo de perder totalmente el dominio (dirección web de tu sitio) por indisponibilidad, por haber sido comprado por otro cliente global' },
]

const defaultGarantiasProveedor: string[] = [
  'Mantener el 99.9% de tiempo activo',
  'Seguridad SSL/HTTPS garantizada y gratis',
  'Backups automáticos',
  'Actualizaciones de seguridad',
  'Soporte técnico',
  'Cambios realizados puntualmente',
  'Diseño profesional de tu sitio',
  'Hosting, dominio y correo funcionando',
  'Cumplimiento de normativas legales',
  'Protección de datos y privacidad',
  'Soporte post-lanzamiento',
  'Período de garantía definido (30 a 90 días según paquete)',
]

const defaultResponsabilidadesCliente: string[] = [
  'Pagar las inversiones acordadas a tiempo',
  'Proporcionar contenidos/fotos necesarios',
  'Aprobar diseños y funcionalidades',
  'Usar el sitio legalmente',
  'Notificar si hay problemas',
  'Solicitar cambios dentro del alcance acordado',
  'Mantener la confidencialidad de accesos',
  'No transferir el sitio sin nuestro consentimiento',
  'Cumplir con las políticas de uso',
  'Respetar los términos de servicio',
  'Seguir las recomendaciones de seguridad',
]

const defaultPoliticasCancelacion: PoliticaCancelacion[] = [
  { title: 'Si el cliente cancela los servicios de gestión después del lanzamiento', detail: 'El proveedor puede ofrecer soporte y mantenimiento según lo acordado.' },
  { title: 'Si el cliente cancela antes del lanzamiento', detail: 'Se aplicarán cargos proporcionales según el trabajo realizado hasta la fecha.' },
  { title: 'Si el proveedor cancela el contrato antes del lanzamiento', detail: 'El cliente recibirá un reembolso proporcional por los servicios no prestados.' },
  { title: 'Si hay incumplimiento de términos por cualquiera de las partes', detail: 'Se seguirán los procedimientos acordados.' },
  { title: 'Notificación de cancelación', detail: 'Debe hacerse con al menos 15 días de anticipación.' },
  { title: 'Devolución de materiales', detail: 'El cliente debe devolver cualquier material proporcionado por el proveedor y viceversa.' },
  { title: 'Si el cliente cancela todos los servicios después del lanzamiento', detail: 'El proveedor puede ofrecer un plan de transición para asegurar la continuidad del sitio.' },
]

const defaultIncumplimiento: string[] = [
  'Compensación al cliente por inactividad (descuento de hasta un 40% en el próximo mes)',
  'Corrección inmediata sin costo adicional',
  'Reembolso parcial según el impacto',
  'Revisión de los términos del contrato',
  'Terminación del contrato si persisten incumplimientos',
  'Notificación formal por escrito',
  'Plazo de 15 días para subsanar el incumplimiento',
  'Acceso a soporte prioritario',
  'Informe detallado de acciones correctivas',
  'Garantía extendida en caso de fallos recurrentes',
  'Suspensión temporal del servicio si es necesario',
]

const defaultContacto: ContactoInfo = {
  titulo: 'Información de Contacto',
  subtitulo: 'Estamos aquí para ayudarte',
  whatsapp: '+535 856 9291',
  email: 'dgtecnova@gmail.com',
  telefono: '+535 856 9291',
  direccion: 'Arroyo 203 entre Lindero y Nueva del Pilar',
  ciudad: 'Centro Habana, La Habana',
  pais: 'Cuba',
  horario: 'Cita previa',
  nombreCeo: 'Daniel Treasure Espinosa',
  empresaNombre: 'DGTECNOVA',
  // Metadata de la propuesta
  fechaPropuesta: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
  versionPropuesta: '1.0',
  copyright: '© 2025 DGTECNOVA. Todos los derechos reservados.',
}

const defaultResumenEjecutivo: ResumenEjecutivoTextos = {
  tituloSeccion: 'Presentación del proyecto',
  subtitulo: 'Tu próximo paso hacia el éxito digital',
  parrafoIntroduccion: 'Tenemos el placer de presentar esta propuesta profesional para el desarrollo de tu sitio web corporativo. Luego de analizar detalladamente tus respuestas del cuestionario y las necesidades específicas de tu empresa, ofrecemos una solución dinámica que te permitirá:',
  beneficiosPrincipales: [
    'Mostrar profesionalmente tu catálogo de servicios/productos',
    'Actualizar contenido fácilmente sin necesidad de programador',
    'Posicionarte como empresa confiable en tu sector',
    'Captar clientes a través de WhatsApp, llamadas y contactos',
    'Administrar todo desde un panel intuitivo',
    'Crecer sin limitaciones técnicas',
  ],
  parrafoPaquetes: 'La propuesta está diseñada en 3 paquetes de inversión para que elijas según tus necesidades y presupuesto, todas con calidad profesional garantizada.',
  diferenciasClave: {
    tituloSeccion: 'DIFERENCIAS CLAVES',
    parrafoIntroduccion: 'A diferencia de otras propuestas donde el cliente gestiona su propio sitio, en este caso has solicitado que nosotros nos encargamos de toda la administración y gestión del sitio web. Esto significa que:',
    items: [
      '✅ El cliente accede al panel administrativo con permisos limitados',
      '✅ El cliente puede solicitar cambios vía email, WhatsApp o llamada',
      '✅ El proveedor realiza las actualizaciones y te informa su finalización',
      '✅ El cliente ve el sitio web público para verificar los cambios',
      '✅ Se garantiza máxima seguridad y profesionalismo',
    ],
    parrafoModelo: 'Este modelo es:',
    beneficiosModelo: [
      '🔴 Más seguro',
      '🔴 Ofrece mejor mantenimiento',
      '🟠 Permite mayor flexibilidad',
      '🟠 Asegura actualizaciones constantes',
      '🟡 Facilita la gestión de cambios',
      '🟡 Reduce la carga del cliente',
      '🟢 Mejora la experiencia del usuario final',
      '🟢 Aumenta la satisfacción del cliente',
    ],
  },
  // Responsabilidades del proveedor
  responsabilidadesProveedor: {
    contenido: [
      'Actualizar productos/servicios',
      'Cambiar precios y disponibilidad',
      'Agregar nuevas fotos',
      'Subir videos entregados por el cliente o escogidos',
      'Escribir o publicar artículos de blog',
      'Actualizar información de contacto',
      'Cambiar banners y promociones',
    ],
    tecnico: [
      'Actualizaciones de la plataforma web',
      'Actualizaciones de componentes',
      'Salvas automáticas',
      'Seguridad y monitoreo',
      'Corrección de errores técnicos',
      'Optimización de velocidad',
      'Configuración de SEO para que te encuentren en internet',
    ],
    comunicacion: [
      'Reporte de los cambios realizados cuando no son iniciados por ti',
      'Sugerencias de mejoras',
      'Análisis de tráfico y conversiones',
      'Respondemos en un plazo de 30 minutos hasta 6 horas',
    ],
  },
  // Lo que el cliente NO hace
  clienteNoHace: [
    'Ingresar al panel administrativo, a menos que sea para demostraciones o control de negocios',
    'Instalar complementos',
    'Hacer salvas',
    'Actualizar la plataforma',
    'Preocuparte de la seguridad',
    'Tomar decisiones técnicas',
  ],
  // Flujo de comunicación
  flujoComunicacion: [
    { paso: 1, icono: '👤', titulo: 'Solicitud de un cambio', descripcion: 'Quiero agregar un nuevo servicio con estas fotos', actor: 'cliente' },
    { paso: 2, icono: '📧', titulo: 'Recepción del cambio', descripcion: 'Recibimos el email, WhatsApp o tu llamada y confirmamos', actor: 'proveedor' },
    { paso: 3, icono: '🔧', titulo: 'Acceso al sistema', descripcion: 'Entramos al panel administrativo', actor: 'proveedor' },
    { paso: 4, icono: '✏️', titulo: 'Edición', descripcion: 'Agregamos el servicio, fotos y contenido solicitado por ti', actor: 'proveedor' },
    { paso: 5, icono: '🎯', titulo: 'Optimización SEO', descripcion: 'Optimizamos el contenido para que los buscadores en internet lo encuentren', actor: 'proveedor' },
    { paso: 6, icono: '✅', titulo: 'Notificación', descripcion: 'Te notificamos cuando el trabajo esté listo y publicado', actor: 'proveedor' },
    { paso: 7, icono: '🎉', titulo: 'Cliente verifica', descripcion: 'Vas al sitio actualizado en vivo y confirmas si estás de acuerdo', actor: 'cliente' },
  ],
}

const defaultTerminos: TerminosCondiciones = {
  titulo: 'Términos y Condiciones',
  subtitulo: 'Condiciones generales del servicio',
  parrafos: [
    'Esta propuesta tiene una validez de 30 días a partir de la fecha de emisión.',
    'Los precios están sujetos a cambios sin previo aviso después del período de validez.',
    'El trabajo comenzará una vez recibido el pago inicial acordado.',
  ],
}

// Visibilidad por defecto (todas las secciones visibles)
const defaultVisibilidad: VisibilidadConfig = {
  tituloSeccion: true,
  parrafoIntroduccion: true,
  beneficiosPrincipales: true,
  parrafoPaquetes: true,
  diferenciasClave: true,
  responsabilidadesProveedor: true,
  clienteNoHace: true,
  flujoComunicacion: true,
  faq: true,
  garantiasProveedor: true,
  garantiasCliente: true,
  politicasCancelacion: true,
  siIncumpleProveedor: true,
  contacto: true,
  terminos: true,
}

// ==================== TIPOS ====================
type SeccionActiva = 
  | 'resumen' 
  | 'faq' 
  | 'garantias' 
  | 'contacto' 
  | 'terminos'
  | 'analisis'
  | 'fortalezas'
  | 'dinamico'
  | 'presupuesto'
  | 'cuotas'
  | 'tabla'
  | 'observaciones'
  | 'conclusion'

interface ContenidoTabProps {
  readonly activeSectionId?: string
  readonly cotizacionConfig: QuotationConfig | null
  readonly setCotizacionConfig: React.Dispatch<React.SetStateAction<QuotationConfig | null>>
  readonly onSave: (config: QuotationConfig) => Promise<void>
  readonly onSaveSeccion?: (id: string, seccion: string, datos: unknown, timestamp: string, visibilidad?: Record<string, boolean>) => Promise<void>
  readonly toast: {
    success: (msg: string) => void
    error: (msg: string) => void
    info: (msg: string) => void
    warning: (msg: string) => void
  }
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function ContenidoTab({ 
  activeSectionId,
  cotizacionConfig, 
  setCotizacionConfig,
  onSave,
  onSaveSeccion,
  toast 
}: ContenidoTabProps) {
  const [activeItem, setActiveItem] = useState<SeccionActiva>('resumen')

  const sectionIdToActiveItem = (sectionId?: string): SeccionActiva => {
    const mapping: Record<string, SeccionActiva> = {
      'cont-resumen': 'resumen',
      'cont-analisis': 'analisis',
      'cont-fortale': 'fortalezas',
      'cont-compar': 'dinamico',
      'cont-crono': 'presupuesto',
      'cont-cuotas': 'cuotas',
      'cont-paq': 'tabla',
      'cont-notas': 'observaciones',
      'cont-concl': 'conclusion',
      'cont-faq': 'faq',
      'cont-garant': 'garantias',
      'cont-contact': 'contacto',
      'cont-terminos': 'terminos',
    }
    return (sectionId && mapping[sectionId]) || activeItem
  }

  const effectiveActiveItem = activeSectionId
    ? sectionIdToActiveItem(activeSectionId)
    : activeItem
  
  // Sincronizar estado local con prop del padre
  useEffect(() => {
    if (activeSectionId) {
      const newItem = sectionIdToActiveItem(activeSectionId)
      if (newItem !== activeItem) {
        setActiveItem(newItem)
      }
    }
  }, [activeSectionId, activeItem])
  
  // Ref para almacenar el contenido original al cargar (para comparación)
  // IMPORTANTE: Inicializar de forma SÍNCRONA para evitar flash de "Cambios sin guardar" en primer render
  const getInitialContenido = (): ContenidoGeneral => {
    return JSON.parse(JSON.stringify(cotizacionConfig?.contenidoGeneral || {}))
  }
  const contenidoOriginalRef = useRef<ContenidoGeneral>(getInitialContenido())
  
  // Actualizar el ref cuando cambia de cotización (no en cada render)
  useEffect(() => {
    contenidoOriginalRef.current = JSON.parse(JSON.stringify(cotizacionConfig?.contenidoGeneral || {}))
  }, [cotizacionConfig?.id]) // Solo al cambiar de cotización, NO cuando cambia contenidoGeneral

  // Sidebar items
  const sidebarItems = [
    { id: 'resumen', label: 'Resumen', icon: FileText },
    { id: 'analisis', label: 'Análisis', icon: ClipboardList },
    { id: 'fortalezas', label: 'Fortalezas', icon: Star },
    { id: 'dinamico', label: 'Comparativa', icon: ArrowRightLeft },
    { id: 'presupuesto', label: 'Cronograma', icon: Calendar },
    { id: 'cuotas', label: 'Cuotas', icon: CreditCard },
    { id: 'tabla', label: 'Paquetes', icon: Table },
    { id: 'observaciones', label: 'Notas', icon: AlertTriangle },
    { id: 'conclusion', label: 'Conclusión', icon: Flag },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'garantias', label: 'Garantías', icon: Shield },
    { id: 'contacto', label: 'Contacto', icon: Phone },
    { id: 'terminos', label: 'Términos', icon: Scale },
  ] as const

  // Obtener contenido actual o usar defaults
  const contenido = cotizacionConfig?.contenidoGeneral || {}
  const resumenActual: ResumenEjecutivoTextos = contenido.textos?.resumenEjecutivo || defaultResumenEjecutivo
  const faqActual: FAQItem[] = contenido.faq || defaultFAQ
  const faqTituloSubtituloActual = contenido.faqTituloSubtitulo || { titulo: 'Preguntas Frecuentes', subtitulo: '' }
  const garantiasActual = contenido.garantias || {
    proveedorGarantiza: defaultGarantiasProveedor,
    clienteResponsable: defaultResponsabilidadesCliente,
    politicasCancelacion: defaultPoliticasCancelacion,
    siIncumpleProveedor: defaultIncumplimiento,
  }
  const garantiasTituloSubtituloActual = contenido.garantiasTituloSubtitulo || { titulo: 'Garantías y Responsabilidades', subtitulo: 'Nuestro compromiso con su proyecto' }
  const contactoActual: ContactoInfo = contenido.contacto || defaultContacto
  const terminosActual: TerminosCondiciones = contenido.terminos || defaultTerminos
  const visibilidadActual: VisibilidadConfig = { ...defaultVisibilidad, ...contenido.visibilidad }
  
  // ==================== ESTADO DE SECCIONES COLAPSABLES ====================
  // Defaults para las secciones colapsables (true = expandido, false = colapsado)
  const defaultSeccionesColapsadas: SeccionesColapsadasConfig = {
    resumen_diferencias: true,
    resumen_responsabilidades: false,
    resumen_clienteNoHace: false,
    resumen_flujo: false,
    fortalezas_fortalezas: true,
    fortalezas_resumen: false,
    dinamico_estatico: true,
    dinamico_dinamico: true,
    presupuesto_presupuesto: true,
    presupuesto_paquetesDinamicos: true,
    presupuesto_cronograma: false,
    tabla_paquetes: true,
    tabla_categorias: false,
    observaciones_puntosAtencion: true,
    observaciones_recomendaciones: false,
  }
  
  // Estado de secciones colapsables (se carga desde BD)
  const seccionesColapsadasActual: SeccionesColapsadasConfig = {
    ...defaultSeccionesColapsadas,
    ...contenido.seccionesColapsadas,
  }
  
  // Handler para actualizar estado de sección colapsable
  const updateSeccionColapsada = (key: string, isExpanded: boolean) => {
    if (!cotizacionConfig) return
    
    console.log('[DEBUG] updateSeccionColapsada:', { key, isExpanded })
    console.log('[DEBUG] contenido actual:', contenido)
    console.log('[DEBUG] seccionesColapsadasActual:', seccionesColapsadasActual)
    
    const nuevoContenido: ContenidoGeneral = {
      ...contenido,
      seccionesColapsadas: {
        ...seccionesColapsadasActual,
        [key]: isExpanded,
      },
    }
    
    console.log('[DEBUG] nuevoContenido:', nuevoContenido)
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: nuevoContenido,
    })
  }

  // Nuevas secciones de contenido (ahora tipadas correctamente)
  const analisisActual: AnalisisRequisitosData = (contenido.analisisRequisitos as AnalisisRequisitosData) || defaultAnalisisRequisitos
  const fortalezasActual: FortalezasData = (contenido.fortalezas as FortalezasData) || defaultFortalezas
  const dinamicoActual: DinamicoVsEstaticoData = (contenido.dinamicoVsEstatico as DinamicoVsEstaticoData) || defaultDinamicoVsEstatico
  // Merge profundo para presupuesto para asegurar que todos los subcampos existan
  const presupuestoFromDB = contenido.presupuestoCronograma as PresupuestoCronogramaData | undefined
  const presupuestoActual: PresupuestoCronogramaData = presupuestoFromDB ? {
    ...defaultPresupuestoCronograma,
    ...presupuestoFromDB,
    presupuesto: { ...defaultPresupuestoCronograma.presupuesto, ...presupuestoFromDB.presupuesto },
    cronograma: { ...defaultPresupuestoCronograma.cronograma, ...presupuestoFromDB.cronograma },
  } : defaultPresupuestoCronograma
  const tablaActual: TablaComparativaData = (contenido.tablaComparativa as TablaComparativaData) || defaultTablaComparativa
  const observacionesActual: ObservacionesData = (contenido.observaciones as ObservacionesData) || defaultObservaciones
  const conclusionActual: ConclusionData = (contenido.conclusion as ConclusionData) || defaultConclusion
  // Cuotas (nuevo)
  const cuotasFromDB = contenido.cuotas as CuotasData | undefined
  const cuotasActual: CuotasData = cuotasFromDB ? {
    ...defaultCuotas,
    ...cuotasFromDB,
    metodosPago: { ...defaultCuotas.metodosPago, ...cuotasFromDB.metodosPago },
    presupuesto: { ...defaultCuotas.presupuesto, ...cuotasFromDB.presupuesto },
  } : defaultCuotas

  // Visibilidad de nuevas secciones (ahora tipadas correctamente)
  const visibilidadExtendida = {
    ...visibilidadActual,
    resumenEjecutivo: visibilidadActual.tituloSeccion !== false, // Toggle global para resumen
    garantias: visibilidadActual.garantiasProveedor !== false, // Toggle global para garantías
    analisisRequisitos: contenido.visibilidadAnalisis !== false,
    fortalezas: contenido.visibilidadFortalezas !== false,
    dinamicoVsEstatico: contenido.visibilidadDinamico !== false,
    presupuestoCronograma: contenido.visibilidadPresupuesto !== false,
    cuotas: contenido.visibilidadCuotas !== false,
    tablaComparativa: contenido.visibilidadTabla !== false,
    observaciones: contenido.visibilidadObservaciones !== false,
    conclusion: contenido.visibilidadConclusion !== false,
  }

  // Handler para actualizar contenido
  const updateContenido = (path: string, value: unknown) => {
    if (!cotizacionConfig) return
    
    const nuevoContenido: ContenidoGeneral = { ...contenido }
    
    switch (path) {
      case 'resumen':
        nuevoContenido.textos = { ...nuevoContenido.textos, resumenEjecutivo: value as ResumenEjecutivoTextos }
        break
      case 'faq':
        nuevoContenido.faq = value as FAQItem[]
        break
      case 'faqTituloSubtitulo':
        nuevoContenido.faqTituloSubtitulo = value as { titulo: string; subtitulo: string }
        break
      case 'garantias.proveedorGarantiza':
        nuevoContenido.garantias = { ...garantiasActual, proveedorGarantiza: value as string[] }
        break
      case 'garantias.clienteResponsable':
        nuevoContenido.garantias = { ...garantiasActual, clienteResponsable: value as string[] }
        break
      case 'garantias.politicasCancelacion':
        nuevoContenido.garantias = { ...garantiasActual, politicasCancelacion: value as PoliticaCancelacion[] }
        break
      case 'garantias.siIncumpleProveedor':
        nuevoContenido.garantias = { ...garantiasActual, siIncumpleProveedor: value as string[] }
        break
      case 'garantiasTituloSubtitulo':
        nuevoContenido.garantiasTituloSubtitulo = value as { titulo: string; subtitulo: string }
        break
      case 'contacto':
        nuevoContenido.contacto = value as ContactoInfo
        break
      case 'terminos':
        nuevoContenido.terminos = value as TerminosCondiciones
        break
      // Nuevas secciones (ahora tipadas correctamente)
      case 'analisisRequisitos':
        nuevoContenido.analisisRequisitos = value as AnalisisRequisitosData
        break
      case 'fortalezas':
        nuevoContenido.fortalezas = value as FortalezasData
        break
      case 'dinamicoVsEstatico':
        nuevoContenido.dinamicoVsEstatico = value as DinamicoVsEstaticoData
        break
      case 'presupuestoCronograma':
        nuevoContenido.presupuestoCronograma = value as PresupuestoCronogramaData
        break
      case 'cuotas':
        nuevoContenido.cuotas = value as CuotasData
        break
      case 'tablaComparativa':
        nuevoContenido.tablaComparativa = value as TablaComparativaData
        break
      case 'observaciones':
        nuevoContenido.observaciones = value as ObservacionesData
        break
      case 'conclusion':
        nuevoContenido.conclusion = value as ConclusionData
        break
    }
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: nuevoContenido
    })
  }

  // Handler para actualizar visibilidad de nuevas secciones
  const updateVisibilidadExtendida = (key: string, value: boolean) => {
    if (!cotizacionConfig) return
    
    const nuevoContenido: ContenidoGeneral = { ...contenido }
    
    // Usar switch para mapeo tipado
    switch (key) {
      case 'analisisRequisitos':
        nuevoContenido.visibilidadAnalisis = value
        break
      case 'fortalezas':
        nuevoContenido.visibilidadFortalezas = value
        break
      case 'dinamicoVsEstatico':
        nuevoContenido.visibilidadDinamico = value
        break
      case 'presupuestoCronograma':
        nuevoContenido.visibilidadPresupuesto = value
        break
      case 'cuotas':
        nuevoContenido.visibilidadCuotas = value
        break
      case 'tablaComparativa':
        nuevoContenido.visibilidadTabla = value
        break
      case 'observaciones':
        nuevoContenido.visibilidadObservaciones = value
        break
      case 'conclusion':
        nuevoContenido.visibilidadConclusion = value
        break
    }
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: nuevoContenido
    })
  }

  // Handler para actualizar visibilidad
  const updateVisibilidad = (key: keyof VisibilidadConfig, value: boolean) => {
    if (!cotizacionConfig) return
    
    const nuevoContenido: ContenidoGeneral = { 
      ...contenido,
      visibilidad: {
        ...visibilidadActual,
        [key]: value
      }
    }
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: nuevoContenido
    })
  }

  // ==================== HELPERS PARA GUARDADO AISLADO POR SECCIÓN ====================
  
  // Helper para obtener los datos actuales de una sección específica
  const getDatosSeccion = (seccion: SeccionActiva): unknown => {
    switch (seccion) {
      case 'resumen': return resumenActual
      case 'faq': return faqActual
      case 'garantias': return garantiasActual
      case 'contacto': return contactoActual
      case 'terminos': return terminosActual
      case 'analisis': return analisisActual
      case 'fortalezas': return fortalezasActual
      case 'dinamico': return dinamicoActual
      case 'presupuesto': return presupuestoActual
      case 'cuotas': return cuotasActual
      case 'tabla': return tablaActual
      case 'observaciones': return observacionesActual
      case 'conclusion': return conclusionActual
      default: return null
    }
  }

  // Helper para obtener la visibilidad relevante de una sección
  const getVisibilidadSeccion = (seccion: SeccionActiva): Record<string, boolean> | null => {
    switch (seccion) {
      case 'resumen': 
        return {
          tituloSeccion: visibilidadActual.tituloSeccion !== false,
          parrafoIntroduccion: visibilidadActual.parrafoIntroduccion !== false,
          beneficiosPrincipales: visibilidadActual.beneficiosPrincipales !== false,
          parrafoPaquetes: visibilidadActual.parrafoPaquetes !== false,
          diferenciasClave: visibilidadActual.diferenciasClave !== false,
          responsabilidadesProveedor: visibilidadActual.responsabilidadesProveedor !== false,
          clienteNoHace: visibilidadActual.clienteNoHace !== false,
          flujoComunicacion: visibilidadActual.flujoComunicacion !== false,
        }
      case 'faq': 
        return { faq: visibilidadActual.faq !== false }
      case 'garantias': 
        return {
          garantiasProveedor: visibilidadActual.garantiasProveedor !== false,
          garantiasCliente: visibilidadActual.garantiasCliente !== false,
          politicasCancelacion: visibilidadActual.politicasCancelacion !== false,
          siIncumpleProveedor: visibilidadActual.siIncumpleProveedor !== false,
        }
      case 'contacto': 
        return { contacto: visibilidadActual.contacto !== false }
      case 'terminos': 
        return { terminos: visibilidadActual.terminos !== false }
      // Nuevas secciones - guardar como campos separados en contenidoGeneral
      case 'analisis':
        return { visibilidadAnalisis: visibilidadExtendida.analisisRequisitos }
      case 'fortalezas':
        return { visibilidadFortalezas: visibilidadExtendida.fortalezas }
      case 'dinamico':
        return { visibilidadDinamico: visibilidadExtendida.dinamicoVsEstatico }
      case 'presupuesto':
        return { visibilidadPresupuesto: visibilidadExtendida.presupuestoCronograma }
      case 'cuotas':
        return { visibilidadCuotas: visibilidadExtendida.cuotas }
      case 'tabla':
        return { visibilidadTabla: visibilidadExtendida.tablaComparativa }
      case 'observaciones':
        return { visibilidadObservaciones: visibilidadExtendida.observaciones }
      case 'conclusion':
        return { visibilidadConclusion: visibilidadExtendida.conclusion }
      default: return null
    }
  }

  // Helper para obtener los datos originales de una sección (desde BD)
  const getDatosOriginales = (seccion: SeccionActiva): unknown => {
    const original = contenidoOriginalRef.current
    // El ref siempre tiene un valor (al menos {} vacío), nunca null
    
    switch (seccion) {
      case 'resumen': return original.textos?.resumenEjecutivo || defaultResumenEjecutivo
      case 'faq': return original.faq || defaultFAQ
      case 'garantias': return original.garantias || {
        proveedorGarantiza: defaultGarantiasProveedor,
        clienteResponsable: defaultResponsabilidadesCliente,
        politicasCancelacion: defaultPoliticasCancelacion,
        siIncumpleProveedor: defaultIncumplimiento,
      }
      case 'contacto': return original.contacto || defaultContacto
      case 'terminos': return original.terminos || defaultTerminos
      case 'analisis': return original.analisisRequisitos || defaultAnalisisRequisitos
      case 'fortalezas': return original.fortalezas || defaultFortalezas
      case 'dinamico': return original.dinamicoVsEstatico || defaultDinamicoVsEstatico
      case 'presupuesto': return original.presupuestoCronograma || defaultPresupuestoCronograma
      case 'cuotas': return original.cuotas || defaultCuotas
      case 'tabla': return original.tablaComparativa || defaultTablaComparativa
      case 'observaciones': return original.observaciones || defaultObservaciones
      case 'conclusion': return original.conclusion || defaultConclusion
      default: return null
    }
  }

  // Helper para verificar si una sección tiene cambios pendientes (datos o visibilidad)
  const hasChangesForSection = (seccion: SeccionActiva): boolean => {
    const datosActuales = getDatosSeccion(seccion)
    const datosOriginales = getDatosOriginales(seccion)
    const hayCambiosDatos = !deepEqual(datosActuales, datosOriginales)
    
    // Verificar cambios de visibilidad
    const visibilidadSeccion = getVisibilidadSeccion(seccion)
    if (!visibilidadSeccion) return hayCambiosDatos
    
    // Para secciones antiguas: comparar con contenidoOriginalRef.visibilidad
    // Para secciones nuevas: comparar con contenidoOriginalRef.visibilidadXxx directamente
    const camposDirectos = ['visibilidadAnalisis', 'visibilidadFortalezas', 'visibilidadDinamico',
      'visibilidadPresupuesto', 'visibilidadCuotas', 'visibilidadTabla', 'visibilidadObservaciones', 'visibilidadConclusion']
    
    let hayCambiosVisibilidad = false
    const claves = Object.keys(visibilidadSeccion)
    const esSeccionNueva = claves.some(k => camposDirectos.includes(k))
    
    if (esSeccionNueva) {
      // Comparar con el campo directo en contenidoOriginalRef
      const campoDirecto = claves[0] as keyof ContenidoGeneral // Solo hay un campo
      const valorActual = visibilidadSeccion[campoDirecto]
      const valorOriginal = (contenidoOriginalRef.current as unknown as Record<string, unknown>)?.[campoDirecto] !== false
      hayCambiosVisibilidad = valorActual !== valorOriginal
    } else {
      // Sección antigua: comparar con .visibilidad anidada
      const visibilidadOriginal = contenidoOriginalRef.current?.visibilidad || {}
      hayCambiosVisibilidad = !deepEqual(visibilidadSeccion, 
        Object.fromEntries(
          Object.keys(visibilidadSeccion).map(k => [k, visibilidadOriginal[k as keyof typeof visibilidadOriginal] !== false])
        )
      )
    }
    
    return hayCambiosDatos || hayCambiosVisibilidad
  }

  // Estado de guardando por sección (para feedback visual independiente)
  const [guardandoSeccion, setGuardandoSeccion] = useState<SeccionActiva | null>(null)

  // Handler para guardar una sección específica (aislado)
  const handleGuardarSeccion = async (seccion: SeccionActiva) => {
    if (!cotizacionConfig) return
    
    const datosActuales = getDatosSeccion(seccion)
    const visibilidadSeccion = getVisibilidadSeccion(seccion)
    
    // Para secciones antiguas, siempre guardar (pueden tener cambios de visibilidad)
    // Para nuevas secciones, verificar cambios en datos
    const datosOriginales = getDatosOriginales(seccion)
    const hayCambiosDatos = !deepEqual(datosActuales, datosOriginales)
    
    // Identificar si es sección nueva (usa campos directos de visibilidad)
    const camposDirectos = ['visibilidadAnalisis', 'visibilidadFortalezas', 'visibilidadDinamico',
      'visibilidadPresupuesto', 'visibilidadCuotas', 'visibilidadTabla', 'visibilidadObservaciones', 'visibilidadConclusion']
    const esSeccionNueva = visibilidadSeccion && Object.keys(visibilidadSeccion).some(k => camposDirectos.includes(k))
    
    // Verificar si hay cambios de visibilidad
    let hayCambiosVisibilidad = false
    if (visibilidadSeccion) {
      const claves = Object.keys(visibilidadSeccion)
      if (esSeccionNueva) {
        // Comparar con el campo directo en contenidoOriginalRef
        const campoDirecto = claves[0] as keyof ContenidoGeneral
        const valorActual = visibilidadSeccion[campoDirecto]
        const valorOriginal = (contenidoOriginalRef.current as unknown as Record<string, unknown>)?.[campoDirecto] !== false
        hayCambiosVisibilidad = valorActual !== valorOriginal
      } else {
        // Sección antigua: comparar con .visibilidad anidada
        const visibilidadOriginal = contenidoOriginalRef.current?.visibilidad || {}
        hayCambiosVisibilidad = !deepEqual(visibilidadSeccion, 
          Object.fromEntries(
            Object.keys(visibilidadSeccion).map(k => [k, visibilidadOriginal[k as keyof typeof visibilidadOriginal] !== false])
          )
        )
      }
    }
    
    if (!hayCambiosDatos && !hayCambiosVisibilidad) {
      toast.info('ℹ️ No hay cambios que guardar')
      return
    }
    
    setGuardandoSeccion(seccion)
    const now = new Date().toISOString()
    
    // Log de optimización
    const payloadSize = formatBytes(JSON.stringify(datosActuales).length)
    console.log(`[GUARDADO AISLADO] Sección "${seccion}" (${payloadSize})${hayCambiosVisibilidad ? ' + visibilidad' : ''}`)
    
    try {
      // Usar el método optimizado de guardado por sección
      if (onSaveSeccion && cotizacionConfig.id) {
        // Enviar visibilidad solo si hay cambios de visibilidad
        await onSaveSeccion(cotizacionConfig.id, seccion, datosActuales, now, hayCambiosVisibilidad ? visibilidadSeccion ?? undefined : undefined)
        
        // Actualizar estado local con el timestamp y visibilidad
        const currentTimestamps = cotizacionConfig.contenidoGeneral?.updatedTimestamps || {}
        
        // Preparar actualizaciones de visibilidad según el tipo de sección
        let visibilidadUpdates = {}
        if (hayCambiosVisibilidad && visibilidadSeccion) {
          if (esSeccionNueva) {
            // Nuevas secciones: usar campos directos
            visibilidadUpdates = visibilidadSeccion
          } else {
            // Secciones antiguas: anidar en .visibilidad
            visibilidadUpdates = {
              visibilidad: {
                ...cotizacionConfig.contenidoGeneral?.visibilidad,
                ...visibilidadSeccion,
              }
            }
          }
        }
        
        const updatedConfig = {
          ...cotizacionConfig,
          contenidoGeneral: {
            ...cotizacionConfig.contenidoGeneral,
            updatedTimestamps: {
              ...currentTimestamps,
              [seccion]: now,
            },
            ...visibilidadUpdates,
          },
        }
        setCotizacionConfig(updatedConfig)
        
        // Actualizar SOLO la sección guardada en el ref de contenido original
        if (contenidoOriginalRef.current) {
          const updatedOriginal = { ...contenidoOriginalRef.current }
          // Actualizar visibilidad en el ref según tipo de sección
          if (hayCambiosVisibilidad && visibilidadSeccion) {
            if (esSeccionNueva) {
              // Nuevas secciones: copiar campos directos
              Object.assign(updatedOriginal, visibilidadSeccion)
            } else {
              // Secciones antiguas: anidar
              updatedOriginal.visibilidad = {
                ...updatedOriginal.visibilidad,
                ...visibilidadSeccion,
              }
            }
          }
          switch (seccion) {
            case 'resumen':
              updatedOriginal.textos = { ...updatedOriginal.textos, resumenEjecutivo: JSON.parse(JSON.stringify(datosActuales)) }
              break
            case 'faq':
              updatedOriginal.faq = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'garantias':
              updatedOriginal.garantias = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'contacto':
              updatedOriginal.contacto = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'terminos':
              updatedOriginal.terminos = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'analisis':
              updatedOriginal.analisisRequisitos = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'fortalezas':
              updatedOriginal.fortalezas = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'dinamico':
              updatedOriginal.dinamicoVsEstatico = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'presupuesto':
              updatedOriginal.presupuestoCronograma = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'cuotas':
              updatedOriginal.cuotas = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'tabla':
              updatedOriginal.tablaComparativa = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'observaciones':
              updatedOriginal.observaciones = JSON.parse(JSON.stringify(datosActuales))
              break
            case 'conclusion':
              updatedOriginal.conclusion = JSON.parse(JSON.stringify(datosActuales))
              break
          }
          updatedOriginal.updatedTimestamps = { ...currentTimestamps, [seccion]: now }
          contenidoOriginalRef.current = updatedOriginal
        }
        
        toast.success(`✓ ${seccion.charAt(0).toUpperCase() + seccion.slice(1)} guardado`)
      } else {
        // Fallback al método antiguo (envía todo el config)
        console.warn('[FALLBACK] Usando método de guardado completo')
        const currentTimestamps = cotizacionConfig.contenidoGeneral?.updatedTimestamps || {}
        const updatedConfig = {
          ...cotizacionConfig,
          contenidoGeneral: {
            ...cotizacionConfig.contenidoGeneral,
            updatedTimestamps: {
              ...currentTimestamps,
              [seccion]: now,
            },
          },
        }
        await onSave(updatedConfig)
        setCotizacionConfig(updatedConfig)
        toast.success('✓ Contenido guardado')
      }
    } catch {
      toast.error('Error al guardar contenido')
    } finally {
      setGuardandoSeccion(null)
    }
  }

  // Handler para descartar cambios de una sección específica (vuelve al original de BD)
  const handleDescartarSeccion = (seccion: SeccionActiva) => {
    if (!cotizacionConfig) return
    
    const datosOriginales = getDatosOriginales(seccion)
    if (!datosOriginales) {
      toast.warning('No hay datos originales para restaurar')
      return
    }
    
    const nuevoContenido: ContenidoGeneral = { ...contenido }
    
    switch (seccion) {
      case 'resumen':
        nuevoContenido.textos = { ...nuevoContenido.textos, resumenEjecutivo: JSON.parse(JSON.stringify(datosOriginales)) }
        break
      case 'faq':
        nuevoContenido.faq = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'garantias':
        nuevoContenido.garantias = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'contacto':
        nuevoContenido.contacto = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'terminos':
        nuevoContenido.terminos = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'analisis':
        (nuevoContenido as Record<string, unknown>).analisisRequisitos = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'fortalezas':
        (nuevoContenido as Record<string, unknown>).fortalezas = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'dinamico':
        (nuevoContenido as Record<string, unknown>).dinamicoVsEstatico = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'presupuesto':
        (nuevoContenido as Record<string, unknown>).presupuestoCronograma = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'cuotas':
        (nuevoContenido as Record<string, unknown>).cuotas = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'tabla':
        (nuevoContenido as Record<string, unknown>).tablaComparativa = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'observaciones':
        (nuevoContenido as Record<string, unknown>).observaciones = JSON.parse(JSON.stringify(datosOriginales))
        break
      case 'conclusion':
        (nuevoContenido as Record<string, unknown>).conclusion = JSON.parse(JSON.stringify(datosOriginales))
        break
    }
    
    setCotizacionConfig({
      ...cotizacionConfig,
      contenidoGeneral: nuevoContenido
    })
    
    toast.info('🔄 Cambios descartados')
  }

  // Mantener compatibilidad con props existentes (usa la sección activa)
  const handleGuardar = () => handleGuardarSeccion(activeItem)
  const handleResetSeccion = () => handleDescartarSeccion(activeItem)

  // Estado vacío
  if (!cotizacionConfig) {
    return (
      <div className="pl-2 pr-6 py-6 flex items-center justify-center h-64">
        <div className="text-center max-w-md mx-auto">
          <FileText className="mx-auto text-4xl text-gh-text-muted mb-4" />
          <p className="text-gh-text-muted text-sm">Selecciona o crea una cotización para editar su contenido</p>
        </div>
      </div>
    )
  }

  // Obtener timestamps de cada sección (se guardan en contenidoGeneral.updatedTimestamps)
  const timestamps = contenido.updatedTimestamps || {}

  return (
    <div className="flex bg-transparent border border-white/10 rounded-xl overflow-hidden">
      <AdminSidebar
        items={sidebarItems.map(i => ({ id: i.id, label: i.label, icon: i.icon }))}
        activeItem={activeItem}
        onItemClick={(id) => setActiveItem(id as SeccionActiva)}
        title="Contenido"
        titleIcon={FileText}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {/* RESUMEN EJECUTIVO */}
          {effectiveActiveItem === 'resumen' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ResumenContent
                data={resumenActual}
                onChange={(data) => updateContenido('resumen', data)}
                visibilidad={visibilidadActual}
                onVisibilidadChange={updateVisibilidad}
                visible={visibilidadExtendida.resumenEjecutivo}
                onVisibleChange={(v) => updateVisibilidad('tituloSeccion', v)}
                updatedAt={timestamps.resumen}
                onGuardar={() => handleGuardarSeccion('resumen')}
                onReset={() => handleDescartarSeccion('resumen')}
                guardando={guardandoSeccion === 'resumen'}
                hasChanges={hasChangesForSection('resumen')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* FAQ */}
          {effectiveActiveItem === 'faq' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FAQContent
                data={faqActual}
                onChange={(data) => updateContenido('faq', data)}
                visible={visibilidadActual.faq !== false}
                onVisibleChange={(v) => updateVisibilidad('faq', v)}
                tituloSubtitulo={faqTituloSubtituloActual}
                onTituloSubtituloChange={(field, value) => updateContenido('faqTituloSubtitulo', { ...faqTituloSubtituloActual, [field]: value })}
                updatedAt={timestamps.faq}
                onGuardar={() => handleGuardarSeccion('faq')}
                onReset={() => handleDescartarSeccion('faq')}
                guardando={guardandoSeccion === 'faq'}
                hasChanges={hasChangesForSection('faq')}
              />
            </motion.div>
          )}

          {/* GARANTÍAS */}
          {effectiveActiveItem === 'garantias' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <GarantiasContent
                proveedorGarantiza={garantiasActual.proveedorGarantiza}
                clienteResponsable={garantiasActual.clienteResponsable}
                politicasCancelacion={garantiasActual.politicasCancelacion}
                siIncumpleProveedor={garantiasActual.siIncumpleProveedor}
                onChange={(field, data) => updateContenido(`garantias.${field}`, data)}
                visibilidad={visibilidadActual}
                onVisibilidadChange={updateVisibilidad}
                visible={visibilidadExtendida.garantias}
                onVisibleChange={(v) => updateVisibilidad('garantiasProveedor', v)}
                tituloSubtitulo={garantiasTituloSubtituloActual}
                onTituloSubtituloChange={(field, value) => updateContenido('garantiasTituloSubtitulo', { ...garantiasTituloSubtituloActual, [field]: value })}
                updatedAt={timestamps.garantias}
                onGuardar={() => handleGuardarSeccion('garantias')}
                onReset={() => handleDescartarSeccion('garantias')}
                guardando={guardandoSeccion === 'garantias'}
                hasChanges={hasChangesForSection('garantias')}
              />
            </motion.div>
          )}

          {/* CONTACTO */}
          {effectiveActiveItem === 'contacto' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ContactoContent
                data={contactoActual}
                onChange={(data) => updateContenido('contacto', data)}
                visible={visibilidadActual.contacto !== false}
                onVisibleChange={(v) => updateVisibilidad('contacto', v)}
                updatedAt={timestamps.contacto}
                onGuardar={() => handleGuardarSeccion('contacto')}
                onReset={() => handleDescartarSeccion('contacto')}
                guardando={guardandoSeccion === 'contacto'}
                hasChanges={hasChangesForSection('contacto')}
              />
            </motion.div>
          )}

          {/* TÉRMINOS */}
          {effectiveActiveItem === 'terminos' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TerminosContent
                data={terminosActual}
                onChange={(data) => updateContenido('terminos', data)}
                visible={visibilidadActual.terminos !== false}
                onVisibleChange={(v) => updateVisibilidad('terminos', v)}
                updatedAt={timestamps.terminos}
                onGuardar={() => handleGuardarSeccion('terminos')}
                onReset={() => handleDescartarSeccion('terminos')}
                guardando={guardandoSeccion === 'terminos'}
                hasChanges={hasChangesForSection('terminos')}
              />
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* NUEVAS SECCIONES */}
          {/* ═══════════════════════════════════════════════════════════════ */}

          {/* ANÁLISIS DE REQUISITOS */}
          {effectiveActiveItem === 'analisis' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnalisisRequisitosContent
                data={analisisActual}
                onChange={(data) => updateContenido('analisisRequisitos', data)}
                visible={visibilidadExtendida.analisisRequisitos}
                onVisibleChange={(v) => updateVisibilidadExtendida('analisisRequisitos', v)}
                updatedAt={timestamps.analisis}
                onGuardar={() => handleGuardarSeccion('analisis')}
                onReset={() => handleDescartarSeccion('analisis')}
                guardando={guardandoSeccion === 'analisis'}
                hasChanges={hasChangesForSection('analisis')}
              />
            </motion.div>
          )}

          {/* FORTALEZAS */}
          {effectiveActiveItem === 'fortalezas' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <FortalezasContent
                data={fortalezasActual}
                onChange={(data) => updateContenido('fortalezas', data)}
                visible={visibilidadExtendida.fortalezas}
                onVisibleChange={(v) => updateVisibilidadExtendida('fortalezas', v)}
                updatedAt={timestamps.fortalezas}
                onGuardar={() => handleGuardarSeccion('fortalezas')}
                onReset={() => handleDescartarSeccion('fortalezas')}
                guardando={guardandoSeccion === 'fortalezas'}
                hasChanges={hasChangesForSection('fortalezas')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* DINÁMICO VS ESTÁTICO */}
          {effectiveActiveItem === 'dinamico' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DinamicoVsEstaticoContent
                data={dinamicoActual}
                onChange={(data) => updateContenido('dinamicoVsEstatico', data)}
                visible={visibilidadExtendida.dinamicoVsEstatico}
                onVisibleChange={(v) => updateVisibilidadExtendida('dinamicoVsEstatico', v)}
                updatedAt={timestamps.dinamico}
                onGuardar={() => handleGuardarSeccion('dinamico')}
                onReset={() => handleDescartarSeccion('dinamico')}
                guardando={guardandoSeccion === 'dinamico'}
                hasChanges={hasChangesForSection('dinamico')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* PRESUPUESTO Y CRONOGRAMA */}
          {effectiveActiveItem === 'presupuesto' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PresupuestoCronogramaContent
                data={presupuestoActual}
                onChange={(data) => updateContenido('presupuestoCronograma', data)}
                visible={visibilidadExtendida.presupuestoCronograma}
                onVisibleChange={(v) => updateVisibilidadExtendida('presupuestoCronograma', v)}
                updatedAt={timestamps.presupuesto}
                onGuardar={() => handleGuardarSeccion('presupuesto')}
                onReset={() => handleDescartarSeccion('presupuesto')}
                guardando={guardandoSeccion === 'presupuesto'}
                hasChanges={hasChangesForSection('presupuesto')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* CUOTAS Y PAGOS */}
          {effectiveActiveItem === 'cuotas' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CuotasContent
                data={cuotasActual}
                onChange={(data) => updateContenido('cuotas', data)}
                visible={visibilidadExtendida.cuotas}
                onVisibleChange={(v) => updateVisibilidadExtendida('cuotas', v)}
                updatedAt={timestamps.cuotas}
                onGuardar={() => handleGuardarSeccion('cuotas')}
                onReset={() => handleDescartarSeccion('cuotas')}
                guardando={guardandoSeccion === 'cuotas'}
                hasChanges={hasChangesForSection('cuotas')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* TABLA COMPARATIVA */}
          {effectiveActiveItem === 'tabla' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TablaComparativaContent
                data={tablaActual}
                onChange={(data) => updateContenido('tablaComparativa', data)}
                visible={visibilidadExtendida.tablaComparativa}
                onVisibleChange={(v) => updateVisibilidadExtendida('tablaComparativa', v)}
                updatedAt={timestamps.tabla}
                onGuardar={() => handleGuardarSeccion('tabla')}
                onReset={() => handleDescartarSeccion('tabla')}
                guardando={guardandoSeccion === 'tabla'}
                hasChanges={hasChangesForSection('tabla')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* OBSERVACIONES */}
          {effectiveActiveItem === 'observaciones' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ObservacionesContent
                data={observacionesActual}
                onChange={(data) => updateContenido('observaciones', data)}
                visible={visibilidadExtendida.observaciones}
                onVisibleChange={(v) => updateVisibilidadExtendida('observaciones', v)}
                updatedAt={timestamps.observaciones}
                onGuardar={() => handleGuardarSeccion('observaciones')}
                onReset={() => handleDescartarSeccion('observaciones')}
                guardando={guardandoSeccion === 'observaciones'}
                hasChanges={hasChangesForSection('observaciones')}
                seccionesColapsadas={seccionesColapsadasActual}
                onSeccionColapsadaChange={updateSeccionColapsada}
              />
            </motion.div>
          )}

          {/* CONCLUSIÓN */}
          {effectiveActiveItem === 'conclusion' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ConclusionContent
                data={conclusionActual}
                onChange={(data) => updateContenido('conclusion', data)}
                visible={visibilidadExtendida.conclusion}
                onVisibleChange={(v) => updateVisibilidadExtendida('conclusion', v)}
                updatedAt={timestamps.conclusion}
                onGuardar={() => handleGuardarSeccion('conclusion')}
                onReset={() => handleDescartarSeccion('conclusion')}
                guardando={guardandoSeccion === 'conclusion'}
                hasChanges={hasChangesForSection('conclusion')}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}



