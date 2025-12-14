import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPermissions() {
  console.log('📋 Verificando permisos en la base de datos...\n')

  const permissions = await prisma.permission.findMany({
    orderBy: [
      { category: 'asc' },
      { code: 'asc' },
    ],
  })

  console.log(`Total de permisos: ${permissions.length}\n`)

  // Agrupar por categoría
  const grouped = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, typeof permissions>)

  // Mostrar por categoría
  for (const [category, perms] of Object.entries(grouped)) {
    console.log(`\n${category} (${perms.length}):`)
    perms.forEach(p => {
      console.log(`  - ${p.code.padEnd(30)} | ${p.name} | isSystem: ${p.isSystem}`)
    })
  }

  await prisma.$disconnect()
}

checkPermissions().catch(console.error)
