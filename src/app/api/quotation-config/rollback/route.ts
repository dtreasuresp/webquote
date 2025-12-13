import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/quotation-config/rollback
 * Revierte una versión recién creada, restaurando la versión anterior
 * Se usa cuando el usuario cancela el proceso de guardado
 */
export async function POST(request: NextRequest) {
  try {
    const { versionToDelete, previousVersionId } = await request.json()

    if (!versionToDelete || !previousVersionId) {
      return NextResponse.json(
        { error: 'Se requieren versionToDelete y previousVersionId' },
        { status: 400 }
      )
    }

    console.log(`[ROLLBACK] Iniciando rollback: eliminar ${versionToDelete}, restaurar ${previousVersionId}`)

    // PASO 1: Verificar que la versión a eliminar existe
    const versionNueva = await prisma.quotationConfig.findUnique({
      where: { id: versionToDelete },
    })

    if (!versionNueva) {
      return NextResponse.json(
        { error: 'Versión a eliminar no encontrada', success: false },
        { status: 404 }
      )
    }

    // PASO 2: Eliminar snapshots asociados a la versión nueva
    const snapshotsEliminados = await prisma.packageSnapshot.deleteMany({
      where: { quotationConfigId: versionToDelete },
    })
    console.log(`[ROLLBACK] Snapshots eliminados: ${snapshotsEliminados.count}`)

    // PASO 3: Eliminar la versión nueva
    await prisma.quotationConfig.delete({
      where: { id: versionToDelete },
    })
    console.log(`[ROLLBACK] Versión ${versionToDelete} eliminada`)

    // PASO 4: Restaurar la versión anterior como activa (isGlobal: true)
    await prisma.quotationConfig.update({
      where: { id: previousVersionId },
      data: { isGlobal: true },
    })
    console.log(`[ROLLBACK] Versión ${previousVersionId} restaurada como activa`)

    return NextResponse.json({
      success: true,
      message: 'Rollback completado exitosamente',
      snapshotsEliminados: snapshotsEliminados.count,
    })
  } catch (error) {
    console.error('[ROLLBACK] Error:', error)
    return NextResponse.json(
      { 
        error: 'Error al realizar rollback', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}
