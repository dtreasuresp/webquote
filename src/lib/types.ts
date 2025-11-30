// Tipos compartidos para el administrador y otras páginas

// ==================== TIPOS DE COLORES CORPORATIVOS ====================
/** Item de color corporativo con jerarquía */
export interface ColorCorporativo {
  nombre: string
  hex: string
}

/** Roles de colores según posición en el array */
export type ColorRole = 'primary' | 'secondary' | 'tertiary' | 'alternate'

export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual' // Default: 'mensual'
}

export interface GestionConfig {
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface OpcionPago {
  nombre: string
  porcentaje: number
  descripcion: string
}

export interface DescuentoServicio {
  servicioId: string
  aplicarDescuento: boolean
  porcentajeDescuento: number
}

// ==================== NUEVO SISTEMA DE DESCUENTOS ====================

/** Tipos de descuento mutuamente excluyentes */
export type TipoDescuento = 'ninguno' | 'granular' | 'general'

/** Configuración de descuento general (aplica % uniforme a categorías) */
export interface DescuentoGeneral {
  porcentaje: number
  aplicarA: {
    desarrollo: boolean
    serviciosBase: boolean
    otrosServicios: boolean
  }
}

/** Configuración de descuentos granulares (por servicio individual) */
export interface DescuentosGranulares {
  /** Descuento para desarrollo (%) */
  desarrollo: number
  /** Mapa de servicioId -> porcentaje de descuento */
  serviciosBase: { [servicioId: string]: number }
  /** Mapa de índice -> porcentaje de descuento para otros servicios */
  otrosServicios: { [indice: string]: number }
}

/** Configuración completa de descuentos para un paquete */
export interface ConfigDescuentos {
  /** Tipo de descuento: ninguno, granular o general (mutuamente excluyentes) */
  tipoDescuento: TipoDescuento
  
  /** Configuración de descuento general (solo si tipoDescuento === 'general') */
  descuentoGeneral: DescuentoGeneral
  
  /** Configuración de descuentos granulares (solo si tipoDescuento === 'granular') */
  descuentosGranulares: DescuentosGranulares
  
  /** Descuento por pago único del desarrollo (%) */
  descuentoPagoUnico: number
  
  /** Descuento directo aplicado al Total General DESPUÉS de otros descuentos (%) */
  descuentoDirecto: number
}

// ==================== TIPOS LEGACY (para compatibilidad) ====================
/** @deprecated Usar ConfigDescuentos.descuentoGeneral */
export interface DescuentosGenerales {
  aplicarAlDesarrollo?: boolean
  aplicarAServiciosBase?: boolean
  aplicarAOtrosServicios?: boolean
  porcentaje?: number
}

/** @deprecated Usar ConfigDescuentos.descuentosGranulares */
export interface DescuentosPorServicio {
  aplicarAServiciosBase?: boolean
  aplicarAOtrosServicios?: boolean
  serviciosBase?: DescuentoServicio[]
  otrosServicios?: DescuentoServicio[]
}

export interface Package {
  nombre: string
  desarrollo: number
  descuento: number
  activo: boolean
  tipo?: string
  descripcion?: string
  emoji?: string
  tagline?: string
  precioHosting?: number
  precioMailbox?: number
  precioDominio?: number
  tiempoEntrega?: string
  opcionesPago?: OpcionPago[]
  
  // ✅ NUEVO SISTEMA DE DESCUENTOS
  configDescuentos?: ConfigDescuentos
  
  // Legacy (para compatibilidad durante migración)
  descuentoPagoUnico?: number
  descuentosGenerales?: DescuentosGenerales
  descuentosPorServicio?: DescuentosPorServicio
  
