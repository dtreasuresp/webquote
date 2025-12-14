/**
 * API Endpoint temporal para verificar/crear usuario admin en producción
 * Acceder a: https://webquote.vercel.app/api/debug/ensure-admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('[ENSURE-ADMIN] Iniciando verificación...')
    
    // Verificar si el usuario admin existe
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        activo: true,
        role: true,
        nombre: true,
      }
    })

    if (existingUser) {
      // Verificar que la contraseña sea correcta
      const isValid = await bcrypt.compare('admin123', existingUser.passwordHash)
      
      if (!isValid) {
        console.log('[ENSURE-ADMIN] Contraseña incorrecta, actualizando...')
        const newHash = await bcrypt.hash('admin123', 12)
        
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash: newHash }
        })
        
        return NextResponse.json({
          status: 'updated',
          message: 'Usuario admin existía pero con contraseña incorrecta. Se ha actualizado a "admin123"',
          user: {
            id: existingUser.id,
            username: existingUser.username,
            role: existingUser.role,
            activo: existingUser.activo,
          }
        })
      }
      
      return NextResponse.json({
        status: 'exists',
        message: 'Usuario admin existe con la contraseña correcta',
        user: {
          id: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
          activo: existingUser.activo,
        }
      })
    }

    // Si no existe, crear el usuario admin
    console.log('[ENSURE-ADMIN] Creando usuario admin...')
    
    const passwordHash = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        nombre: 'Administrador',
        email: 'admin@webquote.com',
        empresa: 'WebQuote',
        role: 'SUPER_ADMIN',
        activo: true,
      },
      select: {
        id: true,
        username: true,
        role: true,
        activo: true,
      }
    })

    return NextResponse.json({
      status: 'created',
      message: 'Usuario admin creado exitosamente. Password: admin123',
      user: admin
    })
  } catch (error) {
    console.error('[ENSURE-ADMIN] Error:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: String(error)
      },
      { status: 500 }
    )
  }
}
