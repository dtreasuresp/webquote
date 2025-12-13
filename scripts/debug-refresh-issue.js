/**
 * Script para diagnosticar el problema de refresh de paquetes
 * Verifica la relación entre quotations y snapshots
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugRefreshIssue() {
  console.log('\n=== DIAGNÓSTICO DE REFRESH DE PAQUETES ===\n');
  
  // 1. Obtener todas las quotations
  const quotations = await prisma.quotationConfig.findMany({
    orderBy: { versionNumber: 'desc' },
    select: {
      id: true,
      numero: true,
      versionNumber: true,
      isGlobal: true,
      packagesSnapshot: true,
      packagesSnapshotAt: true,
      updatedAt: true,
    }
  });
  
  console.log('📋 QUOTATIONS EN BD:');
  console.log('-'.repeat(80));
  
  for (const q of quotations) {
    const snapshotCount = Array.isArray(q.packagesSnapshot) ? q.packagesSnapshot.length : 0;
    console.log(
      `${q.isGlobal ? '🟢 ACTIVA' : '⚪ histórica'} | ` +
      `${q.numero} (ID: ${q.id.slice(0,8)}...) | ` +
      `V${q.versionNumber} | ` +
      `packagesSnapshot: ${snapshotCount > 0 ? `✅ ${snapshotCount} paquetes` : '❌ vacío'}`
    );
  }
  
  // 2. Obtener todos los PackageSnapshots
  const packageSnapshots = await prisma.packageSnapshot.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      nombre: true,
      activo: true,
      quotationConfigId: true,
    }
  });
  
  console.log('\n📦 PACKAGE SNAPSHOTS EN BD:');
  console.log('-'.repeat(80));
  
  for (const ps of packageSnapshots) {
    const linkedQuotation = quotations.find(q => q.id === ps.quotationConfigId);
    console.log(
      `${ps.activo ? '✅ activo' : '❌ inactivo'} | ` +
      `"${ps.nombre}" | ` +
      `quotationConfigId: ${ps.quotationConfigId ? ps.quotationConfigId.slice(0,8) + '...' : '❌ NULL'} | ` +
      `Linked to: ${linkedQuotation ? linkedQuotation.numero : '❓ NO ENCONTRADA'}`
    );
  }
  
  // 3. Análisis de la relación
  console.log('\n🔍 ANÁLISIS DE LA RELACIÓN:');
  console.log('-'.repeat(80));
  
  const quotationActiva = quotations.find(q => q.isGlobal);
  const paquetesDeActiva = packageSnapshots.filter(ps => ps.quotationConfigId === quotationActiva?.id);
  
  console.log(`\nCotización ACTIVA: ${quotationActiva?.numero || 'NINGUNA'}`);
  console.log(`ID de cotización activa: ${quotationActiva?.id || 'N/A'}`);
  console.log(`Paquetes VINCULADOS a cotización activa: ${paquetesDeActiva.length}`);
  
  if (paquetesDeActiva.length > 0) {
    console.log('Paquetes:');
    paquetesDeActiva.forEach(p => console.log(`  - ${p.nombre} (${p.activo ? 'activo' : 'inactivo'})`));
  }
  
  // 4. Verificar si hay paquetes huérfanos
  console.log('\n⚠️ PAQUETES HUÉRFANOS (quotationConfigId inválido):');
  console.log('-'.repeat(80));
  
  const paquetesHuerfanos = packageSnapshots.filter(ps => {
    if (!ps.quotationConfigId) return true;
    return !quotations.find(q => q.id === ps.quotationConfigId);
  });
  
  if (paquetesHuerfanos.length > 0) {
    paquetesHuerfanos.forEach(p => console.log(`  ❌ "${p.nombre}" - quotationConfigId: ${p.quotationConfigId || 'NULL'}`));
  } else {
    console.log('  ✅ No hay paquetes huérfanos');
  }
  
  // 5. Simular el filtrado que hace HistorialTab
  console.log('\n🧪 SIMULACIÓN DEL FILTRADO DE HistorialTab:');
  console.log('-'.repeat(80));
  
  for (const q of quotations) {
    const paquetesFiltrados = packageSnapshots.filter(ps => ps.quotationConfigId === q.id);
    const paquetesActivos = paquetesFiltrados.filter(ps => ps.activo);
    console.log(
      `${q.numero} (${q.isGlobal ? 'ACTIVA' : 'histórica'}) => ` +
      `snapshots.filter(s => s.quotationConfigId === "${q.id.slice(0,8)}...") = ${paquetesFiltrados.length} paquetes ` +
      `(${paquetesActivos.length} activos)`
    );
  }
  
  console.log('\n=== FIN DEL DIAGNÓSTICO ===\n');
}

debugRefreshIssue()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