  gestionMensual?: {
    precio: number
    descripcion: string
  }
}

export interface Servicio {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual' // Default: 'mensual'
}

export interface OtroServicio {
  id?: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
  frecuenciaPago?: 'mensual' | 'anual' // Default: 'mensual'
}

export type OtroServicioSnapshot = OtroServicio

// ==================== TEMPLATES DE DESCRIPCIÓN DE PAQUETE ====================
/** Template reutilizable para descripciones de paquete */
export interface DescripcionPaqueteTemplate {
  id: string
  nombre: string           // Título/nombre del paquete
  descripcion: string      // Descripción larga del paquete
  tipo?: string            // Tipo de paquete (Básico, Premium, etc.)
  tagline?: string         // Tagline descriptivo
  tiempoEntrega?: string   // Tiempo estimado de entrega
  createdAt: string
  updatedAt: string
}

export interface QuotationConfig {
  id: string
  // Cotización
  numero: string
  versionNumber: number
  fechaEmision: string
  tiempoValidez: number
  fechaVencimiento: string
  presupuesto: string
  moneda: string
  // Cliente
  empresa: string
  sector: string
  ubicacion: string
  emailCliente: string
  whatsappCliente: string
  // Proveedor
  profesional: string
  empresaProveedor: string
  emailProveedor: string
  whatsappProveedor: string
  ubicacionProveedor: string
  // Vigencia del contrato
  tiempoVigenciaValor: number
  tiempoVigenciaUnidad: string  // "días", "meses", "años"
  // Hero (editables por cotización)
  heroTituloMain: string
  heroTituloSub: string
  // Estados de control
  activo: boolean
  isGlobal: boolean
  
