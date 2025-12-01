import { PackageSnapshot, QuotationConfig } from '@/lib/types'

interface UseToastActions {
  error: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

interface UseCotizacionCRUDReturn {
  obtenerCotizacionActiva: (quotations: QuotationConfig[]) => QuotationConfig | undefined
  desactivarTodas: (exceptoId: string, toast: UseToastActions) => Promise<boolean>
  recargarQuotations: (setQuotations: (q: QuotationConfig[]) => void) => Promise<void>
  crearNuevaCotizacion: (handlers: {
    setCotizacionConfig: (config: QuotationConfig) => void
    setEstadoValidacionTabs: (state: any) => void
    setSnapshots: (snapshots: PackageSnapshot[]) => void
    setActivePageTab: (tab: string) => void
    recargarQuotations: () => Promise<void>
    toast: UseToastActions
  }) => Promise<void>
  verificarCotizacionesActivas: (quotations: QuotationConfig[], alertaMostrada: boolean, setAlertaMostrada: (v: boolean) => void, toast: UseToastActions) => void
}

/**
 * Hook para gestionar las operaciones CRUD de cotizaciones
 * Incluye creación, activación, desactivación y recarga de cotizaciones
 */
export function useCotizacionCRUD(): UseCotizacionCRUDReturn {
  /**
   * Obtener la cotización activa actual
   */
  const obtenerCotizacionActiva = (quotations: QuotationConfig[]): QuotationConfig | undefined => {
    return quotations.find(q => q.activo === true && q.isGlobal === true)
  }

  /**
   * Desactiva todas las cotizaciones excepto la especificada
   */
  const desactivarTodas = async (exceptoId: string, toast: UseToastActions): Promise<boolean> => {
    try {
      const response = await fetch('/api/quotations/deactivate-others', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptoId }),
      })
      if (!response.ok) throw new Error('Error desactivando cotizaciones')
      return true
    } catch (error) {
      console.error('Error en desactivarTodas:', error)
      toast.error('Error al desactivar otras cotizaciones')
      return false
    }
  }

  /**
   * Recarga la lista de cotizaciones desde la BD
   */
  const recargarQuotations = async (setQuotations: (q: QuotationConfig[]) => void): Promise<void> => {
    try {
      const response = await fetch('/api/quotations')
      const data = await response.json()
      if (data.success) {
        setQuotations(data.data || [])
      }
    } catch (error) {
      console.error('Error recargando quotations:', error)
    }
  }

  /**
   * Crea una NUEVA cotización con ID único
   */
  const crearNuevaCotizacion = async (handlers: {
    setCotizacionConfig: (config: QuotationConfig) => void
    setEstadoValidacionTabs: (state: any) => void
    setSnapshots: (snapshots: PackageSnapshot[]) => void
    setActivePageTab: (tab: string) => void
    recargarQuotations: () => Promise<void>
    toast: UseToastActions
  }): Promise<void> => {
    try {
      handlers.toast.info('⏳ Creando nueva cotización...')

      const response = await fetch('/api/quotation-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: '1.0',
          tiempoValidez: 30,
          presupuesto: 'Menos de $300 USD',
          moneda: 'USD',
          empresa: '',
          sector: '',
          ubicacion: '',
          profesional: '',
          empresaProveedor: 'Urbanísima Constructora S.R.L',
          emailProveedor: '',
          whatsappProveedor: '',
          ubicacionProveedor: '',
          heroTituloMain: 'Propuesta de Cotización',
          heroTituloSub: 'Cotización personalizada',
        }),
      })

      if (!response.ok) throw new Error('Error creando cotización')

      const nuevaCotizacion = await response.json()

      // Cargar la nueva cotización en la UI
      handlers.setCotizacionConfig(nuevaCotizacion)

      // Resetear estado de validación de TABs
      handlers.setEstadoValidacionTabs({
        cotizacion: 'pendiente',
        oferta: 'pendiente',
        paquetes: 'pendiente',
        estilos: 'pendiente',
      })

      // Resetear snapshots (paquetes)
      handlers.setSnapshots([])

      // Ir al TAB Cotización
      handlers.setActivePageTab('cotizacion')

      handlers.toast.success('✅ Nueva cotización creada. Comienza completando el TAB Cotización.')
      
      // Recargar cotizaciones
      await handlers.recargarQuotations()
    } catch (error) {
      console.error('Error creando nueva cotización:', error)
      handlers.toast.error('Error al crear nueva cotización')
    }
  }

  /**
   * Verifica si hay cotizaciones activas y muestra alerta si no las hay
   */
  const verificarCotizacionesActivas = (
    quotations: QuotationConfig[], 
    alertaMostrada: boolean, 
    setAlertaMostrada: (v: boolean) => void,
    toast: UseToastActions
  ): void => {
    const tieneActiva = quotations.some(q => q.isGlobal === true)
    if (!tieneActiva && !alertaMostrada && quotations.length > 0) {
      toast.warning(
        '⚠️ No hay cotizaciones activas. Por favor, crea o activa una para iniciar cotizaciones a clientes'
      )
      setAlertaMostrada(true)
    }
  }

  return {
    obtenerCotizacionActiva,
    desactivarTodas,
    recargarQuotations,
    crearNuevaCotizacion,
    verificarCotizacionesActivas,
  }
}
