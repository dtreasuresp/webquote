import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

/**
 * Script para crear usuarios de prueba E2E
 */
async function createTestUsers() {
  try {
    console.log('[TEST-USERS] Creando usuarios de prueba...')

    const testUsers = [
      {
        username: 'admin@webquote.com',
        password: 'Admin123!',
        nombre: 'Super Admin',
        empresa: 'WebQuote',
        email: 'admin@webquote.com',
        role: 'SUPER_ADMIN',
      },
      {
        username: 'manager@webquote.com',
        password: 'Manager123!',
        nombre: 'Admin Manager',
        empresa: 'WebQuote',
        email: 'manager@webquote.com',
        role: 'ADMIN',
      },
      {
        username: 'client@example.com',
        password: 'Client123!',
        nombre: 'Test Client',
        empresa: 'Test Company',
        email: 'client@example.com',
        role: 'CLIENT',
      },
    ]

    for (const user of testUsers) {
      // Verificar si existe
      const existing = await prisma.user.findUnique({
        where: { username: user.username },
      })

      if (existing) {
        console.log(`✓ Usuario ${user.username} ya existe`)
        continue
      }

      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 12)

      // Crear usuario
      const created = await prisma.user.create({
        data: {
          username: user.username,
          email: user.email,
          nombre: user.nombre,
          empresa: user.empresa,
          passwordHash,
          role: user.role as any,
          activo: true,
        },
      })

      console.log(`✓ Usuario ${user.username} creado`)
    }

    console.log('[TEST-USERS] Usuarios de prueba listos')
    process.exit(0)
  } catch (error) {
    console.error('[TEST-USERS] Error:', error)
    process.exit(1)
  }
}

createTestUsers()
