import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const snapshots = await prisma.packageSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(snapshots)
  } catch (error) {
    console.error('Error en GET /api/snapshots/all:', error)
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A')
    console.error('Message:', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'Error al obtener snapshots', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
