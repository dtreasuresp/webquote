import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateQuotationVersion } from '@/lib/utils/quotationNumber'
import { Prisma } from '@prisma/client'

// Tipo para el snapshot de paquetes
interface PackageSnapshotData {
  id: string
  nombre: string
  descripcion?: string | null
  inversion?: number
  [key: string]: unknown
}

/**
 * Compara dos arrays de snapshots de paquetes
 * Retorna información detallada de las diferencias
 */
function compararSnapshots(
  snapshotActual: PackageSnapshotData[] | null,
  snapshotHistorico: PackageSnapshotData[] | null
): {
  sonIguales: boolean
  diferencias: {
    paquete: string
    campo: string
    valorActual: unknown
    valorHistorico: unknown
  }[]
  resumen: {
    paquetesActuales: number
    paquetesHistoricos: number
    paquetesModificados: number
    paquetesNuevos: number
    paquetesEliminados: number
  }
} {
  const actual = snapshotActual || []
  const historico = snapshotHistorico || []
  
  const diferencias: {
    paquete: string
    campo: string
    valorActual: unknown
    valorHistorico: unknown
  }[] = []
  
  // Crear mapas por nombre para comparación
  const mapaActual = new Map(actual.map(p => [p.nombre, p]))
  const mapaHistorico = new Map(historico.map(p => [p.nombre, p]))
  
  // Paquetes eliminados (en histórico pero no en actual)
  const paquetesEliminados = historico.filter(p => !mapaActual.has(p.nombre))
  
  // Paquetes nuevos (en actual pero no en histórico)
  const paquetesNuevos = actual.filter(p => !mapaHistorico.has(p.nombre))
  
  // Paquetes modificados
  let paquetesModificados = 0
  
  for (const paqueteActual of actual) {
    const paqueteHistorico = mapaHistorico.get(paqueteActual.nombre)
    if (!paqueteHistorico) continue
    
    // Comparar todos los campos
    const camposAComparar = new Set([
      ...Object.keys(paqueteActual),
      ...Object.keys(paqueteHistorico)
    ])
    
    let modificado = false
    for (const campo of camposAComparar) {
      if (campo === 'id' || campo === 'createdAt' || campo === 'updatedAt') continue
      
      const valorActual = JSON.stringify(paqueteActual[campo])
      const valorHistorico = JSON.stringify(paqueteHistorico[campo])
      
      if (valorActual !== valorHistorico) {
        diferencias.push({
          paquete: paqueteActual.nombre,
          campo,
          valorActual: paqueteActual[campo],
          valorHistorico: paqueteHistorico[campo]
        })
        modificado = true
      }
    }
    
    if (modificado) paquetesModificados++
  }
  
  return {
    sonIguales: diferencias.length === 0 && paquetesNuevos.length === 0 && paquetesEliminados.length === 0,
    diferencias,
    resumen: {
      paquetesActuales: actual.length,
      paquetesHistoricos: historico.length,
      paquetesModificados,
      paquetesNuevos: paquetesNuevos.length,
      paquetesEliminados: paquetesEliminados.length
    }
  }
}

/**
 * Captura un snapshot COMPLETO de los paquetes
 * Primero intenta leer de la tabla PackageSnapshot,
 * si está vacía, usa el campo JSONB packagesSnapshot de QuotationConfig
 */
