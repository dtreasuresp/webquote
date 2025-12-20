/**
 * Test para verificar que la persistencia y recarga de auditAutoPurgeEnabled funciona correctamente
 * 
 * Flujo:
 * 1. Crear usuario y preferencias iniciales
 * 2. Cambiar auditAutoPurgeEnabled a true
 * 3. Guardar cambios
 * 4. Recargar desde la BD
 * 5. Verificar que el valor persiste
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAuditAutoPurgeEnablePersistence() {
  console.log('\n🧪 TEST: Persistencia de auditAutoPurgeEnabled\n')

  // 1. Crear usuario test
  console.log('1️⃣ Creando usuario test...')
  const testUser = await prisma.user.create({
    data: {
      username: `test_audit_${Date.now()}`,
      email: `test_audit_${Date.now()}@example.com`,
      password: 'hashed_password',
      role: 'admin',
    },
  })
  console.log(`✅ Usuario creado: ${testUser.id}\n`)

  // 2. Crear preferencias iniciales
  console.log('2️⃣ Creando preferencias iniciales (auditAutoPurgeEnabled = false)...')
  const initialPrefs = await prisma.userPreferences.create({
    data: {
      userId: testUser.id,
      auditRetentionDays: 90,
      auditAutoPurgeEnabled: false,
      auditAutoPurgeFrequency: 'weekly',
      auditAutoReportEnabled: false,
      auditAutoReportPeriod: 'weekly',
    },
  })
  console.log(`✅ Estado inicial: auditAutoPurgeEnabled = ${initialPrefs.auditAutoPurgeEnabled}\n`)

  // 3. Simular toggle a true
  console.log('3️⃣ Simulando toggle: auditAutoPurgeEnabled = true...')
  const updatedPrefs = await prisma.userPreferences.update({
    where: { userId: testUser.id },
    data: {
      auditAutoPurgeEnabled: true,
    },
  })
  console.log(`✅ Después del toggle: auditAutoPurgeEnabled = ${updatedPrefs.auditAutoPurgeEnabled}\n`)

  // 4. Simular recarga desde DB (como haría el navegador después de refrescar)
  console.log('4️⃣ Simulando recarga desde BD (como fetch /api/preferences)...')
  const reloadedPrefs = await prisma.userPreferences.findUnique({
    where: { userId: testUser.id },
  })
  console.log(`✅ Después de recargar: auditAutoPurgeEnabled = ${reloadedPrefs?.auditAutoPurgeEnabled}\n`)

  // 5. Verificar que el valor se persistió
  console.log('5️⃣ Verificación de persistencia...')
  const isPersisted = reloadedPrefs?.auditAutoPurgeEnabled === true

  if (isPersisted) {
    console.log('✅ SUCCESS: El valor se persistió correctamente\n')
    console.log('   Valores verificados:')
    console.log(`   - auditAutoPurgeEnabled: ${reloadedPrefs?.auditAutoPurgeEnabled}`)
    console.log(`   - auditRetentionDays: ${reloadedPrefs?.auditRetentionDays}`)
    console.log(`   - auditAutoPurgeFrequency: ${reloadedPrefs?.auditAutoPurgeFrequency}\n`)
  } else {
    console.log('❌ ERROR: El valor NO se persistió\n')
    console.log('   Estado inicial:')
    console.log(`   - ${initialPrefs.auditAutoPurgeEnabled}`)
    console.log('   Después del toggle:')
    console.log(`   - ${updatedPrefs.auditAutoPurgeEnabled}`)
    console.log('   Después de recargar:')
    console.log(`   - ${reloadedPrefs?.auditAutoPurgeEnabled}\n`)
  }

  // Cleanup
  console.log('🧹 Limpiando datos de test...')
  await prisma.userPreferences.delete({
    where: { userId: testUser.id },
  })
  await prisma.user.delete({
    where: { id: testUser.id },
  })
  console.log('✅ Limpeza completada\n')

  process.exit(isPersisted ? 0 : 1)
}

testAuditAutoPurgeEnablePersistence().catch((error) => {
  console.error('❌ Error en test:', error)
  process.exit(1)
})
