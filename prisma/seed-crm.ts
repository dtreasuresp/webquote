import { PrismaClient, AccountType, AccountStatus, ContactRole, ContactPreference, ProductType, BillingFrequency, OpportunityStage, InteractionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CRM data...')

  // 1. Crear Cuentas (Clientes)
  const account1 = await prisma.account.upsert({
    where: { taxId: 'B12345678' },
    update: {},
    create: {
      legalName: 'Tecnologías Avanzadas S.L.',
      commercialName: 'TechAdv',
      taxId: 'B12345678',
      type: AccountType.EMPRESA,
      status: AccountStatus.ACTIVE,
      email: 'info@techadv.com',
      phone: '+34 912 345 678',
      website: 'https://techadv.com',
      address: 'Calle de la Innovación 42',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      country: 'España',
      sector: 'Tecnología',
      size: 'SME',
      viesVerified: true,
    },
  })

  const account2 = await prisma.account.upsert({
    where: { taxId: 'A87654321' },
    update: {},
    create: {
      legalName: 'Constructora Horizonte S.A.',
      commercialName: 'Horizonte',
      taxId: 'A87654321',
      type: AccountType.EMPRESA,
      status: AccountStatus.LEAD,
      email: 'contacto@horizonte.es',
      phone: '+34 934 567 890',
      address: 'Avenida del Progreso 10',
      city: 'Barcelona',
      state: 'Cataluña',
      zipCode: '08001',
      country: 'España',
      sector: 'Construcción',
      size: 'ENTERPRISE',
    },
  })

  // 2. Crear Contactos
  const contact1 = await prisma.contact.create({
    data: {
      accountId: account1.id,
      fullName: 'Juan Pérez',
      title: 'Director Técnico',
      role: ContactRole.DECISION_MAKER,
      email: 'juan.perez@techadv.com',
      phone: '+34 600 111 222',
      preferredContact: ContactPreference.EMAIL,
    },
  })

  // 3. Crear Productos/Servicios
  await prisma.product.upsert({
    where: { sku: 'SERV-WEB-001' },
    update: {},
    create: {
      name: 'Desarrollo Web Corporativo',
      sku: 'SERV-WEB-001',
      type: ProductType.SERVICE,
      category: 'Desarrollo',
      description: 'Sitio web profesional autogestionable',
      listPrice: 2500,
      costPrice: 1200,
      billingFrequency: BillingFrequency.ONE_TIME,
    },
  })

  await prisma.product.upsert({
    where: { sku: 'MANT-WEB-001' },
    update: {},
    create: {
      name: 'Mantenimiento Mensual',
      sku: 'MANT-WEB-001',
      type: ProductType.SUBSCRIPTION,
      category: 'Soporte',
      description: 'Actualizaciones y seguridad mensual',
      listPrice: 150,
      costPrice: 50,
      billingFrequency: BillingFrequency.MONTHLY,
    },
  })

  // 4. Crear Oportunidades
  await prisma.opportunity.create({
    data: {
      accountId: account1.id,
      name: 'Renovación Portal Cliente',
      stage: OpportunityStage.PROPOSAL,
      probability: 60,
      estimatedValue: 5000,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
    },
  })

  // 5. Crear Interacciones
  await prisma.interaction.create({
    data: {
      accountId: account1.id,
      contactId: contact1.id,
      type: InteractionType.MEETING,
      subject: 'Reunión inicial requerimientos',
      description: 'El cliente está interesado en una solución escalable.',
    },
  })

  console.log('✅ CRM seeding completed.')
}

try {
  await main()
} catch (e) {
  console.error(e)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