async function capturarSnapshotPaquetes(quotationConfigId: string): Promise<PackageSnapshotData[]> {
  // Primero intentar leer de la tabla PackageSnapshot
  const paquetesTabla = await prisma.packageSnapshot.findMany({
    where: { quotationConfigId, activo: true },
    orderBy: { createdAt: 'asc' }
  })
  
  // Si hay paquetes en la tabla, usarlos
  if (paquetesTabla.length > 0) {
    console.log(`[capturarSnapshotPaquetes] Usando ${paquetesTabla.length} paquetes de tabla PackageSnapshot`)
    return paquetesTabla.map(p => ({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion,
      tipo: p.tipo,
      emoji: p.emoji,
      tagline: p.tagline,
      tiempoEntrega: p.tiempoEntrega,
      serviciosBase: p.serviciosBase,
      otrosServicios: p.otrosServicios,
      desarrollo: p.desarrollo,
      descuento: p.descuento,
      costoInicial: p.costoInicial,
      costoAño1: p.costoAño1,
      costoAño2: p.costoAño2,
      opcionesPago: p.opcionesPago,
      descuentoPagoUnico: p.descuentoPagoUnico,
      tituloSeccionPago: p.tituloSeccionPago,
      subtituloSeccionPago: p.subtituloSeccionPago,
      configDescuentos: p.configDescuentos,
      descuentosGenerales: p.descuentosGenerales,
      descuentosPorServicio: p.descuentosPorServicio,
      metodoPagoPreferido: p.metodoPagoPreferido,
      notasPago: p.notasPago,
      metodosPreferidos: p.metodosPreferidos,
      activo: p.activo,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }))
  }
  
  // Si la tabla está vacía, usar el campo JSONB packagesSnapshot
  console.log(`[capturarSnapshotPaquetes] Tabla vacía, buscando en campo JSONB...`)
  const config = await prisma.quotationConfig.findUnique({
    where: { id: quotationConfigId },
    select: { packagesSnapshot: true }
  })
  
  if (config?.packagesSnapshot && Array.isArray(config.packagesSnapshot)) {
    console.log(`[capturarSnapshotPaquetes] Usando ${config.packagesSnapshot.length} paquetes de campo JSONB`)
    return config.packagesSnapshot as PackageSnapshotData[]
  }
  
  console.log(`[capturarSnapshotPaquetes] No se encontraron paquetes`)
  return []
}

/**
 * POST /api/quotation-config/restore
 * 
 * [AUDIT] Este endpoint CREA nuevas versiones cuando mode='execute'
 * 
 * Modos de operación:
 * - mode: 'compare' → Compara snapshots y devuelve diferencias (sin ejecutar)
 * - mode: 'execute' → Ejecuta la restauración con la opción de paquetes elegida
 * 
 * Parámetros:
 * - versionId: ID de la versión a restaurar
 * - mode: 'compare' | 'execute'
 * - packageOption: 'historico' | 'actual' (solo en mode: 'execute')
 */