  // ==================== TEMPLATES REUTILIZABLES ====================
  // Servicios Base template (para crear nuevos paquetes)
  serviciosBaseTemplate?: ServicioBase[]
  // Servicios Opcionales template (para crear nuevos paquetes)
  serviciosOpcionalesTemplate?: OtroServicio[]
  // Opciones de Pago template (para crear nuevos paquetes)
  opcionesPagoTemplate?: OpcionPago[]
  // Configuración de Descuentos template (para crear nuevos paquetes)
  configDescuentosTemplate?: ConfigDescuentos
  // Método de pago preferido a nivel de cotización
  metodoPagoPreferido?: string
  // Notas de pago a nivel de cotización
  notasPago?: string
  // Configuración de estilos (JSON)
  estilosConfig?: Record<string, unknown>
  // Contenido general editable (FAQ, Garantías, Contacto, etc.)
  contenidoGeneral?: ContenidoGeneral
  // Templates de descripción de paquete reutilizables
  descripcionesPaqueteTemplates?: DescripcionPaqueteTemplate[]
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface PackageSnapshot {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  gestion: {
    precio: number
    mesesGratis: number
    mesesPago: number
  }
  paquete: {
    desarrollo: number
    descuento: number
    tipo?: string
    descripcion?: string
    emoji?: string
    tagline?: string
    precioHosting?: number
    precioMailbox?: number
    precioDominio?: number
    tiempoEntrega?: string
    opcionesPago?: OpcionPago[]
    // ✅ NUEVO SISTEMA DE DESCUENTOS
    configDescuentos?: ConfigDescuentos
    // Método de pago preferido para este paquete
    metodoPagoPreferido?: string
    // Notas de pago para este paquete
    notasPago?: string
    // Legacy (mantener para compatibilidad)
    descuentoPagoUnico?: number
    descuentosGenerales?: DescuentosGenerales
    descuentosPorServicio?: DescuentosPorServicio
    gestionMensual?: {
      precio: number
      descripcion: string
    }
  }
  otrosServicios: OtroServicioSnapshot[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  contenido?: {
    features: string[]
    beneficios: string[]
    incluidos: string[]
    exclusiones: string[]
    terminosCondiciones: string
    informacionAdicional: string
  }
  activo: boolean
  quotationConfigId?: string
  createdAt: string
}

export interface UserPreferences {
  id: string
  userId: string
  cerrarModalAlGuardar: boolean
  mostrarConfirmacionGuardado: boolean
  validarDatosAntes: boolean
  // Limpiar formularios automáticamente al crear nueva cotización
  limpiarFormulariosAlCrear: boolean
  // Mantener datos (templates) al crear nueva cotización
  // Si true: mantiene servicios, financiero, contenido. Si false: limpia todo.
  mantenerDatosAlCrearCotizacion?: boolean
  
  // ==================== NUEVAS PREFERENCIAS DE SINCRONIZACIÓN ====================
  /** Destino de guardado: 'local' = solo localStorage, 'cloud' = solo BD, 'ambos' = ambos */
  destinoGuardado?: 'local' | 'cloud' | 'ambos'
  /** Intervalo de verificación de conexión en segundos (mínimo 5, máximo 300) */
  intervaloVerificacionConexion?: number
  /** Unidad del intervalo: 'segundos' o 'minutos' */
  unidadIntervaloConexion?: 'segundos' | 'minutos'
  /** Sincronizar automáticamente al recuperar conexión */
  sincronizarAlRecuperarConexion?: boolean
  /** Mostrar notificación cuando se usa cache local */
  mostrarNotificacionCacheLocal?: boolean
  
  createdAt: string
  updatedAt: string
}

// ==================== CONTENIDO GENERAL (editable por cotización) ====================

/** Item de FAQ con pregunta y respuesta */
export interface FAQItem {
  question: string
  answer: string | string[]
}

/** Item de garantía simple */
export interface GarantiaItem {
  texto: string
}

/** Política de cancelación con título y detalle */
export interface PoliticaCancelacion {
  title: string
  detail: string
}

/** Item de incumplimiento */
export interface IncumplimientoItem {
  texto: string
}

/** Información de contacto */
export interface ContactoInfo {
  titulo: string
  subtitulo: string
  whatsapp: string
  email: string
  telefono: string
  direccion: string
  ciudad: string
  pais: string
  horario: string
  nombreCeo: string
  empresaNombre: string
  // Metadata de la propuesta
  fechaPropuesta?: string
  versionPropuesta?: string
  copyright?: string
  // Redes sociales (opcional)
  redesSociales?: Array<{
    nombre: string
    url: string
    icono: string
  }>
}

/** Textos del Resumen Ejecutivo */
export interface ResumenEjecutivoTextos {
  tituloSeccion: string
  subtitulo: string
  parrafoIntroduccion: string
  beneficiosPrincipales: string[]
  parrafoPaquetes: string
  diferenciasClave: {
    tituloSeccion: string
    parrafoIntroduccion: string
    items: string[]
    parrafoModelo: string
    beneficiosModelo: string[]
  }
  // Responsabilidades del proveedor (lo que hacemos)
  responsabilidadesProveedor?: {
    contenido: string[]      // "Actualizar productos", "Cambiar precios"...
    tecnico: string[]        // "Actualizaciones de plataforma"...
    comunicacion: string[]   // "Reporte de cambios"...
  }
  // Lo que el cliente NO tiene que hacer
  clienteNoHace?: string[]
  // Flujo de comunicación cliente-proveedor (timeline)
  flujoComunicacion?: Array<{
    paso: number
    icono: string
    titulo: string
    descripcion: string
    actor: 'cliente' | 'proveedor'
  }>
}

/** Términos y condiciones */
export interface TerminosCondiciones {
  titulo: string
  subtitulo: string
  parrafos: string[]
  visibilidad?: {
    titulo: boolean
    parrafos: boolean
  }
}

/** Configuración de garantías - usa strings simples para compatibilidad */
export interface GarantiasConfig {
  proveedorGarantiza: string[]
  clienteResponsable: string[]
  politicasCancelacion: PoliticaCancelacion[]
  siIncumpleProveedor: string[]
}

// ==================== TIPOS DE SECCIONES DE CONTENIDO ====================

// --- Análisis de Requisitos ---
export interface InformacionCliente {
  empresa: string
  sector: string
  ubicacion: string
  trayectoria: string
}

export interface PropuestaValor {
  descripcionNegocio: string[]
  mision: string
  publicoObjetivo: string[]
}

export interface IdentidadVisual {
  logoCorporativo?: string // Base64 del logo importado
  logoFileName?: string // Nombre del archivo del logo
  coloresCorporativos: ColorCorporativo[]
  coloresEvitar: ColorCorporativo[]
  estiloVisual: string
  contenidoDisponible: Array<{ item: string; status: string; note: string }>
}

export interface ObjetivosSitio {
  metasPrincipales: string[]
  accionesEsperadas: string[]
}

export interface EstructuraCatalogo {
  paginasRequeridas: string[]
  cantidadProductos: string
  categoriasPrincipales: string
  fotosPorProducto: string
  infoProducto: string[]
}

export interface Funcionalidades {
  caracteristicas: string[]
  integraciones: string[]
}

export interface AnalisisRequisitosData {
  titulo: string
  subtitulo: string
  informacionCliente: InformacionCliente
  propuestaValor: PropuestaValor
  identidadVisual: IdentidadVisual
  objetivosSitio: ObjetivosSitio
  estructuraCatalogo: EstructuraCatalogo
  funcionalidades: Funcionalidades
}

// --- Fortalezas del Proyecto ---
export interface FortalezaItem {
  icon: string
  title: string
  desc: string
}

export interface ResumenFortalezas {
  titulo: string
  clienteIdeal: string[]
  ventajasCompetitivas: string[]
  resultadoFinal: string
}

export interface FortalezasData {
  titulo: string
  subtitulo: string
  fortalezas: FortalezaItem[]
  resumen: ResumenFortalezas
}

// --- Dinámico vs Estático ---
export interface ComparisonItem {
  label: string
  value?: string
  list?: string[]
}

export interface ComparisonCard {
  title: string
  items: ComparisonItem[]
}

export interface DinamicoVsEstaticoData {
  titulo: string
  subtitulo: string
  sitioEstatico: ComparisonCard
  sitioDinamico: ComparisonCard
  recomendacion: {
    titulo: string
    subtitulo: string
    tipo: string
    razones: string[]
  }
}

// --- Tabla Comparativa ---
export interface PackageFeature {
  name: string
  basic: boolean | string
  professional: boolean | string
  enterprise: boolean | string
}

export interface ComparisonCategory {
  category: string
  items: PackageFeature[]
}

export interface PackageInfo {
  name: string
  price: string
  description: string
  popular?: boolean
  cta: string
}

export interface TablaComparativaData {
  titulo: string
  subtitulo: string
  paquetes: {
    basic: PackageInfo
    professional: PackageInfo
    enterprise: PackageInfo
  }
  categorias: ComparisonCategory[]
  notaPie: string
}

// --- Presupuesto y Cronograma ---
export interface RangoPresupuesto {
  paquete: string
  rangoMin: number
  rangoMax: number
  descripcion: string
  caracteristicas: string[]
}

export interface MetodoPago {
  nombre: string
  porcentaje?: number
  descripcion: string
}

export interface FaseCronograma {
  nombre: string
  duracionDias: number
  descripcion: string
  entregables: string[]
}

export interface PresupuestoCronogramaData {
  titulo: string
  subtitulo: string
  presupuesto: {
    visible: boolean
    titulo: string
    descripcion: string
    rangos: RangoPresupuesto[]
    notaImportante: string
  }
  metodosPago: {
    visible: boolean
    titulo: string
    opciones: MetodoPago[]
  }
  cronograma: {
    visible: boolean
    titulo: string
    descripcion: string
    duracionTotal: string
    fases: FaseCronograma[]
  }
}

// --- Observaciones ---
export interface PuntoAtencion {
  titulo: string
  descripcion: string
  prioridad: 'alta' | 'media' | 'baja'
}

export interface RecomendacionEstrategica {
  titulo: string
  descripcion: string
  beneficios: string[]
}

export interface ObservacionesData {
  titulo: string
  subtitulo: string
  puntosAtencion: {
    visible: boolean
    titulo: string
    descripcion: string
    items: PuntoAtencion[]
  }
  recomendaciones: {
    visible: boolean
    titulo: string
    descripcion: string
    items: RecomendacionEstrategica[]
  }
  notaFinal: string
}

// --- Conclusión ---
export interface ConclusionData {
  titulo: string
  subtitulo: string
  parrafoPrincipal: string
  parrafoSecundario: string
  llamadaAccion: {
    visible: boolean
    titulo: string
    descripcion: string
    textoBoton: string
    urlBoton: string
  }
  firmaDigital: {
    visible: boolean
    nombreEmpresa: string
    eslogan: string
    textoFinal: string
  }
}

/** Configuración de visibilidad para secciones de contenido */
export interface VisibilidadConfig {
  // ResumenEjecutivo
  tituloSeccion?: boolean
  parrafoIntroduccion?: boolean
  beneficiosPrincipales?: boolean
  parrafoPaquetes?: boolean
  diferenciasClave?: boolean
  responsabilidadesProveedor?: boolean
  clienteNoHace?: boolean
  flujoComunicacion?: boolean
  // Otras secciones
  faq?: boolean
  garantiasProveedor?: boolean
  garantiasCliente?: boolean
  politicasCancelacion?: boolean
  siIncumpleProveedor?: boolean
  contacto?: boolean
  terminos?: boolean
}

/** Estado de secciones colapsables por componente */
export interface SeccionesColapsadasConfig {
  // ResumenContent
  resumen_diferencias?: boolean
  resumen_responsabilidades?: boolean
  resumen_clienteNoHace?: boolean
  resumen_flujo?: boolean
  // FortalezasContent
  fortalezas_fortalezas?: boolean
  fortalezas_resumen?: boolean
  // DinamicoVsEstaticoContent
  dinamico_estatico?: boolean
  dinamico_dinamico?: boolean
  // PresupuestoCronogramaContent
  presupuesto_presupuesto?: boolean
  presupuesto_metodosPago?: boolean
  presupuesto_cronograma?: boolean
  // TablaComparativaContent
  tabla_paquetes?: boolean
  tabla_categorias?: boolean
  // ObservacionesContent
  observaciones_puntosAtencion?: boolean
  observaciones_recomendaciones?: boolean
  // Índice genérico para otras secciones
  [key: string]: boolean | undefined
}

/** Contenido general editable por cotización */
export interface ContenidoGeneral {
  // Textos generales del sitio
  textos?: {
    resumenEjecutivo?: ResumenEjecutivoTextos
  }
  // FAQ
  faq?: FAQItem[]
  faqTituloSubtitulo?: {
    titulo: string
    subtitulo: string
  }
  // Garantías
  garantias?: GarantiasConfig
  garantiasTituloSubtitulo?: {
    titulo: string
    subtitulo: string
  }
  // Contacto
  contacto?: ContactoInfo
  // Términos y Condiciones
  terminos?: TerminosCondiciones
  // Visibilidad de secciones
  visibilidad?: VisibilidadConfig
  // Estado de secciones colapsables (se persiste al guardar)
  seccionesColapsadas?: SeccionesColapsadasConfig
  
  // ==================== NUEVAS SECCIONES DE CONTENIDO (Phase 16) ====================
  // Análisis de Requisitos
  analisisRequisitos?: AnalisisRequisitosData
  // Fortalezas del Proyecto
  fortalezas?: FortalezasData
  // Dinámico vs Estático
  dinamicoVsEstatico?: DinamicoVsEstaticoData
  // Presupuesto y Cronograma
  presupuestoCronograma?: PresupuestoCronogramaData
  // Tabla Comparativa
  tablaComparativa?: TablaComparativaData
  // Observaciones
  observaciones?: ObservacionesData
  // Conclusión
  conclusion?: ConclusionData
  
  // ==================== VISIBILIDAD DE NUEVAS SECCIONES ====================
  visibilidadAnalisis?: boolean
  visibilidadFortalezas?: boolean
  visibilidadDinamico?: boolean
  visibilidadPresupuesto?: boolean
  visibilidadTabla?: boolean
  visibilidadObservaciones?: boolean
  visibilidadConclusion?: boolean
  
  // Timestamps de actualización por sección
  updatedTimestamps?: Record<string, string>
}
// ==================== TIPOS PARA SISTEMA GENÉRICO DE DIÁLOGOS ====================
export type DialogType = 'error' | 'advertencia' | 'confirmacion' | 'info' | 'success' | 'activar'

export interface DialogButton {
  label: string
  /** Retorna false para mantener el modal abierto, true o void para cerrarlo */
  action: () => boolean | void | Promise<boolean | void>
  style: 'primary' | 'secondary' | 'danger' | 'success'
}

export interface DialogConfig {
  tipo: DialogType
  titulo: string
  mensaje: string
  subtitulo?: string
  icono?: string // emoji o nombre del icono
  botones: DialogButton[]
  quotation?: QuotationConfig // Solo para tipo 'activar'
  modoAbrir?: 'editar' | 'ver' // Solo para tipo 'activar'
}