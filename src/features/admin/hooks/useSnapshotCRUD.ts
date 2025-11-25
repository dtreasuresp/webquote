import { useState, useRef, useEffect } from 'react'
import { PackageSnapshot, ServicioBase, OtroServicio, QuotationConfig } from '@/lib/types'
import { 
  crearSnapshot, 
  actualizarSnapshot,
  eliminarSnapshot
} from '@/lib/snapshotApi'

interface UseToastActions {
  error: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
}

interface UseSnapshotCRUDProps {
  snapshots: PackageSnapshot[]
  serviciosBase: ServicioBase[]
  serviciosOpcionales: OtroServicio[]
  gestion: { precio: number; mesesGratis: number; mesesPago: number }
  paqueteActual: { nombre: string; desarrollo: number; descuento: number; tipo: string; descripcion: string; activo: boolean }
  cotizacionConfig: QuotationConfig | null
  snapshotEditando: PackageSnapshot | null
  snapshotOriginalJson: string | null
  mostrarDialogoGenerico: (config: any) => void
  toast: UseToastActions
}

interface UseSnapshotCRUDReturn {
  crearPaqueteSnapshot: () => Promise<void>
  handleEliminarSnapshot: (id: string) => Promise<void>
  guardarEdicion: () => Promise<void>
  calcularCostoInicialSnapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño1Snapshot: (snapshot: PackageSnapshot) => number
  calcularCostoAño2Snapshot: (snapshot: PackageSnapshot) => number
  hayCambiosEnSnapshot: () => boolean
  tieneCambiosSinGuardar: () => boolean
  pestañaTieneCambios: (tabId: string) => boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedJson: string | null
  autoSaveDelay: number
}

