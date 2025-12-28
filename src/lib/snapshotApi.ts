/**
 * Utilidades para gestionar snapshots a través de la API
 * @version 2.0 - Sistema de descuentos reinventado con ConfigDescuentos
 */
import type { ServicioBase, ConfigDescuentos } from '@/lib/types'
import { getDefaultConfigDescuentos, migrarConfigDescuentosLegacy } from '@/lib/utils/discountCalculator'


export interface SnapshotFromDB {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  desarrollo: number
  descuento: number
  tipo?: string
  descripcion?: string
  emoji?: string
  tagline?: string
  tiempoEntrega?: string
  // Campos para opciones de pago
  opcionesPago?: any
  // Título y subtítulo para sección de pago en página pública
  tituloSeccionPago?: string
  subtituloSeccionPago?: string
  descuentoPagoUnico?: number
  // ✅ Sistema de descuentos reinventado - ConfigDescuentos
  configDescuentos?: ConfigDescuentos | null
  // Método de pago preferido (LEGACY)
  metodoPagoPreferido?: string
  // Notas de pago
  notasPago?: string | null
  // Múltiples métodos de pago preferidos con notas individuales
  metodosPreferidos?: Array<{ id: string; metodo: string; nota: string }>
  // @deprecated - Campos legacy para migración, usar configDescuentos
  descuentosGenerales?: any
  descuentosPorServicio?: any
  otrosServicios: any[]
  costoInicial: number
  costoAño1: number
  costoAño2: number
  quotationConfigId?: string | null
  // ✅ Relación a QuotationConfig con info de estado
  quotationConfig?: {
    id: string
    numero: string
    estado: string
    expiradoEn?: string | null
    respondidoEn?: string | null
  } | null
  activo: boolean
  createdAt: string
  updatedAt: string
}

// Migrar datos antiguos al nuevo formato
function migrarServiciosLegacy(snapshot: any): ServicioBase[] {
  // Si ya tiene serviciosBase, retornar tal cual
  if (snapshot.serviciosBase && Array.isArray(snapshot.serviciosBase)) {
    return snapshot.serviciosBase
  }
  
  // Si tiene el formato antiguo con servicios objeto
  if (snapshot.servicios) {
    const mesesGratis = snapshot.servicios.mesesGratis || 0
    const mesesPago = snapshot.servicios.mesesPago || 12
    
    return [
      {
        id: '1',
        nombre: 'Hosting',
        precio: snapshot.servicios.hosting || 0,
        mesesGratis,
        mesesPago,
      },
      {
        id: '2',
        nombre: 'Mailbox',
        precio: snapshot.servicios.mailbox || 0,
        mesesGratis,
        mesesPago,
      },
      {
        id: '3',
        nombre: 'Dominio',
        precio: snapshot.servicios.dominio || 0,
        mesesGratis,
        mesesPago,
      },
    ]
  }
  
  // Default vacío
  return []
}

// Convertir de formato frontend (PackageSnapshot) a formato DB (SnapshotFromDB)
export function convertSnapshotToDB(snapshot: any): Omit<SnapshotFromDB, 'id' | 'createdAt' | 'updatedAt'> {
  // Obtener configDescuentos del snapshot o migrar desde formato legacy
  // Siempre habrá un valor válido (nuevo, migrado o default)
  let configDescuentos: ConfigDescuentos
  
  if (snapshot.paquete?.configDescuentos) {
    // Nuevo formato - usar directamente
    configDescuentos = snapshot.paquete.configDescuentos
  } else if (snapshot.paquete?.descuentosGenerales || snapshot.paquete?.descuentosPorServicio) {
    // Formato legacy - migrar
    configDescuentos = migrarConfigDescuentosLegacy(
      snapshot.paquete.descuentosGenerales,
      snapshot.paquete.descuentosPorServicio,
      snapshot.paquete.descuentoPagoUnico
    )
  } else {
    // Sin descuentos configurados - usar default
    configDescuentos = getDefaultConfigDescuentos()
  }

  return {
    nombre: snapshot.nombre || '',
    quotationConfigId: snapshot.quotationConfigId || null,
    serviciosBase: migrarServiciosLegacy(snapshot),
    desarrollo: snapshot.paquete?.desarrollo ?? snapshot.desarrollo ?? 0,
    descuento: snapshot.paquete?.descuento ?? snapshot.descuento ?? 0,
    tipo: snapshot.paquete?.tipo ?? snapshot.tipo ?? '',
    descripcion: snapshot.paquete?.descripcion ?? snapshot.descripcion ?? '',
    emoji: snapshot.paquete?.emoji ?? snapshot.emoji ?? '',
    tagline: snapshot.paquete?.tagline ?? snapshot.tagline ?? '',
    tiempoEntrega: snapshot.paquete?.tiempoEntrega ?? snapshot.tiempoEntrega ?? '',
    // Mapear opciones de pago
    opcionesPago: snapshot.paquete?.opcionesPago || [],
    // Título y subtítulo para sección de pago en página pública
    tituloSeccionPago: snapshot.paquete?.tituloSeccionPago || 'Opciones de Pago',
    subtituloSeccionPago: snapshot.paquete?.subtituloSeccionPago || '',
    descuentoPagoUnico: configDescuentos.descuentoPagoUnico ?? 0,
    // ✅ Sistema de descuentos reinventado
    configDescuentos: configDescuentos,
    // Método de pago preferido y notas
    metodoPagoPreferido: snapshot.paquete?.metodoPagoPreferido || '',
    notasPago: snapshot.paquete?.notasPago || null,
    // Múltiples métodos de pago preferidos
    metodosPreferidos: snapshot.paquete?.metodosPreferidos || [],
    // @deprecated - Mantener para compatibilidad con BD existente
    descuentosGenerales: configDescuentos.tipoDescuento === 'general' 
      ? configDescuentos.descuentoGeneral 
      : null,
    descuentosPorServicio: configDescuentos.tipoDescuento === 'granular'
      ? configDescuentos.descuentosGranulares
      : null,
    otrosServicios: snapshot.otrosServicios || [],
    costoInicial: snapshot.costos?.inicial ?? snapshot.costoInicial ?? 0,
    costoAño1: snapshot.costos?.año1 ?? snapshot.costoAño1 ?? 0,
    costoAño2: snapshot.costos?.año2 ?? snapshot.costoAño2 ?? 0,
    activo: snapshot.activo !== false,
  }
}

