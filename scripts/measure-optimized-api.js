/**
 * Script para medir el rendimiento de la API optimizada
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function measureOptimizedQuery() {
  console.log('\n=== MEDICIÓN DE LA API OPTIMIZADA ===\n');
  
  // Query ANTERIOR (todos los campos + include)
  console.log('⏱️ Query ANTERIOR (todos los campos + include snapshots):');
  let start = Date.now();
  const oldResult = await prisma.quotationConfig.findMany({
    include: {
      snapshots: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });
  let oldTime = Date.now() - start;
  const oldSize = JSON.stringify(oldResult).length;
  console.log(`   Tiempo: ${oldTime}ms`);
  console.log(`   Tamaño respuesta: ${(oldSize / 1024).toFixed(2)} KB`);
  
  // Query NUEVA (campos selectivos, sin include)
  console.log('\n⏱️ Query NUEVA (campos selectivos, sin include):');
  start = Date.now();
  const newResult = await prisma.quotationConfig.findMany({
    select: {
      id: true,
      numero: true,
      versionNumber: true,
      isGlobal: true,
      activo: true,
      empresa: true,
      sector: true,
      ubicacion: true,
      emailCliente: true,
      whatsappCliente: true,
      profesional: true,
      empresaProveedor: true,
      emailProveedor: true,
      whatsappProveedor: true,
      ubicacionProveedor: true,
      fechaEmision: true,
      fechaVencimiento: true,
      tiempoValidez: true,
      tiempoVigenciaValor: true,
      tiempoVigenciaUnidad: true,
      presupuesto: true,
      moneda: true,
      heroTituloMain: true,
      heroTituloSub: true,
      createdAt: true,
      updatedAt: true,
      serviciosBaseTemplate: true,
      serviciosOpcionalesTemplate: true,
      opcionesPagoTemplate: true,
      configDescuentosTemplate: true,
      descripcionesPaqueteTemplates: true,
      metodoPagoPreferido: true,
      notasPago: true,
      metodosPreferidos: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
  let newTime = Date.now() - start;
  const newSize = JSON.stringify(newResult).length;
  console.log(`   Tiempo: ${newTime}ms`);
  console.log(`   Tamaño respuesta: ${(newSize / 1024).toFixed(2)} KB`);
  
  // Resumen
  console.log('\n📊 RESUMEN DE MEJORA:');
  console.log('─'.repeat(40));
  console.log(`   Tiempo: ${oldTime}ms → ${newTime}ms (${((1 - newTime/oldTime) * 100).toFixed(1)}% más rápido)`);
  console.log(`   Tamaño: ${(oldSize / 1024).toFixed(2)} KB → ${(newSize / 1024).toFixed(2)} KB (${((1 - newSize/oldSize) * 100).toFixed(1)}% menos datos)`);
  console.log(`   Speedup: ${(oldTime / newTime).toFixed(1)}x más rápido`);
  
  console.log('\n=== FIN DE LA MEDICIÓN ===\n');
}

measureOptimizedQuery()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
