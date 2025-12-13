// Script para simular exactamente lo que hace NextAuth authorize
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function simulateAuthorize(username, password) {
  const prisma = new PrismaClient()
  
  console.log(`\n=== SIMULANDO authorize("${username}", "${password}") ===\n`)
  
  try {
    // Paso 1: Verificar credenciales
    if (!username || !password) {
      throw new Error("Credenciales requeridas")
    }
    console.log('✅ Paso 1: Credenciales proporcionadas')

    // Paso 2: Buscar usuario
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true,
        empresa: true,
        nombre: true,
        quotationAssignedId: true,
        avatarUrl: true,
        activo: true,
      },
    })
    
    if (!user) {
      throw new Error("Usuario no encontrado")
    }
    console.log('✅ Paso 2: Usuario encontrado:', user.username)

    // Paso 3: Verificar activo
    if (!user.activo) {
      throw new Error("Usuario desactivado. Contacte al administrador.")
    }
    console.log('✅ Paso 3: Usuario activo')

    // Paso 4: Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error("Contraseña incorrecta")
    }
    console.log('✅ Paso 4: Contraseña válida')

    // Paso 5: Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })
    console.log('✅ Paso 5: lastLogin actualizado')

    // Resultado
    const result = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      empresa: user.empresa,
      nombre: user.nombre,
      quotationAssignedId: user.quotationAssignedId,
      avatarUrl: user.avatarUrl,
    }
    
    console.log('\n✅ AUTENTICACIÓN EXITOSA')
    console.log('Resultado:', JSON.stringify(result, null, 2))
    return result
    
  } catch (error) {
    console.error('\n❌ ERROR EN AUTENTICACIÓN:', error.message)
    return null
  } finally {
    await prisma.$disconnect()
  }
}

// Simular login con admin/admin123
simulateAuthorize('admin', 'admin123')
