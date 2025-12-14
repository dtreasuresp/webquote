/**
 * API Endpoint para simular el flujo de authorize() y diagnosticar el problema
 * POST https://webquote.vercel.app/api/debug/test-authorize
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log('[TEST-AUTHORIZE] Iniciando test...')
    console.log('[TEST-AUTHORIZE] Username:', username)
    console.log('[TEST-AUTHORIZE] Password length:', password?.length)

    if (!username || !password) {
      return NextResponse.json({
        step: 1,
        status: 'error',
        message: 'Credenciales requeridas'
      }, { status: 400 })
    }

    console.log('[TEST-AUTHORIZE] Buscando usuario...')
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        empresa: true,
        nombre: true,
        activo: true,
      },
    })

    if (!user) {
      console.log('[TEST-AUTHORIZE] Usuario no encontrado')
      return NextResponse.json({
        step: 2,
        status: 'error',
        message: 'Usuario no encontrado',
        username
      }, { status: 404 })
    }

    console.log('[TEST-AUTHORIZE] Usuario encontrado:', user.username)

    if (!user.activo) {
      console.log('[TEST-AUTHORIZE] Usuario desactivado')
      return NextResponse.json({
        step: 3,
        status: 'error',
        message: 'Usuario desactivado',
        user: { username: user.username, activo: user.activo }
      }, { status: 403 })
    }

    console.log('[TEST-AUTHORIZE] Verificando contraseña...')
    console.log('[TEST-AUTHORIZE] Hash en BD:', user.passwordHash.substring(0, 30) + '...')
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    
    console.log('[TEST-AUTHORIZE] Resultado bcrypt.compare:', isValidPassword)

    if (!isValidPassword) {
      // Intentar también con trim por si hay espacios
      const trimmedPassword = password.trim()
      const isValidTrimmed = await bcrypt.compare(trimmedPassword, user.passwordHash)
      
      console.log('[TEST-AUTHORIZE] Resultado con trim:', isValidTrimmed)
      
      return NextResponse.json({
        step: 4,
        status: 'error',
        message: 'Contraseña incorrecta',
        debug: {
          passwordLength: password.length,
          trimmedLength: trimmedPassword.length,
          hashPrefix: user.passwordHash.substring(0, 20),
          triedTrim: isValidTrimmed
        }
      }, { status: 401 })
    }

    console.log('[TEST-AUTHORIZE] ✅ Autenticación exitosa')

    return NextResponse.json({
      step: 5,
      status: 'success',
      message: 'Autenticación exitosa',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        empresa: user.empresa,
        nombre: user.nombre,
      }
    })
  } catch (error) {
    console.error('[TEST-AUTHORIZE] Error:', error)
    return NextResponse.json(
      {
        step: 0,
        status: 'error',
        message: error instanceof Error ? error.message : 'Error desconocido',
        error: String(error)
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Usa POST con { username: "admin", password: "admin123" }'
  })
}
