import jsPDF from 'jspdf'
import type { PackageSnapshot } from '@/lib/types'
import { calcularPreviewDescuentos } from '@/lib/utils/discountCalculator'

// Colores corporativos RGB
const COLORS = {
  primary: { r: 220, g: 38, b: 38 }, // #DC2626
  accent: { r: 252, g: 211, b: 77 }, // #FCD34D
  dark: { r: 31, g: 41, b: 55 }, // neutral-800
  light: { r: 243, g: 244, b: 246 }, // neutral-100
}

/**
 * Obtiene el descuento efectivo a mostrar en el PDF
 * Usa el nuevo sistema configDescuentos si está disponible
 */
function getEffectiveDiscountForPDF(snapshot: PackageSnapshot): { value: number; label: string } | null {
  const config = snapshot.paquete.configDescuentos
  
  if (!config || config.tipoDescuento === 'ninguno') {
    return null
  }

  if (config.tipoDescuento === 'general') {
    return {
      value: config.descuentoGeneral.porcentaje,
      label: `Descuento General: ${config.descuentoGeneral.porcentaje}%`
    }
  }

  if (config.tipoDescuento === 'granular') {
    const preview = calcularPreviewDescuentos(snapshot)
    const ahorro = preview.porcentajeAhorro
    return {
      value: ahorro,
      label: `Descuentos Aplicados (Ahorro: ${ahorro.toFixed(1)}%)`
    }
  }

  return null
}

export function generateSnapshotPDF(snapshot: PackageSnapshot): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPosition = 20

  // Encabezado rojo
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.rect(0, 0, 210, 40, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESUPUESTO', 20, 20)
  doc.setFontSize(16)
  doc.text(snapshot.nombre, 20, 32)

  // Fecha
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${new Date(snapshot.createdAt).toLocaleDateString('es-ES')}`, 20, 38)

  // Contenido
  yPosition = 50

  // Sección: Información General
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('📋 Información General', 20, yPosition)
  yPosition += 8

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tipo: ${snapshot.paquete.tipo || 'No especificado'}`, 20, yPosition)
  yPosition += 6
  doc.text(`Descripción: ${snapshot.paquete.descripcion || 'Sin descripción'}`, 20, yPosition)
  yPosition += 10

  // Sección: Paquete
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('🎯 Paquete Base', 20, yPosition)
  yPosition += 8

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Desarrollo: $${snapshot.paquete.desarrollo.toFixed(2)}`, 20, yPosition)
  yPosition += 6
  const descuentoInfo = getEffectiveDiscountForPDF(snapshot)
  if (descuentoInfo) {
    doc.text(`${descuentoInfo.label}`, 20, yPosition)
    yPosition += 6
  }
  yPosition += 4

  // Sección: Servicios Base
  if (snapshot.serviciosBase.length > 0) {
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🌐 Servicios Base', 20, yPosition)
    yPosition += 8

    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    snapshot.serviciosBase.forEach(servicio => {
      doc.text(`• ${servicio.nombre}: $${servicio.precio.toFixed(2)} (${servicio.mesesPago} meses)`, 20, yPosition)
      yPosition += 5
    })
    yPosition += 4
  }

  // Sección: Servicios Opcionales
  if (snapshot.otrosServicios.length > 0) {
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🎨 Servicios Opcionales', 20, yPosition)
    yPosition += 8

    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    snapshot.otrosServicios.forEach(servicio => {
      doc.text(`• ${servicio.nombre}: $${servicio.precio.toFixed(2)} (${servicio.mesesPago} meses)`, 20, yPosition)
      yPosition += 5
    })
    yPosition += 4
  }

  // Tabla de Costos
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  const tableY = yPosition
  doc.rect(20, tableY, 170, 8, 'F')
  doc.text('RESUMEN DE COSTOS', 25, tableY + 6)
  yPosition = tableY + 12

  const costos = [
    { label: 'Pago Inicial', valor: snapshot.costos.inicial },
    { label: 'Año 1 (12 meses)', valor: snapshot.costos.año1 },
    { label: 'Año 2+ (12 meses)', valor: snapshot.costos.año2 },
  ]

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  costos.forEach(costo => {
    doc.text(costo.label, 20, yPosition)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${costo.valor.toFixed(2)}`, 160, yPosition, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    yPosition += 8
  })

  // Pie de página
  const pageHeight = doc.internal.pageSize.height
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(
    '© URBANISMA CONSTRUCTORA - Propuesta de Presupuesto',
    20,
    pageHeight - 10,
    { align: 'left' }
  )
  doc.text(
    `Página 1 de 1`,
    190,
    pageHeight - 10,
    { align: 'right' }
  )

  // Descargar
  doc.save(`presupuesto-${snapshot.nombre}-${Date.now()}.pdf`)
}