// Convertir datos de DB a formato PackageSnapshot del frontend
export function convertDBToSnapshot(dbSnapshot: SnapshotFromDB) {
  // Obtener configDescuentos: preferir el nuevo campo, sino migrar desde legacy
  let configDescuentos: ConfigDescuentos
  
  if (dbSnapshot.configDescuentos) {
    // Nuevo formato - usar directamente
    configDescuentos = dbSnapshot.configDescuentos
  } else if (dbSnapshot.descuentosGenerales || dbSnapshot.descuentosPorServicio) {
    // Formato legacy - migrar
    configDescuentos = migrarConfigDescuentosLegacy(
      dbSnapshot.descuentosGenerales,
      dbSnapshot.descuentosPorServicio,
      dbSnapshot.descuentoPagoUnico
    )
  } else {
    // Sin descuentos - usar default
    configDescuentos = getDefaultConfigDescuentos()
  }

  // Convertir descuentosGranulares (mapas) a formato legacy (arrays) para descuentosPorServicio
  const convertirAFormatoLegacy = () => {
    if (configDescuentos.tipoDescuento !== 'granular') {
      return {
        aplicarAServiciosBase: false,
        aplicarAOtrosServicios: false,
        serviciosBase: [] as Array<{ servicioId: string; porcentajeDescuento: number; aplicarDescuento: boolean }>,
        otrosServicios: [] as Array<{ servicioId: string; porcentajeDescuento: number; aplicarDescuento: boolean }>,
      }
    }
    
    const granulares = configDescuentos.descuentosGranulares
    const serviciosBaseLegacy = Object.entries(granulares.serviciosBase || {}).map(([servicioId, porcentaje]) => ({
      servicioId,
      porcentajeDescuento: porcentaje,
      aplicarDescuento: porcentaje > 0,
    }))
    const otrosServiciosLegacy = Object.entries(granulares.otrosServicios || {}).map(([servicioId, porcentaje]) => ({
      servicioId,
      porcentajeDescuento: porcentaje,
      aplicarDescuento: porcentaje > 0,
    }))
    
    return {
      aplicarAServiciosBase: serviciosBaseLegacy.some(s => s.aplicarDescuento),
      aplicarAOtrosServicios: otrosServiciosLegacy.some(s => s.aplicarDescuento),
      serviciosBase: serviciosBaseLegacy,
      otrosServicios: otrosServiciosLegacy,
    }
  }

  return {
    id: dbSnapshot.id,
    nombre: dbSnapshot.nombre,
    quotationConfigId: dbSnapshot.quotationConfigId || undefined,
    serviciosBase: dbSnapshot.serviciosBase || [],
    paquete: {
      desarrollo: dbSnapshot.desarrollo,
      descuento: dbSnapshot.descuento,
      tipo: dbSnapshot.tipo || '',
      descripcion: dbSnapshot.descripcion || '',
      emoji: dbSnapshot.emoji || '',
      tagline: dbSnapshot.tagline || '',
      tiempoEntrega: dbSnapshot.tiempoEntrega || '',
      // Opciones de pago
      opcionesPago: (dbSnapshot.opcionesPago as any[]) || [],
      // Título y subtítulo para sección de pago en página pública
      tituloSeccionPago: (dbSnapshot as any).tituloSeccionPago || 'Opciones de Pago',
      subtituloSeccionPago: (dbSnapshot as any).subtituloSeccionPago || '',
      // ✅ Sistema de descuentos reinventado
      configDescuentos: configDescuentos,
      descuentoPagoUnico: configDescuentos.descuentoPagoUnico,
      // Método de pago preferido y notas
      metodoPagoPreferido: dbSnapshot.metodoPagoPreferido || '',
      notasPago: dbSnapshot.notasPago || '',
      // Múltiples métodos de pago preferidos
      metodosPreferidos: (dbSnapshot as any).metodosPreferidos || [],
      // @deprecated - Mantener para compatibilidad legacy (formato antiguo con arrays)
      descuentosGenerales: configDescuentos.tipoDescuento === 'general' 
        ? configDescuentos.descuentoGeneral 
        : {
            aplicarAlDesarrollo: false,
            aplicarAServiciosBase: false,
            aplicarAOtrosServicios: false,
            porcentaje: 0,
          },
      descuentosPorServicio: convertirAFormatoLegacy(),
    },
    otrosServicios: dbSnapshot.otrosServicios,
    costos: {
      inicial: dbSnapshot.costoInicial,
      año1: dbSnapshot.costoAño1,
      año2: dbSnapshot.costoAño2,
    },
    activo: dbSnapshot.activo,
    createdAt: dbSnapshot.createdAt,
  }
}

