const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditSnapshots() {
  console.log('=== AUDITORIA DE SNAPSHOTS DE PAQUETES ===\n');
  
  // 1. Obtener todas las cotizaciones
  const configs = await prisma.quotationConfig.findMany({
    select: {
      id: true,
      numero: true,
      versionNumber: true,
      isGlobal: true,
      packagesSnapshot: true,
      packagesSnapshotAt: true,
    },
    orderBy: [{ numero: 'asc' }, { versionNumber: 'asc' }]
  });
  
  console.log('📋 COTIZACIONES Y SUS SNAPSHOTS:');
  console.log('-'.repeat(80));
  
  for (const c of configs) {
    const snapshotCount = Array.isArray(c.packagesSnapshot) ? c.packagesSnapshot.length : 0;
    const status = c.isGlobal ? '🟢 ACTIVA' : '⚪ histórica';
    const snapshotStatus = snapshotCount > 0 ? `✅ ${snapshotCount} paquetes` : '❌ VACÍO';
    const snapshotDate = c.packagesSnapshotAt 
      ? new Date(c.packagesSnapshotAt).toLocaleString('es-CO')
      : 'Sin fecha';
    
    console.log(`${c.numero} V${c.versionNumber} | ${status} | Snapshot: ${snapshotStatus} | Fecha: ${snapshotDate}`);
  }
  
  // 2. Obtener paquetes reales
  console.log('\n📦 PAQUETES REALES EN BD (PackageSnapshot):');
  console.log('-'.repeat(80));
  
  const paquetes = await prisma.packageSnapshot.findMany({
    select: {
      id: true,
      nombre: true,
      activo: true,
      quotationConfigId: true,
    },
    orderBy: { createdAt: 'asc' }
  });
  
  // Agrupar por quotationConfigId
  const paquetesPorConfig = new Map();
  for (const p of paquetes) {
    const configId = p.quotationConfigId || 'SIN_CONFIG';
    if (!paquetesPorConfig.has(configId)) {
      paquetesPorConfig.set(configId, []);
    }
    paquetesPorConfig.get(configId).push(p);
  }
  
  for (const [configId, pkgs] of paquetesPorConfig) {
    const config = configs.find(c => c.id === configId);
    const configInfo = config ? `${config.numero} V${config.versionNumber}` : 'HUÉRFANOS';
    const activos = pkgs.filter(p => p.activo).length;
    const inactivos = pkgs.filter(p => !p.activo).length;
    console.log(`${configInfo}: ${pkgs.length} paquetes (${activos} activos, ${inactivos} inactivos)`);
    pkgs.forEach(p => console.log(`  - ${p.nombre} (activo: ${p.activo})`));
  }
  
  // 3. Resumen
  console.log('\n📊 RESUMEN:');
  console.log('-'.repeat(80));
  const configsConSnapshot = configs.filter(c => Array.isArray(c.packagesSnapshot) && c.packagesSnapshot.length > 0);
  const configsSinSnapshot = configs.filter(c => !c.packagesSnapshot || (Array.isArray(c.packagesSnapshot) && c.packagesSnapshot.length === 0));
  
  console.log(`Total cotizaciones: ${configs.length}`);
  console.log(`Con snapshot guardado: ${configsConSnapshot.length}`);
  console.log(`Sin snapshot: ${configsSinSnapshot.length}`);
  console.log(`Total paquetes reales: ${paquetes.length}`);
  
  await prisma.$disconnect();
}

auditSnapshots().catch(console.error);
