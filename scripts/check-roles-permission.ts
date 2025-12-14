import prisma from '../src/lib/prisma'

async function checkRolesPermission() {
  console.log('🔍 Verificando permiso roles.manage...\n')

  // 1. Verificar si existe el permiso
  const permission = await prisma.permission.findUnique({
    where: { code: 'roles.manage' },
  })

  console.log('1️⃣ Permiso en base de datos:')
  if (permission) {
    console.log('   ✅ EXISTE')
    console.log('   ID:', permission.id)
    console.log('   Código:', permission.code)
    console.log('   Nombre:', permission.name)
    console.log('   Categoría:', permission.category)
  } else {
    console.log('   ❌ NO EXISTE - Este es el problema!')
  }

  console.log('\n2️⃣ RolePermissions (matriz de acceso):')
  
  // Tabla NUEVA (RolePermissions)
  const rolePermissions = await prisma.rolePermissions.findMany({
    where: {
      permission: {
        code: 'roles.manage',
      },
    },
    include: {
      permission: true,
      role: true,
    },
  })

  console.log('   📊 Tabla NUEVA (RolePermissions):')
  if (rolePermissions.length > 0) {
    rolePermissions.forEach((rp) => {
      console.log(`      - Rol: ${rp.role.name}, AccessLevel: ${rp.accessLevel}`)
    })
  } else {
    console.log('      ❌ No hay configuración en la tabla nueva')
  }

  // Tabla LEGACY (RolePermission)
  const legacyRolePermissions = await prisma.rolePermission.findMany({
    where: {
      Permission: {
        code: 'roles.manage',
      },
    },
    include: {
      Permission: true,
    },
  })

  console.log('   📋 Tabla LEGACY (RolePermission):')
  if (legacyRolePermissions.length > 0) {
    legacyRolePermissions.forEach((rp) => {
      console.log(`      - Rol: ${rp.role}, Habilitado: ${rp.enabled}`)
    })
  } else {
    console.log('      ❌ No hay configuración en la tabla legacy')
  }

  console.log('\n3️⃣ Todos los permisos de roles:')
  const allRolePermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { code: { contains: 'roles' } },
        { category: 'Roles' },
      ],
    },
    orderBy: { code: 'asc' },
  })

  allRolePermissions.forEach((p) => {
    console.log(`   - ${p.code} (${p.category}) - ${p.name}`)
  })

  console.log('\n4️⃣ Verificando usuario ADMIN:')
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      roleId: true,
      UserPermission: {
        include: {
          Permission: true,
        },
      },
    },
    take: 1,
  })

  if (adminUsers.length > 0) {
    const admin = adminUsers[0]
    console.log(`   Usuario: ${admin.username} (${admin.email})`)
    console.log(`   Rol enum: ${admin.role}`)
    console.log(`   Rol ID: ${admin.roleId || 'Sin asignar'}`)
    console.log(`   Permisos directos: ${admin.UserPermission.length}`)
    
    const hasRolesManage = admin.UserPermission.some(
      (up) => up.Permission.code === 'roles.manage'
    )
    console.log(`   Tiene roles.manage directo: ${hasRolesManage ? '✅' : '❌'}`)
    
    // Verificar si el roleId tiene el permiso en RolePermissions
    if (admin.roleId) {
      const rolePerms = await prisma.rolePermissions.findFirst({
        where: {
          roleId: admin.roleId,
          permission: {
            code: 'roles.manage',
          },
        },
        include: {
          permission: true,
        },
      })
      
      if (rolePerms) {
        console.log(`   Tiene roles.manage por roleId: ✅ (accessLevel: ${rolePerms.accessLevel})`)
      } else {
        console.log(`   Tiene roles.manage por roleId: ❌`)
      }
    }
  } else {
    console.log('   ❌ No hay usuarios con rol ADMIN')
  }

  await prisma.$disconnect()
}

checkRolesPermission().catch(console.error)