export async function POST(request: NextRequest) {
  // [AUDIT] Log detallado para diagnosticar creación automática
  console.log('[AUDIT] POST /api/quotation-config/restore llamado')
  console.log('[AUDIT] Timestamp:', new Date().toISOString())
  try {
    const body = await request.json()
    const { versionId, mode = 'compare', packageOption } = body
    
    // [AUDIT] Log de parámetros recibidos
    console.log('[AUDIT] Restore params - versionId:', versionId, 'mode:', mode, 'packageOption:', packageOption)
    console.log('[AUDIT] Stack trace:', new Error('AUDIT_TRACE').stack?.split('\n').slice(0, 8).join('\n'))

    if (!versionId) {
      return NextResponse.json({ 
        success: false,
        error: 'versionId requerido' 
      }, { status: 400 })
    }

    // Obtener la versión a restaurar (histórica)
    const versionARestaurar = await prisma.quotationConfig.findUnique({
      where: { id: versionId }
    })

    if (!versionARestaurar) {
      return NextResponse.json({ 
        success: false,
        error: 'Versión no encontrada' 
      }, { status: 404 })
    }

    // Obtener la versión activa actual
    const versionActiva = await prisma.quotationConfig.findFirst({
      where: { isGlobal: true }
    })

    if (!versionActiva) {
      return NextResponse.json({ 
        success: false,
        error: 'No hay versión activa' 
      }, { status: 404 })
    }

    // ========================
    // MODO COMPARACIÓN
    // ========================
    if (mode === 'compare') {
      // Obtener snapshot histórico guardado
      const snapshotHistorico = versionARestaurar.packagesSnapshot as PackageSnapshotData[] | null
      
      // SIEMPRE capturar snapshot fresh de paquetes actuales (no usar el guardado)
      // Esto garantiza comparar con los paquetes REALES que existen ahora
      const snapshotActual = await capturarSnapshotPaquetes(versionActiva.id)
      console.log(`[RESTORE compare] Snapshot actual capturado: ${snapshotActual.length} paquetes`)
      console.log(`[RESTORE compare] Snapshot histórico: ${snapshotHistorico?.length || 0} paquetes`)
      
      // Verificar si la versión histórica tiene snapshot
      if (!snapshotHistorico || snapshotHistorico.length === 0) {
        return NextResponse.json({
          success: true,
          mode: 'compare',
          hasHistoricSnapshot: false,
          warning: 'La versión histórica no tiene snapshot de paquetes guardado',
          canRestorePackages: false,
          versionARestaurar: versionARestaurar.versionNumber,
          versionActual: versionActiva.versionNumber,
        })
      }
      
      // Comparar snapshots
      const comparacion = compararSnapshots(snapshotActual, snapshotHistorico)
      
      return NextResponse.json({
        success: true,
        mode: 'compare',
        hasHistoricSnapshot: true,
        canRestorePackages: true,
        comparacion,
        versionARestaurar: versionARestaurar.versionNumber,
        versionActual: versionActiva.versionNumber,
        snapshotHistorico: snapshotHistorico.map(p => ({ nombre: p.nombre, descripcion: p.descripcion })),
        snapshotActual: snapshotActual?.map(p => ({ nombre: p.nombre, descripcion: p.descripcion })) || [],
      })
    }

    // ========================
    // MODO EJECUCIÓN
    // ========================
    if (mode === 'execute') {
      if (!packageOption || !['historico', 'actual'].includes(packageOption)) {
        return NextResponse.json({ 
          success: false,
          error: 'packageOption requerido: "historico" o "actual"' 
        }, { status: 400 })
      }

      // Calcular nueva versión
      const ultimaVersion = await prisma.quotationConfig.findFirst({
        where: {
          numero: { startsWith: versionARestaurar.numero.replace(/V\d+$/, '') }
        },
        orderBy: { versionNumber: 'desc' },
        select: { versionNumber: true }
      })

      const nuevaVersion = (ultimaVersion?.versionNumber || 1) + 1
      const numeroActualizado = updateQuotationVersion(versionARestaurar.numero, nuevaVersion)

      // Usar transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // PASO 1: Capturar snapshot de la versión activa actual
        const snapshotVersionActiva = await capturarSnapshotPaquetes(versionActiva.id)
        
        // PASO 2: Guardar snapshot en versión activa (que se vuelve histórica)
        await tx.quotationConfig.update({
          where: { id: versionActiva.id },
          data: {
            packagesSnapshot: snapshotVersionActiva as unknown as Prisma.InputJsonValue,
            packagesSnapshotAt: new Date(),
            isGlobal: false
          }
        })

        // PASO 3: Verificar que se guardó el snapshot
        const verificacion = await tx.quotationConfig.findUnique({
          where: { id: versionActiva.id },
          select: { packagesSnapshot: true }
        })
        
        if (!verificacion?.packagesSnapshot && snapshotVersionActiva.length > 0) {
          throw new Error('ABORT: No se pudo guardar el snapshot de la versión activa')
        }

        // PASO 4: Crear nueva versión con datos de la versión a restaurar
        const nuevaCotizacion = await tx.quotationConfig.create({
          data: {
            numero: numeroActualizado,
            versionNumber: nuevaVersion,
            isGlobal: true,
            fechaEmision: new Date(),
            tiempoValidez: versionARestaurar.tiempoValidez,
            fechaVencimiento: new Date(Date.now() + (versionARestaurar.tiempoValidez || 30) * 24 * 60 * 60 * 1000),
            presupuesto: versionARestaurar.presupuesto,
            moneda: versionARestaurar.moneda,
            empresa: versionARestaurar.empresa,
            sector: versionARestaurar.sector,
            ubicacion: versionARestaurar.ubicacion,
            emailCliente: versionARestaurar.emailCliente,
            whatsappCliente: versionARestaurar.whatsappCliente,
            profesional: versionARestaurar.profesional,
            empresaProveedor: versionARestaurar.empresaProveedor,
            emailProveedor: versionARestaurar.emailProveedor,
            whatsappProveedor: versionARestaurar.whatsappProveedor,
            ubicacionProveedor: versionARestaurar.ubicacionProveedor,
            tiempoVigenciaValor: versionARestaurar.tiempoVigenciaValor,
            tiempoVigenciaUnidad: versionARestaurar.tiempoVigenciaUnidad,
            heroTituloMain: versionARestaurar.heroTituloMain,
            heroTituloSub: versionARestaurar.heroTituloSub,
            serviciosBaseTemplate: versionARestaurar.serviciosBaseTemplate as Prisma.InputJsonValue,
            serviciosOpcionalesTemplate: versionARestaurar.serviciosOpcionalesTemplate as Prisma.InputJsonValue,
            opcionesPagoTemplate: versionARestaurar.opcionesPagoTemplate as Prisma.InputJsonValue,
            configDescuentosTemplate: versionARestaurar.configDescuentosTemplate as Prisma.InputJsonValue,
            descripcionesPaqueteTemplates: versionARestaurar.descripcionesPaqueteTemplates as Prisma.InputJsonValue,
            metodoPagoPreferido: versionARestaurar.metodoPagoPreferido,
            notasPago: versionARestaurar.notasPago,
            metodosPreferidos: versionARestaurar.metodosPreferidos as Prisma.InputJsonValue,
            estilosConfig: versionARestaurar.estilosConfig as Prisma.InputJsonValue,
            contenidoGeneral: versionARestaurar.contenidoGeneral as Prisma.InputJsonValue,
            editorState: versionARestaurar.editorState as Prisma.InputJsonValue,
          }
        })

        // PASO 5: Manejar paquetes según la opción elegida
        if (packageOption === 'actual') {
          // Verificar que hay paquetes para reasignar
          const paquetesExistentes = await tx.packageSnapshot.count({
            where: { quotationConfigId: versionActiva.id }
          })
          
          console.log(`[RESTORE execute] Paquetes existentes en versión activa: ${paquetesExistentes}`)
          
          if (paquetesExistentes === 0) {
            // No hay paquetes actuales, intentar recrear desde snapshot de versión activa
            if (snapshotVersionActiva.length > 0) {
              console.log('[RESTORE execute] Recreando paquetes desde snapshot de versión activa...')
              for (const paquete of snapshotVersionActiva) {
                await tx.packageSnapshot.create({
                  data: {
                    nombre: paquete.nombre,
                    descripcion: paquete.descripcion || null,
                    tipo: paquete.tipo as string | null,
                    emoji: paquete.emoji as string | null,
                    tagline: paquete.tagline as string | null,
                    tiempoEntrega: paquete.tiempoEntrega as string | null,
                    serviciosBase: paquete.serviciosBase as Prisma.InputJsonValue,
                    otrosServicios: paquete.otrosServicios as Prisma.InputJsonValue,
                    desarrollo: paquete.desarrollo as number,
                    descuento: paquete.descuento as number,
                    costoInicial: paquete.costoInicial as number,
                    costoAño1: paquete.costoAño1 as number,
                    costoAño2: paquete.costoAño2 as number,
                    opcionesPago: paquete.opcionesPago as Prisma.InputJsonValue,
                    descuentoPagoUnico: paquete.descuentoPagoUnico as number | null,
                    tituloSeccionPago: paquete.tituloSeccionPago as string | null,
                    subtituloSeccionPago: paquete.subtituloSeccionPago as string | null,
                    configDescuentos: paquete.configDescuentos as Prisma.InputJsonValue,
                    descuentosGenerales: paquete.descuentosGenerales as Prisma.InputJsonValue,
                    descuentosPorServicio: paquete.descuentosPorServicio as Prisma.InputJsonValue,
                    metodoPagoPreferido: paquete.metodoPagoPreferido as string | null,
                    notasPago: paquete.notasPago as string | null,
                    metodosPreferidos: paquete.metodosPreferidos as Prisma.InputJsonValue,
                    activo: true,
                    quotationConfigId: nuevaCotizacion.id,
                  }
                })
              }
            } else {
              throw new Error('No hay paquetes activos ni snapshot guardado para restaurar. Use la opción "historico".')
            }
          } else {
            // Opción A: Mantener paquetes actuales → reasignar a nueva versión
            await tx.packageSnapshot.updateMany({
              where: { quotationConfigId: versionActiva.id },
              data: { quotationConfigId: nuevaCotizacion.id }
            })
          }
          
          // Guardar snapshot de los paquetes en la nueva versión
          await tx.quotationConfig.update({
            where: { id: nuevaCotizacion.id },
            data: {
              packagesSnapshot: snapshotVersionActiva as unknown as Prisma.InputJsonValue,
              packagesSnapshotAt: new Date()
            }
          })
        } else {
          // Opción B: Usar paquetes históricos → recrear desde snapshot
          const snapshotHistorico = versionARestaurar.packagesSnapshot as PackageSnapshotData[] | null
          
          if (snapshotHistorico && snapshotHistorico.length > 0) {
            // Eliminar paquetes actuales
            await tx.packageSnapshot.deleteMany({
              where: { quotationConfigId: versionActiva.id }
            })
            
            // Recrear paquetes desde snapshot histórico
            for (const paquete of snapshotHistorico) {
              await tx.packageSnapshot.create({
                data: {
                  nombre: paquete.nombre,
                  descripcion: paquete.descripcion || null,
                  tipo: paquete.tipo as string | null,
                  emoji: paquete.emoji as string | null,
                  tagline: paquete.tagline as string | null,
                  tiempoEntrega: paquete.tiempoEntrega as string | null,
                  serviciosBase: paquete.serviciosBase as Prisma.InputJsonValue,
                  otrosServicios: paquete.otrosServicios as Prisma.InputJsonValue,
                  desarrollo: paquete.desarrollo as number,
                  descuento: paquete.descuento as number,
                  costoInicial: paquete.costoInicial as number,
                  costoAño1: paquete.costoAño1 as number,
                  costoAño2: paquete.costoAño2 as number,
                  opcionesPago: paquete.opcionesPago as Prisma.InputJsonValue,
                  descuentoPagoUnico: paquete.descuentoPagoUnico as number | null,
                  tituloSeccionPago: paquete.tituloSeccionPago as string | null,
                  subtituloSeccionPago: paquete.subtituloSeccionPago as string | null,
                  configDescuentos: paquete.configDescuentos as Prisma.InputJsonValue,
                  descuentosGenerales: paquete.descuentosGenerales as Prisma.InputJsonValue,
                  descuentosPorServicio: paquete.descuentosPorServicio as Prisma.InputJsonValue,
                  metodoPagoPreferido: paquete.metodoPagoPreferido as string | null,
                  notasPago: paquete.notasPago as string | null,
                  metodosPreferidos: paquete.metodosPreferidos as Prisma.InputJsonValue,
                  activo: true,
                  quotationConfigId: nuevaCotizacion.id,
                }
              })
            }
            
            // Guardar snapshot de los paquetes recreados
            await tx.quotationConfig.update({
              where: { id: nuevaCotizacion.id },
              data: {
                packagesSnapshot: snapshotHistorico as unknown as Prisma.InputJsonValue,
                packagesSnapshotAt: new Date()
              }
            })
          }
        }

        return nuevaCotizacion
      }, {
        maxWait: 15000,
        timeout: 60000
      })

      return NextResponse.json({
        success: true,
        mode: 'execute',
        message: `Versión V${versionARestaurar.versionNumber} restaurada como V${nuevaVersion}`,
        packageOption,
        data: {
          ...resultado,
          fechaEmision: resultado.fechaEmision.toISOString(),
          fechaVencimiento: resultado.fechaVencimiento.toISOString(),
          createdAt: resultado.createdAt.toISOString(),
          updatedAt: resultado.updatedAt.toISOString(),
        },
        versionRestaurada: versionARestaurar.versionNumber,
        nuevaVersion: nuevaVersion,
      })
    }

    return NextResponse.json({ 
      success: false,
      error: 'mode inválido: debe ser "compare" o "execute"' 
    }, { status: 400 })

  } catch (error) {
    console.error('Error en POST /api/quotation-config/restore:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error al restaurar versión',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
