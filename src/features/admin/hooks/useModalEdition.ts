import { useEffect, useRef } from 'react'
import { PackageSnapshot, QuotationConfig, DialogConfig } from '@/lib/types'

interface UseModalEditionProps {
  snapshotEditando: PackageSnapshot | null
  snapshotOriginalJson: string | null
  snapshots: PackageSnapshot[]
  quotationEnModal: QuotationConfig | null
  quotationEstadoAntes: { wasGlobal: boolean; wasActive: boolean; wasId: string } | null
  showModalEditar: boolean
  readOnly: boolean
  hayCambiosEnSnapshot: () => boolean
}

interface UseModalEditionReturn {
  // Modal state management
  abrirModalConActivacion: (quotation: QuotationConfig, modo: 'editar' | 'ver') => void
  abrirModalEditarInterno: (quotation: QuotationConfig, modo: 'editar' | 'ver') => void
  activarYAbrirModal: () => Promise<void>
  abrirSinActivar: () => void
  abrirModalEditar: (quotation: QuotationConfig) => void
  abrirModalVer: (quotation: QuotationConfig) => void
  handleCerrarModalEditar: () => void
  cerrarModalConValidacion: () => void
  
  // Helper functions
  obtenerCotizacionActiva: (quotations: QuotationConfig[]) => QuotationConfig | undefined
}

/**
 * Hook para gestionar la apertura, cierre y validación del modal de edición
 * Incluye lógica de activación de cotizaciones y detección de cambios sin guardar
 */
