import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog, generateDiff } from '@/lib/audit/auditHelper'
import { getServerSession } from 'next-auth/next'

/**
 * PATCH /api/quotations/[id]/state
 * Cambia el estado de una cotización (CARGADA, ACTIVA, INACTIVA, ACEPTADA, RECHAZADA, NUEVA_PROPUESTA, EXPIRADA)
 * Con auditoría y validaciones
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { state, force } = body // force: booleano para forzar cambio incluso si hay conflicto

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }

    // Validar que el estado es válido
    const validStates = ['CARGADA', 'ACTIVA', 'INACTIVA', 'ACEPTADA', 'RECHAZADA', 'NUEVA_PROPUESTA', 'EXPIRADA']
    if (!state || !validStates.includes(state)) {
      return NextResponse.json(
        { success: false, error: 'Invalid state. Must be one of: ' + validStates.join(', ') },
        { status: 400 }
      )
    }

    // Obtener la cotización actual
    const quotation = await prisma.quotationConfig.findUnique({
      where: { id },
    })

    if (!quotation) {
      return NextResponse.json(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    // Si se va a activar esta cotización, inactivar otras del mismo cliente (cuando force=true)
    if (state === 'ACTIVA' && force) {
      const otherActive = await prisma.quotationConfig.findFirst({
        where: {
          emailCliente: quotation.emailCliente,
          estado: 'ACTIVA',
          id: { not: id },
        },
      })

      if (otherActive) {
        // Inactivar la anterior
        await prisma.quotationConfig.update({
          where: { id: otherActive.id },
          data: {
            estado: 'INACTIVA',
            activo: false,
            inactivadoEn: new Date(),
            updatedAt: new Date(),
          },
        })

        // Registrar auditoría para la anterior
        const session = await getServerSession()
        const userId = (session?.user as any)?.id
        const userName = (session?.user as any)?.name || 'System'

        await createAuditLog({
          action: 'QUOTATION_STATE_CHANGED_AUTO',
          entityType: 'QUOTATION_CONFIG',
          entityId: otherActive.id,
          actorId: userId,
          actorName: userName,
          details: {
            reason: 'Automatically inactivated when another quotation was activated for the same client',
            newState: 'INACTIVA',
            quotationNumber: otherActive.numero,
            replacedBy: quotation.numero,
          },
        })
      }
    }

    // Obtener sesión para auditoría
    const session = await getServerSession()
    const userId = (session?.user as any)?.id
    const userName = (session?.user as any)?.name || 'System'

    // Preparar datos de actualización
    const updateData: any = {
      estado: state,  // ✅ Actualizar el campo estado
      updatedAt: new Date(),
    }

    // Manejar campos específicos según el estado
    if (state === 'ACTIVA') {
      updateData.activo = true
      updateData.activadoEn = new Date()
    } else if (state === 'INACTIVA') {
      updateData.activo = false
      updateData.inactivadoEn = new Date()
    } else if (state === 'EXPIRADA' && !quotation.expiradoEn) {
      updateData.expiradoEn = new Date()
    }

    // Actualizar la cotización
    const updated = await prisma.quotationConfig.update({
      where: { id },
      data: updateData,
      include: {
        snapshots: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    // Generar diff para auditoría
    const diff = generateDiff(
      quotation,
      updated,
      ['activo', 'expiradoEn', 'respondidoEn', 'diasParaAceptar', 'updatedAt']
    )

    // Registrar auditoría
    await createAuditLog({
      action: 'QUOTATION_STATE_CHANGED',
      entityType: 'QUOTATION_CONFIG',
      entityId: id,
      actorId: userId,
      actorName: userName,
      details: {
        newState: state,
        changes: diff,
        quotationNumber: quotation.numero,
      },
    })

    // Si el estado cambió a ACEPTADA, RECHAZADA o EXPIRADA, crear notificación de confirmación
    if (['ACEPTADA', 'RECHAZADA', 'EXPIRADA'].includes(state)) {
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
        },
      })

      const adminUsers = allUsers

      for (const user of adminUsers) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            titulo: `Cotización: Estado cambiado a ${state}`,
            descripcion: `La cotización ${quotation.numero} ha cambiado a estado ${state}`,
            tipoNotificacion: 'CLIENTE_ACEPTACION' as any,
            leida: false,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Quotation state changed to ${state}`,
    })
  } catch (error) {
    console.error('Error updating quotation state:', error)
    return NextResponse.json(
      { success: false, error: 'Error updating quotation state' },
      { status: 500 }
    )
  }
}