// Obtener snapshots activos (para la página principal)
export async function obtenerSnapshots() {
  try {
    const response = await fetch('/api/snapshots', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error('Error al obtener snapshots')

    const snapshots: SnapshotFromDB[] = await response.json()
    return snapshots.map(convertDBToSnapshot)
  } catch (error) {
    console.error('Error en obtenerSnapshots:', error)
    return []
  }
}

// Obtener todos los snapshots (activos e inactivos) - para administrador
export async function obtenerSnapshotsCompleto() {
  try {
    const response = await fetch('/api/snapshots/all', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Error response from /api/snapshots/all:', response.status, errorData)
      throw new Error(`Error ${response.status}: ${errorData.error || 'Error al obtener snapshots completo'}`)
    }

    const snapshots: any[] = await response.json()
    
    // El endpoint retorna directamente un array de snapshots
    // Convertir cada uno al formato esperado usando convertDBToSnapshot
    return snapshots.map((snapshot: any) => {
      try {
        return convertDBToSnapshot(snapshot as SnapshotFromDB)
      } catch (e) {
        console.error('Error convirtiendo snapshot:', snapshot.id, e)
        return null
      }
    }).filter((s): s is any => s !== null)
  } catch (error) {
    console.error('Error en obtenerSnapshotsCompleto:', error)
    return []
  }
}

// Crear nuevo snapshot
export async function crearSnapshot(snapshot: any) {
  try {
    const datosDB = convertSnapshotToDB(snapshot)
    
    const response = await fetch('/api/snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosDB),
    })

    if (!response.ok) throw new Error('Error al crear snapshot')

    const dbSnapshot: SnapshotFromDB = await response.json()
    return convertDBToSnapshot(dbSnapshot)
  } catch (error) {
    console.error('Error en crearSnapshot:', error)
    throw error
  }
}

// Actualizar snapshot
export async function actualizarSnapshot(idOrSnapshot: string | any, snapshotOptional?: any) {
  try {
    // Soportar ambas formas de llamada:
    // 1. actualizarSnapshot(id, snapshot)
    // 2. actualizarSnapshot(snapshotConId)
    let id: string
    let snapshot: any
    
    if (typeof idOrSnapshot === 'string') {
      // Forma 1: (id, snapshot)
      id = idOrSnapshot
      snapshot = snapshotOptional
    } else {
      // Forma 2: (snapshotConId)
      snapshot = idOrSnapshot
      id = snapshot.id
    }
    
    const datosDB = convertSnapshotToDB(snapshot)
    
    const response = await fetch(`/api/snapshots?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosDB),
    })

    if (!response.ok) throw new Error('Error al actualizar snapshot')

    const dbSnapshot: SnapshotFromDB = await response.json()
    return convertDBToSnapshot(dbSnapshot)
  } catch (error) {
    console.error('Error en actualizarSnapshot:', error)
    throw error
  }
}

// Eliminar snapshot
export async function eliminarSnapshot(id: string) {
  try {
    const response = await fetch(`/api/snapshots?id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) throw new Error('Error al eliminar snapshot')

    return await response.json()
  } catch (error) {
    console.error('Error en eliminarSnapshot:', error)
    throw error
  }
}

