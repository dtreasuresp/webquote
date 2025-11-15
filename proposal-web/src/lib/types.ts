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
