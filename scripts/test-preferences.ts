/**
 * Test script para verificar que las preferencias se guardan correctamente
 * 
 * Uso: npx tsx scripts/test-preferences.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testPreferences() {
  console.log('🧪 Iniciando test de preferencias...\n')

  // Test 1: Crear un usuario test
  console.log('1️⃣ Creando usuario test...')
  const testUser = await prisma.user.create({
    data: {
      username: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'hashed_password', // En la práctica sería hasheada
      role: 'admin',
    },
  })
  console.log(`✅ Usuario creado: ${testUser.id}\n`)

  // Test 2: Crear preferencias iniciales
  console.log('2️⃣ Creando preferencias iniciales...')
  const initialPrefs = await prisma.userPreferences.create({
    data: {
      userId: testUser.id,
      cerrarModalAlGuardar: true,
      auditRetentionDays: 90,
      auditAutoPurgeEnabled: false,
      auditAutoPurgeFrequency: 'weekly',
      auditAutoReportEnabled: false,
      auditAutoReportPeriod: 'weekly',
    },
  })
  console.log('✅ Preferencias iniciales:')
  console.log(`  - auditRetentionDays: ${initialPrefs.auditRetentionDays}`)
  console.log(`  - auditAutoPurgeEnabled: ${initialPrefs.auditAutoPurgeEnabled}`)
  console.log(`  - auditAutoReportEnabled: ${initialPrefs.auditAutoReportEnabled}\n`)

  // Test 3: Actualizar preferencias (simular cambios de toggle)
  console.log('3️⃣ Actualizando preferencias (toggle de "Purga automática")...')
  const updatedPrefs1 = await prisma.userPreferences.update({
    where: { userId: testUser.id },
    data: {
      auditAutoPurgeEnabled: true,
    },
  })
  console.log('✅ Preferencias actualizadas:')
  console.log(`  - auditAutoPurgeEnabled: ${updatedPrefs1.auditAutoPurgeEnabled}`)
  console.log(`  - updatedAt: ${updatedPrefs1.updatedAt}\n`)

  // Test 4: Actualizar más campos
  console.log('4️⃣ Actualizando múltiples campos (retención + reporte)...')
  const updatedPrefs2 = await prisma.userPreferences.update({
    where: { userId: testUser.id },
    data: {
      auditRetentionDays: 180,
      auditAutoReportEnabled: true,
      auditAutoReportPeriod: 'monthly',
    },
  })
  console.log('✅ Preferencias actualizadas:')
  console.log(`  - auditRetentionDays: ${updatedPrefs2.auditRetentionDays}`)
  console.log(`  - auditAutoReportEnabled: ${updatedPrefs2.auditAutoReportEnabled}`)
  console.log(`  - auditAutoReportPeriod: ${updatedPrefs2.auditAutoReportPeriod}`)
  console.log(`  - updatedAt: ${updatedPrefs2.updatedAt}\n`)

  // Test 5: Verificar que los cambios persisten
  console.log('5️⃣ Verificando persistencia (releyendo desde BD)...')
  const verifyPrefs = await prisma.userPreferences.findUnique({
    where: { userId: testUser.id },
  })
  
  const allCorrect =
    verifyPrefs?.auditRetentionDays === 180 &&
    verifyPrefs?.auditAutoPurgeEnabled === true &&
    verifyPrefs?.auditAutoReportEnabled === true &&
    verifyPrefs?.auditAutoReportPeriod === 'monthly'
  
  if (allCorrect) {
    console.log('✅ Todos los cambios se guardaron correctamente:\n')
    console.log(`  - auditRetentionDays: ${verifyPrefs?.auditRetentionDays}`)
    console.log(`  - auditAutoPurgeEnabled: ${verifyPrefs?.auditAutoPurgeEnabled}`)
    console.log(`  - auditAutoReportEnabled: ${verifyPrefs?.auditAutoReportEnabled}`)
    console.log(`  - auditAutoReportPeriod: ${verifyPrefs?.auditAutoReportPeriod}\n`)
  } else {
    console.log('❌ ERRORES DETECTADOS:')
    if (verifyPrefs?.auditRetentionDays !== 180) console.log(`  - auditRetentionDays: esperado 180, obtenido ${verifyPrefs?.auditRetentionDays}`)
    if (verifyPrefs?.auditAutoPurgeEnabled !== true) console.log(`  - auditAutoPurgeEnabled: esperado true, obtenido ${verifyPrefs?.auditAutoPurgeEnabled}`)
    if (verifyPrefs?.auditAutoReportEnabled !== true) console.log(`  - auditAutoReportEnabled: esperado true, obtenido ${verifyPrefs?.auditAutoReportEnabled}`)
    if (verifyPrefs?.auditAutoReportPeriod !== 'monthly') console.log(`  - auditAutoReportPeriod: esperado 'monthly', obtenido ${verifyPrefs?.auditAutoReportPeriod}`)
    console.log()
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

  console.log('🎉 Test completado\n')
  process.exit(allCorrect ? 0 : 1)
}

testPreferences().catch((error) => {
  console.error('❌ Error en test:', error)
  process.exit(1)
})
