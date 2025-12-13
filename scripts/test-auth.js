// Script para probar autenticación localmente
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Buscar usuario admin
    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        activo: true,
        empresa: true,
        nombre: true
      }
    })
    
    if (!user) {
      console.log('❌ Usuario admin no encontrado')
      return
    }
    
    console.log('✅ Usuario encontrado:', user.username)
    console.log('   Role:', user.role)
    console.log('   Activo:', user.activo)
    console.log('   Hash completo:', user.passwordHash)
    
    // Probar contraseña "admin123" (común para testing)
    const testPasswords = ['admin123', 'admin', 'Admin123', 'password', '12345678']
    
    console.log('\n=== PROBANDO CONTRASEÑAS ===')
    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.passwordHash)
      console.log(`   "${pwd}" -> ${isValid ? '✅ VÁLIDA' : '❌ inválida'}`)
      if (isValid) break
    }
    
    // Generar un nuevo hash para referencia
    const newHash = await bcrypt.hash('admin123', 12)
    console.log('\n=== HASH DE REFERENCIA ===')
    console.log('Hash para "admin123":', newHash)
    
  } catch (error) {
    console.error('ERROR:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
