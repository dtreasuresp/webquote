import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function countPermissions() {
  const count = await prisma.permission.count()
  console.log('Total permisos:', count)
  
  const permissions = await prisma.permission.findMany({
    select: { code: true, category: true }
  })
  
  const byCategory: Record<string, number> = {}
  permissions.forEach(p => {
    byCategory[p.category] = (byCategory[p.category] || 0) + 1
  })
  
  console.log('\nPor categoría:')
  Object.entries(byCategory).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`)
  })
  
  await prisma.$disconnect()
}

countPermissions().catch(console.error)
