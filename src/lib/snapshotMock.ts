// Mock para desarrollo - simula las funciones serverless
// NO usa localStorage - mantiene datos solo en memoria durante la sesión
// Para persistencia real, usar la API de snapshots

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

// Almacenamiento en memoria (solo para desarrollo/testing)
let memorySnapshots: SnapshotFromDB[] = []

export function getLocalSnapshots(): SnapshotFromDB[] {
  return memorySnapshots
}

export function saveLocalSnapshots(snapshots: SnapshotFromDB[]): void {
  memorySnapshots = [...snapshots]
}

export function clearLocalSnapshots(): void {
  memorySnapshots = []
}

export function createId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export async function mockGetSnapshots(): Promise<SnapshotFromDB[]> {
  const snapshots = getLocalSnapshots()
  return snapshots.filter(s => s.activo)
}

export async function mockCreateSnapshot(snapshot: any): Promise<SnapshotFromDB> {
  const now = new Date().toISOString()
  const newSnapshot: SnapshotFromDB = {
    id: createId(),
    nombre: snapshot.nombre || 'Sin nombre',
    hostingPrice: snapshot.hostingPrice || 0,
    mailboxPrice: snapshot.mailboxPrice || 0,
    dominioPrice: snapshot.dominioPrice || 0,
    mesesGratis: snapshot.mesesGratis || 0,
    mesesPago: snapshot.mesesPago || 0,
    gestionPrecio: snapshot.gestionPrecio || 0,
    gestionMesesGratis: snapshot.gestionMesesGratis || 0,
    gestionMesesPago: snapshot.gestionMesesPago || 0,
    desarrollo: snapshot.desarrollo || 0,
    descuento: snapshot.descuento || 0,
    otrosServicios: snapshot.otrosServicios || {},
    costoInicial: snapshot.costoInicial || 0,
    costoAño1: snapshot.costoAño1 || 0,
    costoAño2: snapshot.costoAño2 || 0,
    activo: true,
    createdAt: now,
    updatedAt: now,
  }
  
  const all = getLocalSnapshots()
  all.push(newSnapshot)
  saveLocalSnapshots(all)
  return newSnapshot
}

export async function mockUpdateSnapshot(id: string, snapshot: any): Promise<SnapshotFromDB> {
  const all = getLocalSnapshots()
  const index = all.findIndex(s => s.id === id)
  if (index === -1) throw new Error('Not found')
  
  const updated = {
    ...all[index],
    ...snapshot,
    id: all[index].id,
    createdAt: all[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  
  all[index] = updated
  saveLocalSnapshots(all)
  return updated
}

export async function mockDeleteSnapshot(id: string): Promise<SnapshotFromDB> {
  const all = getLocalSnapshots()
  const index = all.findIndex(s => s.id === id)
  if (index === -1) throw new Error('Not found')
  
  all[index].activo = false
  saveLocalSnapshots(all)
  return all[index]
}
