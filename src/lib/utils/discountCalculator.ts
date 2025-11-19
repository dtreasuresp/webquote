import type { PackageSnapshot } from '@/lib/types'

export interface CostoPreview {
  desarrollo: number
  desarrolloConDescuento: number
  serviciosBase: {
    total: number
    conDescuento: number
    desglose: Array<{ nombre: string; original: number; conDescuento: number }>
  }
  otrosServicios: {
    total: number
    conDescuento: number
    desglose: Array<{ nombre: string; original: number; conDescuento: number }>
  }
  totalOriginal: number
  totalConDescuentos: number
  totalAhorro: number
  porcentajeAhorro: number
}

/**
 * Calcula el precio de un item con descuentos aplicados
 * @param precio - Precio original
 * @param descuentoGranular - Descuento granular por servicio (%)
 * @param descuentoGeneral - Descuento general aplicable (%)
 * @returns Precio final después de descuentos
 */
function aplicarDescuentos(
  precio: number,
  descuentoGranular: number = 0,
  descuentoGeneral: number = 0
): number {
  // Primero aplicar descuento granular
  let resultado = precio - (precio * descuentoGranular) / 100
  // Luego aplicar descuento general sobre el resultado
  resultado = resultado - (resultado * descuentoGeneral) / 100
  return Math.max(0, resultado)
}

/**
 * Calcula la vista previa completa de montos con descuentos multi-nivel
 */
export function calcularPreviewDescuentos(snapshot: PackageSnapshot): CostoPreview {
  const descuentosGenerales = snapshot.paquete.descuentosGenerales || {
    aplicarAlDesarrollo: false,
    aplicarAServiciosBase: false,
    aplicarAOtrosServicios: false,
    porcentaje: 0,
  }

  const descuentosPorServicio = snapshot.paquete.descuentosPorServicio || {
    aplicarAServiciosBase: false,
    aplicarAOtrosServicios: false,
    serviciosBase: [],
    otrosServicios: [],
  }

  const descuentoPagoUnico = snapshot.paquete.descuentoPagoUnico || 0
  const desarrollo = snapshot.paquete.desarrollo

  // === DESARROLLO ===
  let desarrolloConDescuento = desarrollo

  if (descuentosGenerales.aplicarAlDesarrollo && descuentosGenerales.porcentaje) {
    // Aplicar descuento general al desarrollo
    desarrolloConDescuento = desarrollo - (desarrollo * descuentosGenerales.porcentaje) / 100
    // Aplicar descuento por pago único (solo al desarrollo)
    desarrolloConDescuento =
      desarrolloConDescuento - (desarrolloConDescuento * descuentoPagoUnico) / 100
  }

  // === SERVICIOS BASE ===
  const serviciosBaseDesglose = snapshot.serviciosBase.map(servicio => {
    let precioConDescuento = servicio.precio

    // Buscar descuento granular para este servicio
    if (descuentosPorServicio.aplicarAServiciosBase && descuentosPorServicio.serviciosBase) {
      const descuentoGranular = descuentosPorServicio.serviciosBase.find(
        d => d.servicioId === servicio.id
      )
      if (descuentoGranular?.aplicarDescuento) {
        precioConDescuento = aplicarDescuentos(
          servicio.precio,
          descuentoGranular.porcentajeDescuento,
          descuentosGenerales.aplicarAServiciosBase ? (descuentosGenerales.porcentaje || 0) : 0
        )
      } else if (descuentosGenerales.aplicarAServiciosBase) {
        // Sin descuento granular, pero hay descuento general
        precioConDescuento = aplicarDescuentos(
          servicio.precio,
          0,
          descuentosGenerales.porcentaje || 0
        )
      }
    }

    return {
      nombre: servicio.nombre,
      original: servicio.precio,
      conDescuento: precioConDescuento,
    }
  })

  const serviciosBaseTotal = snapshot.serviciosBase.reduce((sum, s) => sum + s.precio, 0)
  const serviciosBaseConDescuento = serviciosBaseDesglose.reduce(
    (sum, s) => sum + s.conDescuento,
    0
  )

  // === OTROS SERVICIOS ===
  const otrosServiciosDesglose = snapshot.otrosServicios.map((servicio, idx) => {
    let precioConDescuento = servicio.precio

    // Buscar descuento granular para este servicio
    if (descuentosPorServicio.aplicarAOtrosServicios && descuentosPorServicio.otrosServicios) {
      const descuentoGranular = descuentosPorServicio.otrosServicios[idx]
      if (descuentoGranular?.aplicarDescuento) {
        precioConDescuento = aplicarDescuentos(
          servicio.precio,
          descuentoGranular.porcentajeDescuento,
          descuentosGenerales.aplicarAOtrosServicios ? (descuentosGenerales.porcentaje || 0) : 0
        )
      } else if (descuentosGenerales.aplicarAOtrosServicios) {
        // Sin descuento granular, pero hay descuento general
        precioConDescuento = aplicarDescuentos(
          servicio.precio,
          0,
          descuentosGenerales.porcentaje || 0
        )
      }
    }

    return {
      nombre: servicio.nombre,
      original: servicio.precio,
      conDescuento: precioConDescuento,
    }
  })

  const otrosServiciosTotal = snapshot.otrosServicios.reduce((sum, s) => sum + s.precio, 0)
  const otrosServiciosConDescuento = otrosServiciosDesglose.reduce(
    (sum, s) => sum + s.conDescuento,
    0
  )

  // === TOTALES ===
  const totalOriginal = desarrollo + serviciosBaseTotal + otrosServiciosTotal
  const totalConDescuentos = desarrolloConDescuento + serviciosBaseConDescuento + otrosServiciosConDescuento
  const totalAhorro = totalOriginal - totalConDescuentos
  const porcentajeAhorro = totalOriginal > 0 ? (totalAhorro / totalOriginal) * 100 : 0

  return {
    desarrollo,
    desarrolloConDescuento,
    serviciosBase: {
      total: serviciosBaseTotal,
      conDescuento: serviciosBaseConDescuento,
      desglose: serviciosBaseDesglose,
    },
    otrosServicios: {
      total: otrosServiciosTotal,
      conDescuento: otrosServiciosConDescuento,
      desglose: otrosServiciosDesglose,
    },
    totalOriginal,
    totalConDescuentos,
    totalAhorro,
    porcentajeAhorro,
  }
}
