/**
 * Utilidades para gestionar snapshots a través de la API
 */

export interface SnapshotFromDB {
  id: string
  nombre: string
  hostingPrice: number
  mailboxPrice: number
  dominioPrice: number
  mesesGratis: number
  mesesPago: number
  gestionPrecio: number
  gestionMesesGratis: number
  gestionMesesPago: number
  desarrollo: number
  descuento: number
  otrosServicios: any[]
  costoInicial: number
  costoAño1: number
  costoAño2: number
  activo: boolean
  createdAt: string
  updatedAt: string
}

// Convertir de formato frontend (PackageSnapshot) a formato DB (SnapshotFromDB)
export function convertSnapshotToDB(snapshot: any): Omit<SnapshotFromDB, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    nombre: snapshot.nombre || '',
    hostingPrice: snapshot.servicios?.hosting || 0,
    mailboxPrice: snapshot.servicios?.mailbox || 0,
    dominioPrice: snapshot.servicios?.dominio || 0,
    mesesGratis: snapshot.servicios?.mesesGratis || 0,
    mesesPago: snapshot.servicios?.mesesPago || 0,
    gestionPrecio: snapshot.gestion?.precio || 0,
    gestionMesesGratis: snapshot.gestion?.mesesGratis || 0,
    gestionMesesPago: snapshot.gestion?.mesesPago || 0,
    desarrollo: snapshot.paquete?.desarrollo || 0,
    descuento: snapshot.paquete?.descuento || 0,
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
    servicios: {
      hosting: dbSnapshot.hostingPrice,
      mailbox: dbSnapshot.mailboxPrice,
      dominio: dbSnapshot.dominioPrice,
      mesesGratis: dbSnapshot.mesesGratis,
      mesesPago: dbSnapshot.mesesPago,
    },
    gestion: {
      precio: dbSnapshot.gestionPrecio,
      mesesGratis: dbSnapshot.gestionMesesGratis,
      mesesPago: dbSnapshot.gestionMesesPago,
    },
    paquete: {
      desarrollo: dbSnapshot.desarrollo,
      descuento: dbSnapshot.descuento,
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

// Obtener todos los snapshots
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

