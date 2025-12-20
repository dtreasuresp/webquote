import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireReadPermission, requireWritePermission, requireFullPermission } from '@/lib/apiProtection'
import { createAuditLog, generateDiff } from '@/lib/audit/auditHelper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { session, error, accessLevel } = await requireReadPermission('packages.view')
  if (error) return error

  try {
    console.log('[AUTH] Usuario autenticado:', session.user.username, 'Access Level:', accessLevel)
    
    // Determinar si puede ver todos los snapshots basado en accessLevel
    const canViewAll = accessLevel === 'full' || session.user.role === 'SUPER_ADMIN'
    
    if (canViewAll && !session.user.quotationAssignedId) {
      console.log('[AUDIT] Usuario con acceso completo - Retornando todos los snapshots activos')
      
      const snapshots = await prisma.packageSnapshot.findMany({
        where: { activo: true },
        orderBy: { createdAt: 'desc' },
      })
      
      return NextResponse.json(snapshots)
    }

    // Filtrar por quotationConfigId del usuario
    if (!session.user.quotationAssignedId) {
      console.log('[AUTH] Usuario sin cotización asignada - Retornando array vacío')
      return NextResponse.json([])
    }

    console.log('[AUDIT] Filtrando snapshots por quotationConfigId:', session.user.quotationAssignedId)
    
    const snapshots = await prisma.packageSnapshot.findMany({
      where: { 
        activo: true,
        quotationConfigId: session.user.quotationAssignedId 
      },
      orderBy: { createdAt: 'desc' },
    })
    
    console.log('[AUDIT] Snapshots encontrados:', snapshots.length)
    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Error en GET /api/snapshots:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('Message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error al obtener snapshots', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireWritePermission('packages.manage')
  if (error) return error

  try {
    const data = await request.json()
    // Nuevo esquema: serviciosBase (JSON) + gestion* + desarrollo/ descuento + costos
      const snapshot = await prisma.packageSnapshot.create({
        data: {
          nombre: data.nombre || '',
          quotationConfigId: data.quotationConfigId || null, // ✅ Guardar quotationConfigId desde el request
          serviciosBase: data.serviciosBase || [],
          desarrollo: data.desarrollo || 0,
          descuento: data.descuento || 0,
          tipo: data.tipo || '',
          descripcion: data.descripcion || '',
          emoji: data.emoji || '',
          tagline: data.tagline || '',
          tiempoEntrega: data.tiempoEntrega || '',
          opcionesPago: data.opcionesPago || [],
          // Título y subtítulo para sección de pago
          tituloSeccionPago: data.tituloSeccionPago || 'Opciones de Pago',
          subtituloSeccionPago: data.subtituloSeccionPago || '',
          descuentoPagoUnico: data.descuentoPagoUnico || 0,
          // Sistema de descuentos
          configDescuentos: data.configDescuentos || null,
          // Método de pago y notas (condicional para compatibilidad)
          ...(data.metodoPagoPreferido !== undefined && { metodoPagoPreferido: data.metodoPagoPreferido }),
          ...(data.notasPago !== undefined && { notasPago: data.notasPago }),
          // Métodos preferidos (nuevo array)
          ...(data.metodosPreferidos !== undefined && { metodosPreferidos: data.metodosPreferidos }),
          descuentosGenerales: data.descuentosGenerales || null,
          descuentosPorServicio: data.descuentosPorServicio || null,
          otrosServicios: data.otrosServicios || [],
          costoInicial: data.costoInicial || 0,
          costoAño1: data.costoAño1 || data.costoAnio1 || 0,
          costoAño2: data.costoAño2 || data.costoAnio2 || 0,
          activo: data.activo !== false,
        },
      })

    // Auditar creación usando helper centralizado
    await createAuditLog({
      action: 'SNAPSHOT_CREATED',
      entityType: 'PACKAGE_SNAPSHOT',
      entityId: snapshot.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: snapshot.nombre,
        tipo: snapshot.tipo,
        quotationConfigId: snapshot.quotationConfigId,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(snapshot, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al crear snapshot' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { session, error } = await requireWritePermission('packages.manage')
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const data = await request.json()

    // Obtener estado anterior para generar diff
    const snapshotAnterior = await prisma.packageSnapshot.findUnique({
      where: { id },
      select: {
        nombre: true,
        tipo: true,
        descripcion: true,
        costoInicial: true,
        costoAño1: true,
        costoAño2: true,
        activo: true,
      },
    })

    const snapshot = await prisma.packageSnapshot.update({
      where: { id },
      data: {
        nombre: data.nombre || '',
        serviciosBase: data.serviciosBase || [],
        desarrollo: data.desarrollo || 0,
        descuento: data.descuento || 0,
        tipo: data.tipo || '',
        descripcion: data.descripcion || '',
        emoji: data.emoji || '',
        tagline: data.tagline || '',
        tiempoEntrega: data.tiempoEntrega || '',
        opcionesPago: data.opcionesPago || [],
        // Título y subtítulo para sección de pago
        tituloSeccionPago: data.tituloSeccionPago || 'Opciones de Pago',
        subtituloSeccionPago: data.subtituloSeccionPago || '',
        descuentoPagoUnico: data.descuentoPagoUnico || 0,
        // Sistema de descuentos
        configDescuentos: data.configDescuentos || null,
        // Método de pago y notas (condicional para compatibilidad)
        ...(data.metodoPagoPreferido !== undefined && { metodoPagoPreferido: data.metodoPagoPreferido }),
        ...(data.notasPago !== undefined && { notasPago: data.notasPago }),
        // Métodos preferidos (nuevo array)
        ...(data.metodosPreferidos !== undefined && { metodosPreferidos: data.metodosPreferidos }),
        descuentosGenerales: data.descuentosGenerales || null,
        descuentosPorServicio: data.descuentosPorServicio || null,
        otrosServicios: data.otrosServicios || [],
        costoInicial: data.costoInicial || 0,
        costoAño1: data.costoAño1 || data.costoAnio1 || 0,
        costoAño2: data.costoAño2 || data.costoAnio2 || 0,
        activo: data.activo !== false,
      },
    })

    // Generar diff de cambios principales
    const allowedFields = ['nombre', 'tipo', 'descripcion', 'costoInicial', 'costoAño1', 'costoAño2', 'activo']
    const diff = generateDiff(
      snapshotAnterior || { nombre: '', tipo: '', descripcion: '', costoInicial: 0, costoAño1: 0, costoAño2: 0, activo: true },
      {
        nombre: snapshot.nombre,
        tipo: snapshot.tipo,
        descripcion: snapshot.descripcion,
        costoInicial: snapshot.costoInicial,
        costoAño1: snapshot.costoAño1,
        costoAño2: snapshot.costoAño2,
        activo: snapshot.activo,
      },
      allowedFields
    )

    // Auditar actualización usando helper centralizado
    await createAuditLog({
      action: 'SNAPSHOT_UPDATED',
      entityType: 'PACKAGE_SNAPSHOT',
      entityId: snapshot.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: diff,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('Error en PUT /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al actualizar snapshot' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { session, error } = await requireFullPermission('packages.manage')
  if (error) return error

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    // Eliminar permanentemente de la base de datos (hard delete)
    const snapshot = await prisma.packageSnapshot.delete({
      where: { id },
    })

    // Auditar eliminación usando helper centralizado
    await createAuditLog({
      action: 'SNAPSHOT_DELETED',
      entityType: 'PACKAGE_SNAPSHOT',
      entityId: snapshot.id,
      actorId: session?.user?.id,
      actorName: session?.user?.username || 'Sistema',
      details: {
        nombre: snapshot.nombre,
        tipo: snapshot.tipo,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json({ success: true, deleted: snapshot })
  } catch (error) {
    console.error('Error en DELETE /api/snapshots:', error)
    return NextResponse.json({ error: 'Error al eliminar snapshot' }, { status: 500 })
  }
}
