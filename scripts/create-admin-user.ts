/**
 * Script para crear el usuario administrador inicial
 * Ejecutar con: npx tsx scripts/create-admin-user.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Creando usuario administrador...\n')

  // Verificar si ya existe un admin
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (existingAdmin) {
    console.log('⚠️  Ya existe un usuario administrador:')
    console.log(`   Username: ${existingAdmin.username}`)
    console.log(`   Email: ${existingAdmin.email || 'N/A'}`)
    console.log('\n   Si necesitas resetear la contraseña, usa el panel de administración.')
    return
  }

  // Datos del admin (puedes modificar estos valores)
  if (!process.env.ADMIN_EMAIL) {
    console.error('❌ Error: ADMIN_EMAIL es obligatorio en variables de entorno')
    process.exit(1)
  }

  const adminData = {
    username: 'admin',
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD || 'admin123', // Cambiar en producción
    nombre: 'Administrador',
    empresa: 'WebQuote',
  }

  // Hash de la contraseña
  const passwordHash = await bcrypt.hash(adminData.password, 12)

  // Crear usuario admin
  const admin = await prisma.user.create({
    data: {
      username: adminData.username,
      email: adminData.email,
      passwordHash,
      role: 'ADMIN',
      nombre: adminData.nombre,
      empresa: adminData.empresa,
      activo: true,
    }
  })

  console.log('✅ Usuario administrador creado exitosamente:\n')
  console.log('   ┌─────────────────────────────────────────┐')
  console.log(`   │  Username: ${adminData.username.padEnd(28)}│`)
  console.log(`   │  Password: ${adminData.password.padEnd(28)}│`)
  console.log('   └─────────────────────────────────────────┘')
  console.log('\n   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login.')
  console.log(`   ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