export function useModalEdition(
  props: UseModalEditionProps,
  handlers: {
    setShowModalEditar: (show: boolean) => void
    setSnapshotEditando: (snapshot: PackageSnapshot | null) => void
    setSnapshotOriginalJson: (json: string | null) => void
    setQuotationEstadoAntes: (data: any) => void
    setQuotationEnModal: (quotation: QuotationConfig | null) => void
    setSnapshotsModalActual: (snapshots: PackageSnapshot[]) => void
    setActiveTabFila1: (tab: string) => void
    setActiveTabFila2: (id: string) => void
    setActiveTabFila3: (tab: string) => void
    setReadOnly: (readOnly: boolean) => void
    setAlertaMostradaEnSesion: (shown: boolean) => void
    setMostrarDialogo: (show: boolean) => void
    setDatosDialogo: (data: DialogConfig | null) => void
    mostrarDialogoGenerico: (config: DialogConfig) => void
    desactivarTodas: (id: string) => Promise<void>
    recargarQuotations: () => Promise<void>
  }
): UseModalEditionReturn {
  const nombrePaqueteInputRef = useRef<HTMLInputElement>(null)

  /**
   * Obtener la cotización activa actual
   */
  const obtenerCotizacionActiva = (quotations: QuotationConfig[]): QuotationConfig | undefined => {
    return quotations.find(q => q.activo === true && q.isGlobal === true)
  }

  /**
   * Abrir modal con lógica de activación
   * Si cotización no es activa, muestra diálogo de confirmación
   */
  const abrirModalConActivacion = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
    // Guardar estado ANTES de abrir (para luego comparar)
    handlers.setQuotationEstadoAntes({
      wasGlobal: quotation.isGlobal,
      wasActive: quotation.activo,
      wasId: quotation.id
    })
    
    // Si NO es la cotización activa, mostrar diálogo de confirmación
    if (!quotation.activo || !quotation.isGlobal) {
      handlers.mostrarDialogoGenerico({
        tipo: 'activar',
        titulo: 'Cotización Inactiva',
        icono: '⚠️',
        mensaje: `La cotización "${quotation.numero || 'Sin número'}" no está activa actualmente.${
          modo === 'editar'
            ? ' Para editarla, primero debe activarla. Esto desactivará todas las demás cotizaciones.'
            : ' Puede verla en modo lectura o activarla para editarla.'
        }`,
        modoAbrir: modo,
        quotation: quotation,
        botones: []
      })
    } 
    // Si es cotización ACTIVA Y modo EDITAR, mostrar diálogo de confirmación
    else if (modo === 'editar' && quotation.isGlobal === true) {
      handlers.mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cotización Activa',
        icono: '⚠️',
        mensaje: 'Esta es la cotización ACTIVA actualmente. Los cambios serán guardados inmediatamente. ¿Deseas continuar editando?',
        subtitulo: quotation.numero || 'Sin número',
        botones: [
          {
            label: 'Cancelar',
            action: () => {
              handlers.setQuotationEstadoAntes(null)
            },
            style: 'secondary'
          },
          {
            label: 'Continuar editando',
            action: () => {
              abrirModalEditarInterno(quotation, modo)
            },
            style: 'primary'
          }
        ]
      })
    }
    // Si ya está activa Y modo VER
    else {
      abrirModalEditarInterno(quotation, modo)
    }
  }

  /**
   * Función interna para abrir el modal sin verificación
   */
  const abrirModalEditarInterno = (quotation: QuotationConfig, modo: 'editar' | 'ver') => {
    // 1. Cargar snapshots de esta quotation
    const snapshotsFiltrados = props.snapshots.filter(
      s => s.quotationConfigId === quotation.id
    )

    // 2. Guardar contexto
    handlers.setQuotationEnModal(quotation)
    handlers.setSnapshotsModalActual(snapshotsFiltrados)

    // 3. Seleccionar primer snapshot
    if (snapshotsFiltrados.length > 0) {
      const firstSnapshot = snapshotsFiltrados[0]

      // Inicializar descuentos si no existen
      const snapshotConDescuentos = {
        ...firstSnapshot,
        paquete: {
          ...firstSnapshot.paquete,
          descuentosGenerales: firstSnapshot.paquete.descuentosGenerales || {
            aplicarAlDesarrollo: false,
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            porcentaje: 0,
          },
          descuentosPorServicio: firstSnapshot.paquete.descuentosPorServicio || {
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            serviciosBase: firstSnapshot.serviciosBase.map(s => ({
              servicioId: s.id,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
            otrosServicios: firstSnapshot.otrosServicios.map((s, idx) => ({
              servicioId: s.id || `otro-servicio-${idx}`,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
          },
        },
      }

      handlers.setSnapshotEditando(snapshotConDescuentos)
      handlers.setSnapshotOriginalJson(JSON.stringify(firstSnapshot))
      handlers.setActiveTabFila2(firstSnapshot.id)
    }

    // 4. Inicializar TABs
    handlers.setActiveTabFila1('cotizacion')
    handlers.setActiveTabFila3('descripcion')

    // 5. Establecer modo según parámetro
    if (modo === 'ver') {
      handlers.setReadOnly(true)
    } else {
      handlers.setReadOnly(false)
    }
    handlers.setAlertaMostradaEnSesion(false)

    // 6. Mostrar modal
    handlers.setShowModalEditar(true)
  }

  /**
   * Función para activar la cotización y luego abrir el modal
   */
  const activarYAbrirModal = async () => {
    // Obtener datos del diálogo enviado
    const datosDialogo = props as any
    if (!datosDialogo?.quotation) return

    try {
      // Desactivar todas las demás
      await handlers.desactivarTodas(datosDialogo.quotation.id)

      // Recargar cotizaciones para tener el estado actualizado
      await handlers.recargarQuotations()

      // Abrir el modal
      abrirModalEditarInterno(datosDialogo.quotation, datosDialogo.modoAbrir || 'editar')

      // Cerrar diálogo
      handlers.setMostrarDialogo(false)
      handlers.setDatosDialogo(null)

      // toast.success('✓ Cotización activada. Abriendo para editar...')
    } catch (error) {
      console.error('Error al activar cotización:', error)
      // toast.error('Error al activar la cotización')
    }
  }

  /**
   * Función para abrir sin activar (solo lectura)
   */
  const abrirSinActivar = () => {
    // Obtener datos del diálogo enviado
    const datosDialogo = props as any
    if (!datosDialogo?.quotation) return
    
    abrirModalEditarInterno(datosDialogo.quotation, datosDialogo.modoAbrir || 'ver')
    handlers.setMostrarDialogo(false)
    handlers.setDatosDialogo(null)
  }

  /**
   * Wrapper para abrirModalConActivacion con modo 'editar'
   */
  const abrirModalEditar = (quotation: QuotationConfig) => {
    abrirModalConActivacion(quotation, 'editar')
  }

  /**
   * Wrapper para abrirModalConActivacion con modo 'ver'
   */
  const abrirModalVer = (quotation: QuotationConfig) => {
    abrirModalConActivacion(quotation, 'ver')
  }

  /**
   * Cerrar modal sin validación (para modo lectura)
   */
  const cerrarModalConValidacion = () => {
    if (props.readOnly) {
      // Modo lectura → Cerrar sin preguntar
      handlers.setShowModalEditar(false)
      handlers.setSnapshotEditando(null)
      handlers.setQuotationEstadoAntes(null)
      return
    }

    if (props.hayCambiosEnSnapshot()) {
      // Hay cambios → Preguntar
      handlers.mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cambios sin guardar',
        icono: '⚠️',
        mensaje: '¿Estás seguro de que deseas cerrar? Los cambios se perderán.',
        botones: [
          {
            label: 'Seguir editando',
            action: () => {},
            style: 'secondary'
          },
          {
            label: 'Descartar cambios',
            action: () => {
              handlers.setShowModalEditar(false)
              handlers.setSnapshotEditando(null)
              handlers.setQuotationEstadoAntes(null)
              handlers.setSnapshotOriginalJson(null)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      // No hay cambios → Cerrar directamente
      handlers.setShowModalEditar(false)
      handlers.setSnapshotEditando(null)
      handlers.setQuotationEstadoAntes(null)
    }
  }

  /**
   * Cerrar modal con validación de cambios sin guardar
   */
  const handleCerrarModalEditar = () => {
    if (props.readOnly) {
      // Modo lectura → Cerrar sin preguntar
      handlers.setShowModalEditar(false)
      handlers.setSnapshotEditando(null)
      handlers.setQuotationEstadoAntes(null)
      handlers.setSnapshotOriginalJson(null)
      return
    }

    if (props.hayCambiosEnSnapshot()) {
      // Hay cambios → Preguntar
      handlers.mostrarDialogoGenerico({
        tipo: 'advertencia',
        titulo: 'Cambios sin guardar',
        icono: '⚠️',
        mensaje: '¿Estás seguro de que deseas cerrar? Los cambios se perderán.',
        botones: [
          {
            label: 'Seguir editando',
            action: () => {},
            style: 'secondary'
          },
          {
            label: 'Descartar cambios',
            action: () => {
              handlers.setShowModalEditar(false)
              handlers.setSnapshotEditando(null)
              handlers.setQuotationEstadoAntes(null)
              handlers.setSnapshotOriginalJson(null)
            },
            style: 'danger'
          }
        ]
      })
    } else {
      // No hay cambios → Cerrar directamente
      handlers.setShowModalEditar(false)
      handlers.setSnapshotEditando(null)
      handlers.setQuotationEstadoAntes(null)
      handlers.setSnapshotOriginalJson(null)
    }
  }

  // Foco inicial al abrir modal
  useEffect(() => {
    if (props.showModalEditar && nombrePaqueteInputRef.current) {
      nombrePaqueteInputRef.current.focus()
    }
  }, [props.showModalEditar])

  // Manejo de tecla Escape dentro del modal
  useEffect(() => {
    if (!props.showModalEditar) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCerrarModalEditar()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [props.showModalEditar, props.snapshotEditando, props.snapshotOriginalJson])

  return {
    abrirModalConActivacion,
    abrirModalEditarInterno,
    activarYAbrirModal,
    abrirSinActivar,
    abrirModalEditar,
    abrirModalVer,
    handleCerrarModalEditar,
    cerrarModalConValidacion,
    obtenerCotizacionActiva,
  }
}
