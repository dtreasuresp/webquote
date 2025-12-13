// Script temporal para verificar usuarios en la BD
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Conectando a la base de datos...')
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        role: true,
        activo: true,
        passwordHash: true
      }
    })
    
    console.log('\n=== USUARIOS EN LA BD ===')
    users.forEach(u => {
      console.log(`- ${u.username} | role: ${u.role} | activo: ${u.activo} | hash: ${u.passwordHash.substring(0, 20)}...`)
    })
    console.log(`\nTotal: ${users.length} usuarios encontrados`)
    
  } catch (error) {
    console.error('ERROR:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
