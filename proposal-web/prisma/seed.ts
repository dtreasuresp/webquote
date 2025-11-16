// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando migraciones y seed...')
  
  // Las migraciones ya se ejecutaron en el build
  // Este script solo puede insertar datos iniciales si es necesario
  
  console.log('✅ Base de datos lista')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
