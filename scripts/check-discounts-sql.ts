import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Consultando snapshots con descuentos...\n')
  
  const result = await prisma.$queryRaw`
    SELECT 
      id,
      nombre,
      "paquete"->>'descuento' as descuento_base,
      "paquete"->>'descuentoPagoUnico' as descuento_pago_unico,
      "createdAt"
    FROM "PackageSnapshot"
    ORDER BY "createdAt" DESC
  `
  
  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch(e => {
    console.error('Error:', e.message)
  })
  .finally(() => prisma.$disconnect())
