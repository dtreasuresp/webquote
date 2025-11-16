// Tipos compartidos para el administrador y otras páginas

export interface ServicioBase {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface GestionConfig {
  precio: number
  mesesGratis: number
  mesesPago: number
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
}

export interface Servicio {
  id: string
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export interface OtroServicio {
  nombre: string
  precio: number
  mesesGratis: number
  mesesPago: number
}

export type OtroServicioSnapshot = OtroServicio

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
  }
  otrosServicios: OtroServicioSnapshot[]
  costos: {
    inicial: number
    año1: number
    año2: number
  }
  activo: boolean
  createdAt: string
}
