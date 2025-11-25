'use client'

import type { QuotationConfig } from '@/lib/types'

export function useCotizacionValidation(
  cotizacionConfig: QuotationConfig | null,
  serviciosBase: any[],
  paqueteActual: any,
  snapshots: any[],
  activePageTab: string,
  setActivePageTab: (tab: string) => void,
  setEstadoValidacionTabs: (state: any) => void
) {
  // Formatear fecha ISO a "largo" (ej: "20 de noviembre de 2025")
  const formatearFechaLarga = (isoString: string): string => {
    const fecha = new Date(isoString)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`
  }

  // Calcular fecha vencimiento: fechaEmision + tiempoValidez (días)
  const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
    const vencimiento = new Date(fechaEmision)
    vencimiento.setDate(vencimiento.getDate() + dias)
    return vencimiento
  }

  // Validar email
  const validarEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  // Validar teléfono WhatsApp (básico: +XXX XXXXXXXXX)
  const validarWhatsApp = (whatsapp: string): boolean => {
    const regex = /^\+\d{1,3}\s?\d{6,14}$/
    return regex.test(whatsapp.replace(/\s/g, ''))
  }

  // Validar que vencimiento > emisión
  const validarFechas = (emisión: string, vencimiento: string): boolean => {
    return new Date(vencimiento) > new Date(emisión)
  }

  /**
   * Valida TAB Cotización: Campos requeridos con datos correctos
   */
  const validarTabCotizacion = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!cotizacionConfig?.empresa?.trim()) {
      errores.push('Empresa requerida')
    }
    if (!cotizacionConfig?.profesional?.trim()) {
      errores.push('Profesional requerido')
    }
    if (!cotizacionConfig?.sector?.trim()) {
      errores.push('Sector requerido')
    }
    if (!cotizacionConfig?.ubicacion?.trim()) {
      errores.push('Ubicación cliente requerida')
    }
    if (cotizacionConfig?.emailProveedor && !validarEmail(cotizacionConfig.emailProveedor)) {
      errores.push('Email proveedor inválido')
    }
    if (cotizacionConfig?.whatsappProveedor && !validarWhatsApp(cotizacionConfig.whatsappProveedor)) {
      errores.push('WhatsApp proveedor inválido')
    }
    if (cotizacionConfig && !validarFechas(cotizacionConfig.fechaEmision, cotizacionConfig.fechaVencimiento)) {
      errores.push('Fecha vencimiento debe ser mayor a emisión')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Oferta: Servicios base + descripción paquete requeridos
   */
  const validarTabOferta = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!serviciosBase || serviciosBase.length === 0) {
      errores.push('Debe haber al menos un servicio base')
    }
    if (!paqueteActual?.nombre?.trim()) {
      errores.push('Descripción del paquete (nombre) es requerida')
    }
    if (!paqueteActual?.descripcion?.trim()) {
      errores.push('Descripción detallada del paquete es requerida')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Paquetes: Debe haber al menos 1 paquete
   */
  const validarTabPaquetes = (): { valido: boolean; errores: string[] } => {
    const errores: string[] = []

    if (!snapshots || snapshots.filter((s: any) => s.activo).length === 0) {
      errores.push('Debe crear al menos un paquete activo')
    }

    return {
      valido: errores.length === 0,
      errores,
    }
  }

  /**
   * Valida TAB Estilos: Simplemente verifica que el TAB exista
   */
  const validarTabEstilos = (): { valido: boolean; errores: string[] } => {
    return {
      valido: true,
      errores: [],
    }
  }

  /**
   * Actualiza estado de validación de todos los TABs
   */
  const actualizarEstadoValidacionTabs = () => {
    const estadoCotizacion = validarTabCotizacion()
    const estadoOferta = validarTabOferta()
    const estadoPaquetes = validarTabPaquetes()
    const estadoEstilos = validarTabEstilos()

    setEstadoValidacionTabs({
      cotizacion: estadoCotizacion.valido ? 'ok' : 'error',
      oferta: estadoOferta.valido ? 'ok' : 'error',
      paquetes: estadoPaquetes.valido ? 'ok' : 'error',
      estilos: estadoEstilos.valido ? 'ok' : 'error',
    })
  }

  /**
   * Interceptor de cambio de TAB: valida antes de cambiar
   */
  const handleCambioTab = (nuevoTab: string) => {
    const tabActual = activePageTab
    
    // Validar TAB ACTUAL antes de salir
    let resultado: { valido: boolean; errores: string[] } | null = null

    if (tabActual === 'cotizacion') {
      resultado = validarTabCotizacion()
    } else if (tabActual === 'oferta') {
      resultado = validarTabOferta()
    } else if (tabActual === 'paquetes') {
      resultado = validarTabPaquetes()
    } else if (tabActual === 'estilos') {
      resultado = validarTabEstilos()
    }

    if (resultado && !resultado.valido) {
      alert(`Por favor completa los campos requeridos:\n\n${resultado.errores.join('\n')}`)
      return
    }

    // FASE 15: Validar DEPENDENCIAS del TAB DESTINO
    // Antes de entrar a "Paquetes": validar que existe descripción
    if (nuevoTab === 'paquetes') {
      const valOferta = validarTabOferta()
      if (!valOferta.valido) {
        alert(`Completa Oferta primero:\n\n${valOferta.errores.join('\n')}`)
        return
      }
    }

    // Antes de entrar a "Estilos": validar que existe al menos 1 paquete
    if (nuevoTab === 'estilos') {
      const valPaquetes = validarTabPaquetes()
      if (!valPaquetes.valido) {
        alert(`Completa Paquetes primero:\n\n${valPaquetes.errores.join('\n')}`)
        return
      }
    }

    // Si pasó validación, cambiar TAB
    setActivePageTab(nuevoTab)
    
    // Actualizar validación del nuevo TAB
    actualizarEstadoValidacionTabs()
  }

  return {
    formatearFechaLarga,
    calcularFechaVencimiento,
    validarEmail,
    validarWhatsApp,
    validarFechas,
    validarTabCotizacion,
    validarTabOferta,
    validarTabPaquetes,
    validarTabEstilos,
    actualizarEstadoValidacionTabs,
    handleCambioTab,
  }
}
