import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // Obtener la contraseña del admin desde variables de entorno
    const adminPassword = process.env.ADMIN_PASSWORD
    
    // Si no hay contraseña configurada, permitir acceso (desarrollo)
    if (!adminPassword) {
      console.warn('⚠️ ADMIN_PASSWORD no configurada - acceso permitido sin contraseña')
      return NextResponse.json({ 
        success: true,
        message: 'Acceso permitido (sin contraseña configurada)'
      })
    }
    
    // Verificar la contraseña
    if (password === adminPassword) {
      return NextResponse.json({ 
        success: true,
        message: 'Autenticación exitosa'
      })
    }
    
    return NextResponse.json({ 
      success: false,
      message: 'Contraseña incorrecta'
    }, { status: 401 })
    
  } catch (error) {
    console.error('Error en verificación de autenticación:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Error en la verificación'
    }, { status: 500 })
  }
}
