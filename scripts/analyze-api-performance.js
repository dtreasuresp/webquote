/**
 * Script para analizar el rendimiento de /api/quotations
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzePerformance() {
  console.log('\n=== ANÁLISIS DE RENDIMIENTO DE /api/quotations ===\n');
  
  // 1. Contar registros
  const quotationCount = await prisma.quotationConfig.count();
  const snapshotCount = await prisma.packageSnapshot.count();
  
  console.log(`📊 CANTIDAD DE REGISTROS:`);
  console.log(`   - QuotationConfig: ${quotationCount}`);
  console.log(`   - PackageSnapshot: ${snapshotCount}`);
  
  // 2. Medir tiempo de query simple
  console.log(`\n⏱️ MEDICIÓN DE TIEMPOS:`);
  
  // Query 1: Solo IDs (mínimo)
  let start = Date.now();
  await prisma.quotationConfig.findMany({ select: { id: true } });
  let time1 = Date.now() - start;
  console.log(`   - Solo IDs: ${time1}ms`);
  
  // Query 2: Campos básicos (sin JSON)
  start = Date.now();
  await prisma.quotationConfig.findMany({ 
    select: { 
      id: true, 
      numero: true, 
      versionNumber: true, 
      isGlobal: true,
      empresa: true,
      profesional: true,
      createdAt: true,
      updatedAt: true
    } 
  });
  let time2 = Date.now() - start;
  console.log(`   - Campos básicos (sin JSON): ${time2}ms`);
  
  // Query 3: Con algunos campos JSON
  start = Date.now();
  await prisma.quotationConfig.findMany({ 
    select: { 
      id: true, 
      numero: true,
      packagesSnapshot: true 
    } 
  });
  let time3 = Date.now() - start;
  console.log(`   - Con packagesSnapshot: ${time3}ms`);
  
  // Query 4: Todos los campos (sin include)
  start = Date.now();
  await prisma.quotationConfig.findMany();
  let time4 = Date.now() - start;
  console.log(`   - Todos los campos (sin include): ${time4}ms`);
  
  // Query 5: Con include snapshots (como hace la API actual)
  start = Date.now();
  await prisma.quotationConfig.findMany({
    include: {
      snapshots: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  let time5 = Date.now() - start;
  console.log(`   - Con include snapshots (API actual): ${time5}ms`);
  
  // 3. Calcular tamaño de datos
  console.log(`\n📦 TAMAÑO DE DATOS JSON:`);
  
  const quotations = await prisma.quotationConfig.findMany();
  
  let totalPackagesSnapshot = 0;
  let totalServiciosBaseTemplate = 0;
  let totalContenidoGeneral = 0;
  let totalOtrosJson = 0;
  
  for (const q of quotations) {
    if (q.packagesSnapshot) totalPackagesSnapshot += JSON.stringify(q.packagesSnapshot).length;
    if (q.serviciosBaseTemplate) totalServiciosBaseTemplate += JSON.stringify(q.serviciosBaseTemplate).length;
    if (q.contenidoGeneral) totalContenidoGeneral += JSON.stringify(q.contenidoGeneral).length;
    if (q.estilosConfig) totalOtrosJson += JSON.stringify(q.estilosConfig).length;
    if (q.editorState) totalOtrosJson += JSON.stringify(q.editorState).length;
    if (q.opcionesPagoTemplate) totalOtrosJson += JSON.stringify(q.opcionesPagoTemplate).length;
  }
  
  console.log(`   - packagesSnapshot total: ${(totalPackagesSnapshot / 1024).toFixed(2)} KB`);
  console.log(`   - serviciosBaseTemplate total: ${(totalServiciosBaseTemplate / 1024).toFixed(2)} KB`);
  console.log(`   - contenidoGeneral total: ${(totalContenidoGeneral / 1024).toFixed(2)} KB`);
  console.log(`   - Otros JSON total: ${(totalOtrosJson / 1024).toFixed(2)} KB`);
  
  const totalKB = (totalPackagesSnapshot + totalServiciosBaseTemplate + totalContenidoGeneral + totalOtrosJson) / 1024;
  console.log(`   - TOTAL JSON: ${totalKB.toFixed(2)} KB`);
  
  console.log('\n=== FIN DEL ANÁLISIS ===\n');
}

analyzePerformance()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
