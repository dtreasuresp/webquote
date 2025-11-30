import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`
    
    const snapshots = await prisma.packageSnapshot.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(snapshots)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Error en GET /api/snapshots/all:', msg)
    if (msg.includes('ECONNREFUSED') || msg.includes('connect')) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'Error al obtener snapshots' },
      { status: 500 }
    )
  }
}
