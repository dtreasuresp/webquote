import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateQuotationVersion } from '@/lib/utils/quotationNumber'

const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
  const vencimiento = new Date(fechaEmision)
  vencimiento.setDate(vencimiento.getDate() + dias)
  return vencimiento
}

/**
 * Captura un snapshot COMPLETO de los paquetes activos
 * Incluye TODOS los campos sin excepción para restauración perfecta
 */
async function capturarSnapshotPaquetes(quotationConfigId: string) {
  const paquetes = await prisma.packageSnapshot.findMany({
    where: { quotationConfigId, activo: true },
    orderBy: { createdAt: 'asc' }
  })
  
  // Convertir a JSON plano con TODOS los campos
  return paquetes.map(p => ({
    // Identificación
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    tipo: p.tipo,
    emoji: p.emoji,
    tagline: p.tagline,
    tiempoEntrega: p.tiempoEntrega,
    
    // Servicios
    serviciosBase: p.serviciosBase,
    otrosServicios: p.otrosServicios,
    
    // Paquete/Desarrollo
    desarrollo: p.desarrollo,
    descuento: p.descuento,
    
    // Costos
    costoInicial: p.costoInicial,
    costoAño1: p.costoAño1,
    costoAño2: p.costoAño2,
    
    // Opciones de pago
    opcionesPago: p.opcionesPago,
    descuentoPagoUnico: p.descuentoPagoUnico,
    tituloSeccionPago: p.tituloSeccionPago,
    subtituloSeccionPago: p.subtituloSeccionPago,
    
    // Sistema de descuentos
    configDescuentos: p.configDescuentos,
    descuentosGenerales: p.descuentosGenerales,
    descuentosPorServicio: p.descuentosPorServicio,
    
    // Métodos de pago
    metodoPagoPreferido: p.metodoPagoPreferido,
    notasPago: p.notasPago,
    metodosPreferidos: p.metodosPreferidos,
    
    // Estado
    activo: p.activo,
    
    // Metadata (para referencia)
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
}

/**
 * PUT /api/quotation-config/[id]
 * Crear nueva versión de cotización (preserva historial)
 * 
 * NUEVO FLUJO:
 * 1. Capturar snapshot de paquetes actuales
 * 2. Guardar snapshot en versión anterior (que se vuelve histórica)
 * 3. Crear nueva versión con isGlobal: true
 * 4. Guardar mismo snapshot en nueva versión
 * 5. Reasignar paquetes a nueva versión (NO duplicar)
 * 6. Marcar versión anterior como histórica
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // [AUDIT] Log detallado para diagnosticar creación automática
    console.log('[AUDIT] PUT /api/quotation-config/[id] llamado')
    console.log('[AUDIT] ID origen:', id)
    console.log('[AUDIT] Datos recibidos - empresa:', data.empresa, 'versionNumber:', data.versionNumber)
    console.log('[AUDIT] Stack trace:', new Error('AUDIT_TRACE').stack?.split('\n').slice(0, 8).join('\n'))
    console.log('[API PUT] Iniciando creación de nueva versión para:', id)

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    // Obtener cotización actual
    const cotizacionActual = await prisma.quotationConfig.findUnique({
      where: { id },
    })
    
    if (!cotizacionActual) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }
    
    // Calcular nueva versión
    const nuevaVersion = (cotizacionActual.versionNumber || 1) + 1
    const numeroActualizado = updateQuotationVersion(cotizacionActual.numero, nuevaVersion)
    
    console.log(`[API PUT] Creando versión ${nuevaVersion}: ${cotizacionActual.numero} -> ${numeroActualizado}`)

    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    // PASO 1: Capturar snapshot COMPLETO de paquetes ANTES de cualquier cambio
    console.log('[API PUT] Paso 1: Capturando snapshot de paquetes...')
    const snapshotPaquetes = await capturarSnapshotPaquetes(id)
    const snapshotTimestamp = new Date()
    console.log(`[API PUT] Snapshot capturado: ${snapshotPaquetes.length} paquetes`)

    // USAR TRANSACCIÓN para garantizar atomicidad
    const resultado = await prisma.$transaction(async (tx) => {
      
      // PASO 2: Guardar snapshot en la versión actual (que será histórica)
      console.log('[API PUT] Paso 2: Guardando snapshot en versión anterior...')
      await tx.quotationConfig.update({
        where: { id },
        data: { 
          packagesSnapshot: snapshotPaquetes,
          packagesSnapshotAt: snapshotTimestamp,
          isGlobal: false  // Marcar como histórica
        }
      })

      // PASO 3: Crear nueva versión
      console.log('[API PUT] Paso 3: Creando nueva versión...')
      const nuevaCotizacion = await tx.quotationConfig.create({
        data: {
          numero: numeroActualizado,
          versionNumber: nuevaVersion,
          isGlobal: true,
          fechaEmision,
          tiempoValidez: data.tiempoValidez || 30,
          fechaVencimiento,
          presupuesto: data.presupuesto || '',
          moneda: data.moneda || 'USD',
          empresa: data.empresa || '',
          sector: data.sector || '',
          ubicacion: data.ubicacion || '',
          emailCliente: data.emailCliente || '',
          whatsappCliente: data.whatsappCliente || '',
          profesional: data.profesional || '',
          empresaProveedor: data.empresaProveedor || '',
          emailProveedor: data.emailProveedor || '',
          whatsappProveedor: data.whatsappProveedor || '',
          ubicacionProveedor: data.ubicacionProveedor || '',
          tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
          tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
          heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
          heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
          // Templates
          serviciosBaseTemplate: data.serviciosBaseTemplate ?? cotizacionActual.serviciosBaseTemplate,
          serviciosOpcionalesTemplate: data.serviciosOpcionalesTemplate ?? cotizacionActual.serviciosOpcionalesTemplate,
          opcionesPagoTemplate: data.opcionesPagoTemplate ?? cotizacionActual.opcionesPagoTemplate,
          configDescuentosTemplate: data.configDescuentosTemplate ?? cotizacionActual.configDescuentosTemplate,
          descripcionesPaqueteTemplates: data.descripcionesPaqueteTemplates ?? cotizacionActual.descripcionesPaqueteTemplates,
          metodoPagoPreferido: data.metodoPagoPreferido ?? cotizacionActual.metodoPagoPreferido,
          notasPago: data.notasPago ?? cotizacionActual.notasPago,
          metodosPreferidos: data.metodosPreferidos ?? cotizacionActual.metodosPreferidos,
          estilosConfig: data.estilosConfig ?? cotizacionActual.estilosConfig,
          contenidoGeneral: data.contenidoGeneral ?? cotizacionActual.contenidoGeneral,
          editorState: data.editorState ?? cotizacionActual.editorState,
          // Guardar el mismo snapshot en la nueva versión (para restauración futura)
          packagesSnapshot: snapshotPaquetes,
          packagesSnapshotAt: snapshotTimestamp,
        },
      })
      console.log('[API PUT] Nueva versión creada:', nuevaCotizacion.id)

      // PASO 4: Reasignar paquetes a la nueva versión (NO duplicar)
      console.log('[API PUT] Paso 4: Reasignando paquetes a nueva versión...')
      const reasignados = await tx.packageSnapshot.updateMany({
        where: { quotationConfigId: id },
        data: { quotationConfigId: nuevaCotizacion.id }
      })
      console.log(`[API PUT] ${reasignados.count} paquetes reasignados`)

      // PASO 5: Verificar que el snapshot se guardó correctamente en versión anterior
      console.log('[API PUT] Paso 5: Verificando snapshot guardado...')
      const verificacion = await tx.quotationConfig.findUnique({
        where: { id },
        select: { packagesSnapshot: true, packagesSnapshotAt: true }
      })
      
      if (!verificacion?.packagesSnapshot || !verificacion?.packagesSnapshotAt) {
        throw new Error('ABORT: Snapshot no se guardó correctamente en versión anterior')
      }
      
      const snapshotGuardado = verificacion.packagesSnapshot as unknown[]
      if (snapshotPaquetes.length > 0 && snapshotGuardado.length !== snapshotPaquetes.length) {
        throw new Error(`ABORT: Snapshot incompleto. Esperados: ${snapshotPaquetes.length}, Guardados: ${snapshotGuardado.length}`)
      }
      
      console.log('[API PUT] ✅ Verificación exitosa')

      return nuevaCotizacion
    }, {
      maxWait: 15000,
      timeout: 60000,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...resultado,
        fechaEmision: resultado.fechaEmision.toISOString(),
        fechaVencimiento: resultado.fechaVencimiento.toISOString(),
        createdAt: resultado.createdAt.toISOString(),
        updatedAt: resultado.updatedAt.toISOString(),
      },
      packagesReasigned: snapshotPaquetes.length,
      snapshotSaved: true,
    })
  } catch (error) {
    console.error('Error en PUT /api/quotation-config/[id]:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al crear nueva versión de cotización',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/quotation-config/[id]
 * Obtener cotización por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id },
    })

    if (!cotizacion) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error en GET /api/quotation-config/[id]:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al obtener cotización',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