export function generateSnapshotPDFBlob(snapshot: PackageSnapshot): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  let yPosition = 20

  // Encabezado rojo
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.rect(0, 0, 210, 40, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('PRESUPUESTO', 20, 20)
  doc.setFontSize(16)
  doc.text(snapshot.nombre, 20, 32)

  // Fecha
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha: ${new Date(snapshot.createdAt).toLocaleDateString('es-ES')}`, 20, 38)

  // Contenido
  yPosition = 50

  // Sección: Información General
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('📋 Información General', 20, yPosition)
  yPosition += 8

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Tipo: ${snapshot.paquete.tipo || 'No especificado'}`, 20, yPosition)
  yPosition += 6
  doc.text(`Descripción: ${snapshot.paquete.descripcion || 'Sin descripción'}`, 20, yPosition)
  yPosition += 10

  // Sección: Paquete
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('🎯 Paquete Base', 20, yPosition)
  yPosition += 8

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Desarrollo: $${snapshot.paquete.desarrollo.toFixed(2)}`, 20, yPosition)
  yPosition += 6
  const descuentoInfoBlob = getEffectiveDiscountForPDF(snapshot)
  if (descuentoInfoBlob) {
    doc.text(`${descuentoInfoBlob.label}`, 20, yPosition)
    yPosition += 6
  }
  yPosition += 4

  // Sección: Servicios Base
  if (snapshot.serviciosBase.length > 0) {
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🌐 Servicios Base', 20, yPosition)
    yPosition += 8

    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    snapshot.serviciosBase.forEach(servicio => {
      doc.text(`• ${servicio.nombre}: $${servicio.precio.toFixed(2)} (${servicio.mesesPago} meses)`, 20, yPosition)
      yPosition += 5
    })
    yPosition += 4
  }

  // Sección: Servicios Opcionales
  if (snapshot.otrosServicios.length > 0) {
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('🎨 Servicios Opcionales', 20, yPosition)
    yPosition += 8

    doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    snapshot.otrosServicios.forEach(servicio => {
      doc.text(`• ${servicio.nombre}: $${servicio.precio.toFixed(2)} (${servicio.mesesPago} meses)`, 20, yPosition)
      yPosition += 5
    })
    yPosition += 4
  }

  // Tabla de Costos
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b)
  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')

  const tableY = yPosition
  doc.rect(20, tableY, 170, 8, 'F')
  doc.text('RESUMEN DE COSTOS', 25, tableY + 6)
  yPosition = tableY + 12

  const costos = [
    { label: 'Pago Inicial', valor: snapshot.costos.inicial },
    { label: 'Año 1 (12 meses)', valor: snapshot.costos.año1 },
    { label: 'Año 2+ (12 meses)', valor: snapshot.costos.año2 },
  ]

  doc.setTextColor(COLORS.dark.r, COLORS.dark.g, COLORS.dark.b)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  costos.forEach(costo => {
    doc.text(costo.label, 20, yPosition)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${costo.valor.toFixed(2)}`, 160, yPosition, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    yPosition += 8
  })

  // Pie de página
  const pageHeight = doc.internal.pageSize.height
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text(
    '© URBANISMA CONSTRUCTORA - Propuesta de Presupuesto',
    20,
    pageHeight - 10,
    { align: 'left' }
  )
  doc.text(
    `Página 1 de 1`,
    190,
    pageHeight - 10,
    { align: 'right' }
  )

  // Retornar Blob
  return doc.output('blob')
}
