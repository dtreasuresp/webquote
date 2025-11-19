/**
 * Utilidades para gestionar snapshots a través de la API
 */
import type { ServicioBase } from '@/lib/types'


export interface SnapshotFromDB {
  id: string
  nombre: string
  serviciosBase: ServicioBase[]
  gestionPrecio: number
  gestionMesesGratis: number
  gestionMesesPago: number
  desarrollo: number
  descuento: number
  tipo?: string
  descripcion?: string
  emoji?: string
  tagline?: string
  tiempoEntrega?: string
  // Nuevos campos en BD para opciones de pago
  opcionesPago?: any
  descuentoPagoUnico?: number
  otrosServicios: any[]
  costoInicial: number
  costoAño1: number
  costoAño2: number
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
  return {
    nombre: snapshot.nombre || '',
    serviciosBase: migrarServiciosLegacy(snapshot),
    gestionPrecio: snapshot.gestion?.precio || 0,
    gestionMesesGratis: snapshot.gestion?.mesesGratis || 0,
    gestionMesesPago: snapshot.gestion?.mesesPago || 0,
    desarrollo: snapshot.paquete?.desarrollo || 0,
    descuento: snapshot.paquete?.descuento || 0,
    tipo: snapshot.paquete?.tipo || '',
    descripcion: snapshot.paquete?.descripcion || '',
    emoji: snapshot.paquete?.emoji || '',
    tagline: snapshot.paquete?.tagline || '',
    tiempoEntrega: snapshot.paquete?.tiempoEntrega || '',
    // Mapear opciones de pago desde el objeto paquete del frontend a columnas de BD
    opcionesPago: snapshot.paquete?.opcionesPago || [],
    descuentoPagoUnico: snapshot.paquete?.descuentoPagoUnico ?? 0,
    otrosServicios: snapshot.otrosServicios || [],
    costoInicial: snapshot.costos?.inicial || 0,
    costoAño1: snapshot.costos?.año1 || 0,
    costoAño2: snapshot.costos?.año2 || 0,
    activo: snapshot.activo !== false,
  }
}

// Convertir datos de DB a formato PackageSnapshot del frontend
export function convertDBToSnapshot(dbSnapshot: SnapshotFromDB) {
  return {
    id: dbSnapshot.id,
    nombre: dbSnapshot.nombre,
    serviciosBase: dbSnapshot.serviciosBase || [],
    gestion: {
      precio: dbSnapshot.gestionPrecio,
      mesesGratis: dbSnapshot.gestionMesesGratis,
      mesesPago: dbSnapshot.gestionMesesPago,
    },
    paquete: {
      desarrollo: dbSnapshot.desarrollo,
      descuento: dbSnapshot.descuento,
      tipo: dbSnapshot.tipo || '',
      descripcion: dbSnapshot.descripcion || '',
      emoji: dbSnapshot.emoji || '',
      tagline: dbSnapshot.tagline || '',
      tiempoEntrega: dbSnapshot.tiempoEntrega || '',
      // Incluir opciones de pago en el objeto paquete para el frontend
      opcionesPago: (dbSnapshot.opcionesPago as any[]) || [],
      descuentoPagoUnico: dbSnapshot.descuentoPagoUnico ?? 0,
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
    })

    if (!response.ok) throw new Error('Error al obtener snapshots completo')

    const snapshots: SnapshotFromDB[] = await response.json()
    return snapshots.map(convertDBToSnapshot)
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
export async function actualizarSnapshot(id: string, snapshot: any) {
  try {
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

