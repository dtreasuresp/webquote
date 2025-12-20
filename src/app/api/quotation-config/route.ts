import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateNextQuotationNumber, updateQuotationVersion } from '@/lib/utils/quotationNumber'
import { requireReadPermission, requireWritePermission } from '@/lib/apiProtection'
import { createAuditLog, generateDiff } from '@/lib/audit/auditHelper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Calcular fecha vencimiento: fechaEmision + tiempoValidez (días)
const calcularFechaVencimiento = (fechaEmision: Date, dias: number): Date => {
  const vencimiento = new Date(fechaEmision)
  vencimiento.setDate(vencimiento.getDate() + dias)
  return vencimiento
}

// GET: Obtener cotización según usuario autenticado
// Requiere: quotations.view (read)
export async function GET(request: NextRequest) {
  // Protección: Requiere permiso de lectura de cotizaciones
  const { session, error, accessLevel } = await requireReadPermission('quotations.view')
  if (error) return error

  try {
    console.log('[AUTH] Usuario autenticado:', session.user.username, 'Role:', session.user.role, 'AccessLevel:', accessLevel)
    
    // Si es SUPER_ADMIN o ADMIN con acceso full, buscar cotización global
    if ((session.user.role === 'SUPER_ADMIN' || session.user.role === 'ADMIN') && !session.user.quotationAssignedId) {
      console.log('[AUDIT] Admin/SuperAdmin sin cotización asignada - Buscando cotización global (isGlobal: true)')
      
      const cotizacion = await prisma.quotationConfig.findFirst({
        where: { isGlobal: true },
        orderBy: { updatedAt: 'desc' },
      })
      
      if (!cotizacion) {
        return NextResponse.json({ error: 'No hay cotización global configurada' }, { status: 404 })
      }

      console.log('[AUDIT] Cotización global encontrada:', cotizacion.numero)
      return NextResponse.json({
        ...cotizacion,
        fechaEmision: cotizacion.fechaEmision.toISOString(),
        fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
        createdAt: cotizacion.createdAt.toISOString(),
        updatedAt: cotizacion.updatedAt.toISOString(),
      })
    }

    // ✅ Filtrar por quotationAssignedId del usuario
    if (!session.user.quotationAssignedId) {
      console.log('[AUTH] Usuario sin cotización asignada:', session.user.username)
      return NextResponse.json(
        {
          success: false,
          code: 'NO_QUOTATION_ASSIGNED',
          error: 'Lo sentimos. Su usuario no tiene cotización asignada. Contacte al administrador.',
        },
        { status: 403 }
      )
    }

    console.log('[AUDIT] Buscando cotización asignada:', session.user.quotationAssignedId)
    
    const cotizacion = await prisma.quotationConfig.findUnique({
      where: { id: session.user.quotationAssignedId },
    })
    
    if (!cotizacion) {
      return NextResponse.json(
        { error: 'Cotización asignada no encontrada' },
        { status: 404 }
      )
    }

    console.log('[AUDIT] Cotización encontrada para usuario:', cotizacion.numero)

    return NextResponse.json({
      ...cotizacion,
      fechaEmision: cotizacion.fechaEmision.toISOString(),
      fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
      createdAt: cotizacion.createdAt.toISOString(),
      updatedAt: cotizacion.updatedAt.toISOString(),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error en GET /api/quotation-config:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Error al obtener cotización' },
      { status: 500 }
    )
  }
}

// POST: Crear nueva cotización
// Requiere: quotations.create (write)
export async function POST(request: NextRequest) {
  // Protección: Requiere permiso de escritura para crear cotizaciones
  const { session, error } = await requireWritePermission('quotations.create')
  if (error) return error

  try {
    const data = await request.json()

    // Obtener último número para generar el siguiente
    const ultimaCotizacion = await prisma.quotationConfig.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { numero: true }
    })
    const numeroGenerado = generateNextQuotationNumber(ultimaCotizacion?.numero || null)
    
    const fechaEmision = new Date(data.fechaEmision || new Date())
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || 30)

    // [AUDIT] Log de creación de cotización
    console.log('[AUDIT] POST /api/quotation-config - Creando nueva cotización')
    console.log('[AUDIT] Número generado:', numeroGenerado)
    console.log('[AUDIT] Stack trace:', new Error('AUDIT_TRACE').stack?.split('\n').slice(0, 5).join('\n'))
    
    const cotizacion = await prisma.quotationConfig.create({
      data: {
        numero: numeroGenerado,
        versionNumber: data.versionNumber || 1,
        fechaEmision,
        tiempoValidez: data.tiempoValidez || 30,
        fechaVencimiento,
        presupuesto: data.presupuesto || '',
        moneda: data.moneda || 'USD',
        empresa: data.empresa || '',
        sector: data.sector || '',
        ubicacion: data.ubicacion || '',
        profesional: data.profesional || '',
        empresaProveedor: data.empresaProveedor || '',
        emailProveedor: data.emailProveedor || '',
        whatsappProveedor: data.whatsappProveedor || '',
        ubicacionProveedor: data.ubicacionProveedor || '',
        tiempoVigenciaValor: data.tiempoVigenciaValor || 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad || 'meses',
        heroTituloMain: data.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
        // Templates reutilizables
        serviciosBaseTemplate: data.serviciosBaseTemplate || null,
        serviciosOpcionalesTemplate: data.serviciosOpcionalesTemplate || null,
        opcionesPagoTemplate: data.opcionesPagoTemplate || null,
        configDescuentosTemplate: data.configDescuentosTemplate || null,
        descripcionesPaqueteTemplates: data.descripcionesPaqueteTemplates || null,
        metodoPagoPreferido: data.metodoPagoPreferido || '',
        notasPago: data.notasPago || '',
        metodosPreferidos: data.metodosPreferidos || null,
        estilosConfig: data.estilosConfig || null,
        // Contenido General Dinámico
        contenidoGeneral: data.contenidoGeneral || null,
      },
    })
    
    console.log('[AUDIT] Cotización creada:', cotizacion.id, cotizacion.numero)

    // Auditar creación usando helper centralizado
    await createAuditLog({
      action: 'QUOTATION_CREATED',
      entityType: 'QUOTATION_CONFIG',
      entityId: cotizacion.id,
      actorId: session.user.id,
      actorName: session.user.nombre || session.user.username || 'Sistema',
      details: {
        numero: cotizacion.numero,
        empresa: cotizacion.empresa,
        versionNumber: cotizacion.versionNumber,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    // FIX: Devolver estructura {success, data} consistente con otros endpoints
    return NextResponse.json(
      {
        success: true,
        data: {
          ...cotizacion,
          fechaEmision: cotizacion.fechaEmision.toISOString(),
          fechaVencimiento: cotizacion.fechaVencimiento.toISOString(),
          createdAt: cotizacion.createdAt.toISOString(),
          updatedAt: cotizacion.updatedAt.toISOString(),
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error en POST /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al crear cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT: Actualizar cotización existente (mantiene número, incrementa versión)
// Requiere: quotations.edit (write)
// CAMBIO 2: Simple UPDATE sin crear nuevas versiones
export async function PUT(request: NextRequest) {
  // Protección: Requiere permiso de escritura para editar cotizaciones
  const { session, error } = await requireWritePermission('quotations.edit')
  if (error) return error

  try {
    // Priorizar cotización activa/global; si no hay, tomar la más reciente
    let cotizacion = await prisma.quotationConfig.findFirst({
      where: {
        OR: [{ isGlobal: true }, { activo: true }],
      },
      orderBy: { updatedAt: 'desc' },
    })

    if (!cotizacion) {
      cotizacion = await prisma.quotationConfig.findFirst({
        orderBy: { createdAt: 'desc' },
      })
    }

    const data = await request.json()
    const id = cotizacion?.id

    if (!id) {
      return NextResponse.json({ error: 'Cotización activa no encontrada' }, { status: 404 })
    }

    const cotizacionActual = await prisma.quotationConfig.findUnique({
      where: { id },
    })
    
    if (!cotizacionActual) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
    }
    
    const fechaEmision = new Date(data.fechaEmision || cotizacionActual.fechaEmision)
    const fechaVencimiento = calcularFechaVencimiento(fechaEmision, data.tiempoValidez || cotizacionActual.tiempoValidez || 30)

    // CAMBIO 2: Simple UPDATE - solo actualizar la cotización actual sin crear versiones
    const cotizacionActualizada = await prisma.quotationConfig.update({
      where: { id },
      data: {
        fechaEmision,
        tiempoValidez: data.tiempoValidez ?? cotizacionActual.tiempoValidez ?? 30,
        fechaVencimiento,
        presupuesto: data.presupuesto ?? cotizacionActual.presupuesto ?? '',
        moneda: data.moneda ?? cotizacionActual.moneda ?? 'USD',
        empresa: data.empresa ?? cotizacionActual.empresa ?? '',
        sector: data.sector ?? cotizacionActual.sector ?? '',
        ubicacion: data.ubicacion ?? cotizacionActual.ubicacion ?? '',
        emailCliente: data.emailCliente ?? cotizacionActual.emailCliente ?? '',
        whatsappCliente: data.whatsappCliente ?? cotizacionActual.whatsappCliente ?? '',
        profesional: data.profesional ?? cotizacionActual.profesional ?? '',
        empresaProveedor: data.empresaProveedor ?? cotizacionActual.empresaProveedor ?? '',
        emailProveedor: data.emailProveedor ?? cotizacionActual.emailProveedor ?? '',
        whatsappProveedor: data.whatsappProveedor ?? cotizacionActual.whatsappProveedor ?? '',
        ubicacionProveedor: data.ubicacionProveedor ?? cotizacionActual.ubicacionProveedor ?? '',
        tiempoVigenciaValor: data.tiempoVigenciaValor ?? cotizacionActual.tiempoVigenciaValor ?? 12,
        tiempoVigenciaUnidad: data.tiempoVigenciaUnidad ?? cotizacionActual.tiempoVigenciaUnidad ?? 'meses',
        // CAMBIO 1: Garantizar que heroTituloMain y heroTituloSub siempre se actualizan
        heroTituloMain: data.heroTituloMain ?? cotizacionActual.heroTituloMain ?? 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: data.heroTituloSub ?? cotizacionActual.heroTituloSub ?? 'PÁGINA CATÁLOGO DINÁMICA',
        // Mantener templates existentes si no vienen nuevos
        serviciosBaseTemplate: data.serviciosBaseTemplate ?? cotizacionActual.serviciosBaseTemplate ?? null,
        serviciosOpcionalesTemplate: data.serviciosOpcionalesTemplate ?? cotizacionActual.serviciosOpcionalesTemplate ?? null,
        opcionesPagoTemplate: data.opcionesPagoTemplate ?? cotizacionActual.opcionesPagoTemplate ?? null,
        configDescuentosTemplate: data.configDescuentosTemplate ?? cotizacionActual.configDescuentosTemplate ?? null,
        descripcionesPaqueteTemplates: data.descripcionesPaqueteTemplates ?? cotizacionActual.descripcionesPaqueteTemplates ?? null,
        metodoPagoPreferido: data.metodoPagoPreferido ?? cotizacionActual.metodoPagoPreferido ?? '',
        notasPago: data.notasPago ?? cotizacionActual.notasPago ?? '',
        metodosPreferidos: data.metodosPreferidos ?? cotizacionActual.metodosPreferidos ?? null,
        estilosConfig: data.estilosConfig ?? cotizacionActual.estilosConfig ?? null,
        contenidoGeneral: data.contenidoGeneral ?? cotizacionActual.contenidoGeneral ?? null,
        // Mantener isGlobal: true para que siga siendo la cotización activa
        isGlobal: true,
      },
    })

    // Generar diff de cambios principales
    const allowedFields = ['empresa', 'sector', 'profesional', 'emailCliente', 'heroTituloMain', 'heroTituloSub']
    const diff = generateDiff(
      {
        empresa: cotizacionActual.empresa || '',
        sector: cotizacionActual.sector || '',
        profesional: cotizacionActual.profesional || '',
        emailCliente: cotizacionActual.emailCliente || '',
        heroTituloMain: cotizacionActual.heroTituloMain || 'PROPUESTA DE COTIZACIÓN',
        heroTituloSub: cotizacionActual.heroTituloSub || 'PÁGINA CATÁLOGO DINÁMICA',
      },
      {
        empresa: cotizacionActualizada.empresa,
        sector: cotizacionActualizada.sector,
        profesional: cotizacionActualizada.profesional,
        emailCliente: cotizacionActualizada.emailCliente,
        heroTituloMain: cotizacionActualizada.heroTituloMain,
        heroTituloSub: cotizacionActualizada.heroTituloSub,
      },
      allowedFields
    )

    // Auditar actualización usando helper centralizado
    await createAuditLog({
      action: 'QUOTATION_UPDATED',
      entityType: 'QUOTATION_CONFIG',
      entityId: cotizacionActualizada.id,
      actorId: session.user.id,
      actorName: session.user.nombre || session.user.username || 'Sistema',
      details: diff,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({
      ...cotizacionActualizada,
      fechaEmision: cotizacionActualizada.fechaEmision.toISOString(),
      fechaVencimiento: cotizacionActualizada.fechaVencimiento.toISOString(),
      createdAt: cotizacionActualizada.createdAt.toISOString(),
      updatedAt: cotizacionActualizada.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error en PUT /api/quotation-config:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cotización', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
