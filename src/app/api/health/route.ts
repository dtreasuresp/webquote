/**
 * API Health Check endpoint
 * Usado por el sistema de caché para verificar conexión a BD
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Verificar conexión a la base de datos con una query simple
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({ 
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    }, { status: 503 })
  }
}

export async function HEAD() {
  try {
    // Query más ligera para HEAD requests
    await prisma.$queryRaw`SELECT 1`
    return new NextResponse(null, { status: 200 })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
