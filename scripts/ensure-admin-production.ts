/**
 * Script para asegurar que el usuario admin existe en producción
 * Se puede ejecutar como API endpoint o directamente
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function ensureAdmin() {
  try {
    console.log('[ENSURE-ADMIN] Conectando a la base de datos...')
    
    // Verificar si el usuario admin existe
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    })

    if (existingUser) {
      console.log('[ENSURE-ADMIN] ✅ Usuario admin ya existe')
      console.log('[ENSURE-ADMIN] ID:', existingUser.id)
      console.log('[ENSURE-ADMIN] Activo:', existingUser.activo)
      console.log('[ENSURE-ADMIN] Hash actual:', existingUser.passwordHash.substring(0, 20) + '...')
      
      // Verificar que la contraseña sea correcta
      const isValid = await bcrypt.compare('admin123', existingUser.passwordHash)
      console.log('[ENSURE-ADMIN] Contraseña "admin123" válida:', isValid)
      
      if (!isValid) {
        console.log('[ENSURE-ADMIN] ⚠️  La contraseña guardada NO es "admin123"')
        console.log('[ENSURE-ADMIN] Actualizando contraseña...')
        
        const newHash = await bcrypt.hash('admin123', 12)
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { passwordHash: newHash }
        })
        
        console.log('[ENSURE-ADMIN] ✅ Contraseña actualizada a "admin123"')
      }
      
      return existingUser
    }

    // Si no existe, crear el usuario admin
    console.log('[ENSURE-ADMIN] Usuario admin NO existe. Creando...')
    
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
      }
    })

    console.log('[ENSURE-ADMIN] ✅ Usuario admin creado exitosamente')
    console.log('[ENSURE-ADMIN] ID:', admin.id)
    console.log('[ENSURE-ADMIN] Username:', admin.username)
    console.log('[ENSURE-ADMIN] Password: admin123')
    
    return admin
  } catch (error) {
    console.error('[ENSURE-ADMIN] ❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  ensureAdmin()
    .then(() => {
      console.log('[ENSURE-ADMIN] Proceso completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[ENSURE-ADMIN] Error fatal:', error)
      process.exit(1)
    })
}

export { ensureAdmin }
