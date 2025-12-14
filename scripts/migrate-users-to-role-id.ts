import prisma from '../src/lib/prisma'

async function migrateUsersToRoleId() {
  console.log('🔄 Migrando usuarios a modelo roleId...\n')

  // 1. Obtener todos los roles
  const roles = await prisma.role.findMany()
  console.log(`📋 Roles disponibles: ${roles.length}`)
  roles.forEach(r => console.log(`   - ${r.name} (${r.displayName}) ID: ${r.id}`))

  // 2. Crear un mapa de nombre -> id
  const roleMap = new Map(roles.map(r => [r.name, r.id]))

  // 3. Obtener usuarios sin roleId
  const usersWithoutRoleId = await prisma.user.findMany({
    where: { roleId: null },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      roleId: true,
    },
  })

  console.log(`\n👥 Usuarios sin roleId: ${usersWithoutRoleId.length}`)

  if (usersWithoutRoleId.length === 0) {
    console.log('✅ Todos los usuarios ya tienen roleId asignado')
    await prisma.$disconnect()
    return
  }

  // 4. Migrar cada usuario
  for (const user of usersWithoutRoleId) {
    const roleId = roleMap.get(user.role)
    
    if (!roleId) {
      console.log(`   ❌ ${user.username}: No se encontró roleId para ${user.role}`)
      continue
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { roleId },
    })

    console.log(`   ✅ ${user.username} (${user.email}): ${user.role} → roleId: ${roleId}`)
  }

  console.log('\n✅ Migración completada')
  console.log('\n🔍 Verificando usuario ADMIN...')

  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: {
      username: true,
      role: true,
      roleId: true,
      roleRef: {
        select: {
          name: true,
          displayName: true,
        },
      },
    },
  })

  if (adminUser) {
    console.log(`   Usuario: ${adminUser.username}`)
    console.log(`   Rol enum: ${adminUser.role}`)
    console.log(`   Rol ID: ${adminUser.roleId}`)
    console.log(`   Rol ref: ${adminUser.roleRef?.displayName}`)
  }

  await prisma.$disconnect()
}

migrateUsersToRoleId().catch(console.error)