export function useSnapshotCRUD(
  props: UseSnapshotCRUDProps,
  handlers: {
    setSnapshots: (snapshots: PackageSnapshot[]) => void
    setPaqueteActual: (data: any) => void
    setServiciosOpcionales: (services: OtroServicio[]) => void
    setNuevoServicio: (data: any) => void
    setSnapshotEditando: (snapshot: PackageSnapshot | null) => void
    setSnapshotOriginalJson: (json: string | null) => void
    setShowModalEditar: (show: boolean) => void
  }
): UseSnapshotCRUDReturn {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSavedJson, setLastSavedJson] = useState<string | null>(null)
  const autoSaveDelay = 800
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const calcularCostoInicialSnapshot = (snapshot: PackageSnapshot): number => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    const serviciosBaseMes1 = snapshot.serviciosBase.reduce((sum, s) => {
      if (s.nombre.toLowerCase() !== 'gestión') {
        return sum + (s.precio || 0)
      }
      return sum
    }, 0)
    return desarrolloConDescuento + serviciosBaseMes1
  }

  const calcularCostoAño1Snapshot = (snapshot: PackageSnapshot): number => {
    const desarrolloConDescuento = snapshot.paquete.desarrollo * (1 - snapshot.paquete.descuento / 100)
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * s.mesesPago)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * s.mesesPago
    }, 0)
    return desarrolloConDescuento + serviciosBaseCosto + otrosServiciosTotal
  }

  const calcularCostoAño2Snapshot = (snapshot: PackageSnapshot): number => {
    const serviciosBaseCosto = snapshot.serviciosBase.reduce((sum, s) => {
      return sum + (s.precio * 12)
    }, 0)
    const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => {
      return sum + s.precio * 12
    }, 0)
    return serviciosBaseCosto + otrosServiciosTotal
  }

  const crearPaqueteSnapshot = async (): Promise<void> => {
    if (!props.cotizacionConfig?.id) {
      props.toast.error('Cotización no cargada - Primero debes crear o cargar una cotización antes de agregar paquetes.')
      return
    }

    const todoEsValido =
      props.paqueteActual.nombre &&
      props.paqueteActual.desarrollo > 0 &&
      props.serviciosBase.every(s => s.precio > 0 && (s.mesesGratis + s.mesesPago === 12 || s.mesesPago > 0)) &&
      props.gestion.mesesGratis + props.gestion.mesesPago === 12

    if (!todoEsValido) {
      props.mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Campos incompletos',
        icono: '⚠️',
        mensaje: 'Por favor completa todos los campos requeridos: Nombre del paquete, Desarrollo, Precios de servicios, y Meses válidos.',
        botones: [{ label: 'Entendido', action: () => {}, style: 'primary' }]
      })
      return
    }

    try {
      const otrosServiciosUnificados: OtroServicio[] = props.serviciosOpcionales.map(s => ({
        nombre: s.nombre,
        precio: s.precio,
        mesesGratis: s.mesesGratis,
        mesesPago: s.mesesPago,
      }))

      const nuevoSnapshot: PackageSnapshot = {
        id: Date.now().toString(),
        nombre: props.paqueteActual.nombre,
        quotationConfigId: props.cotizacionConfig?.id,
        serviciosBase: props.serviciosBase.map(s => ({ ...s })),
        gestion: {
          precio: props.gestion.precio,
          mesesGratis: props.gestion.mesesGratis,
          mesesPago: props.gestion.mesesPago,
        },
        paquete: {
          desarrollo: props.paqueteActual.desarrollo,
          descuento: props.paqueteActual.descuento,
          tipo: props.paqueteActual.tipo || '',
          descripcion: props.paqueteActual.descripcion || 'Paquete personalizado para empresas.',
          descuentosGenerales: {
            aplicarAlDesarrollo: false,
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            porcentaje: 0,
          },
          descuentosPorServicio: {
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            serviciosBase: props.serviciosBase.map(s => ({
              servicioId: s.id,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
            otrosServicios: otrosServiciosUnificados.map((s, idx) => ({
              servicioId: `otro-${idx}`,
              aplicarDescuento: false,
              porcentajeDescuento: 0,
            })),
          },
        },
        otrosServicios: otrosServiciosUnificados,
        costos: {
          inicial: 0,
          año1: 0,
          año2: 0,
        },
        activo: true,
        createdAt: new Date().toISOString(),
      }

      nuevoSnapshot.costos.inicial = calcularCostoInicialSnapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año1 = calcularCostoAño1Snapshot(nuevoSnapshot)
      nuevoSnapshot.costos.año2 = calcularCostoAño2Snapshot(nuevoSnapshot)

      const snapshotGuardado = await crearSnapshot(nuevoSnapshot)
      handlers.setSnapshots([...props.snapshots, snapshotGuardado])
      
      handlers.setPaqueteActual({ nombre: '', desarrollo: 0, descuento: 0, tipo: '', descripcion: '', activo: true })
      handlers.setServiciosOpcionales([])
      handlers.setNuevoServicio({ nombre: '', precio: 0, mesesGratis: 0, mesesPago: 12 })

      props.toast.success(`✅ Paquete creado y vinculado: "${props.paqueteActual.nombre}" a cotización ${props.cotizacionConfig?.numero || props.cotizacionConfig?.id}`)
    } catch (error) {
      console.error('Error al crear paquete:', error)
      props.mostrarDialogoGenerico({
        tipo: 'error',
        titulo: 'Error al guardar',
        icono: '❌',
        mensaje: 'Ocurrió un error al guardar el paquete. Por favor intenta de nuevo.',
        botones: [{ label: 'Entendido', action: () => {}, style: 'primary' }]
      })
    }
  }

  const handleEliminarSnapshot = async (id: string): Promise<void> => {
    try {
      await eliminarSnapshot(id)
      handlers.setSnapshots(props.snapshots.filter(s => s.id !== id))
      props.toast.success('✅ Paquete eliminado')
    } catch (error) {
      console.error('Error al eliminar snapshot:', error)
      props.toast.error('❌ Error al eliminar el paquete')
    }
  }

  const guardarEdicion = async (): Promise<void> => {
    if (!props.snapshotEditando) return

    try {
      const actualizado = { ...props.snapshotEditando } as PackageSnapshot
      actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
      actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
      actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)

      const snapshotActualizado = await actualizarSnapshot(actualizado.id, actualizado)
      handlers.setSnapshots(props.snapshots.map(s => s.id === actualizado.id ? snapshotActualizado : s))
      
      props.toast.success('✓ Cotización actualizada')
      handlers.setShowModalEditar(false)
      handlers.setSnapshotEditando(null)
      handlers.setSnapshotOriginalJson(JSON.stringify(snapshotActualizado))
    } catch (error) {
      console.error('Error al guardar edición:', error)
      props.toast.error('❌ Error al actualizar el paquete. Por favor intenta de nuevo.')
    }
  }

  const hayCambiosEnSnapshot = (): boolean => {
    if (!props.snapshotEditando || !props.snapshotOriginalJson) return false
    const snapshotActual = JSON.stringify(props.snapshotEditando)
    return snapshotActual !== props.snapshotOriginalJson
  }

  const tieneCambiosSinGuardar = (): boolean => {
    if (!props.snapshotEditando) return false
    const currentJson = JSON.stringify({
      id: props.snapshotEditando.id,
      nombre: props.snapshotEditando.nombre,
      paquete: props.snapshotEditando.paquete,
      serviciosBase: props.snapshotEditando.serviciosBase,
      gestion: props.snapshotEditando.gestion,
      otrosServicios: props.snapshotEditando.otrosServicios,
      costos: props.snapshotEditando.costos,
      activo: props.snapshotEditando.activo,
    })
    return !lastSavedJson || lastSavedJson !== currentJson
  }

  const pestañaTieneCambios = (tabId: string): boolean => {
    if (!props.snapshotEditando || !props.snapshotOriginalJson) return false
    
    const original = JSON.parse(props.snapshotOriginalJson)
    
    switch (tabId) {
      case 'descripcion':
        return (
          props.snapshotEditando.nombre !== original.nombre ||
          JSON.stringify(props.snapshotEditando.paquete) !== JSON.stringify(original.paquete)
        )
      case 'servicios-base':
        return JSON.stringify(props.snapshotEditando.serviciosBase) !== JSON.stringify(original.serviciosBase) ||
               JSON.stringify(props.snapshotEditando.gestion) !== JSON.stringify(original.gestion)
      case 'otros-servicios':
        return JSON.stringify(props.snapshotEditando.otrosServicios) !== JSON.stringify(original.otrosServicios)
      case 'descuentos':
        return JSON.stringify(props.snapshotEditando.paquete.descuentosGenerales) !== JSON.stringify(original.paquete.descuentosGenerales)
      default:
        return false
    }
  }

  useEffect(() => {
    if (!props.snapshotEditando) return

    const currentJson = JSON.stringify({
      id: props.snapshotEditando.id,
      nombre: props.snapshotEditando.nombre,
      paquete: props.snapshotEditando.paquete,
      serviciosBase: props.snapshotEditando.serviciosBase,
      gestion: props.snapshotEditando.gestion,
      otrosServicios: props.snapshotEditando.otrosServicios,
      costos: props.snapshotEditando.costos,
      activo: props.snapshotEditando.activo,
    })

    if (lastSavedJson && lastSavedJson === currentJson) {
      return
    }

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        const actualizado = { ...props.snapshotEditando } as PackageSnapshot
        actualizado.costos.inicial = calcularCostoInicialSnapshot(actualizado)
        actualizado.costos.año1 = calcularCostoAño1Snapshot(actualizado)
        actualizado.costos.año2 = calcularCostoAño2Snapshot(actualizado)
        const snapshotActualizado = await actualizarSnapshot(actualizado.id, actualizado)
        handlers.setSnapshots(props.snapshots.map(s => s.id === actualizado.id ? snapshotActualizado : s))
        
        const savedJson = JSON.stringify({
          id: snapshotActualizado.id,
          nombre: snapshotActualizado.nombre,
          paquete: snapshotActualizado.paquete,
          serviciosBase: snapshotActualizado.serviciosBase,
          gestion: snapshotActualizado.gestion,
          otrosServicios: snapshotActualizado.otrosServicios,
          costos: snapshotActualizado.costos,
          activo: snapshotActualizado.activo,
        })
        setLastSavedJson(savedJson)
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus('idle'), 1500)
      } catch (e) {
        console.error('Error en autoguardado:', e)
        setAutoSaveStatus('error')
        setTimeout(() => setAutoSaveStatus('idle'), 4000)
      }
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current)
    }
  }, [props.snapshotEditando])

  return {
    crearPaqueteSnapshot,
    handleEliminarSnapshot,
    guardarEdicion,
    calcularCostoInicialSnapshot,
    calcularCostoAño1Snapshot,
    calcularCostoAño2Snapshot,
    hayCambiosEnSnapshot,
    tieneCambiosSinGuardar,
    pestañaTieneCambios,
    autoSaveStatus,
    lastSavedJson,
    autoSaveDelay,
  }
}
