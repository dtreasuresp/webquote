/**
 * Script para analizar el contenido de contenidoGeneral
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeContenidoGeneral() {
  console.log('\n=== ANÁLISIS DE contenidoGeneral ===\n');
  
  const quotations = await prisma.quotationConfig.findMany({
    select: {
      id: true,
      numero: true,
      versionNumber: true,
      contenidoGeneral: true
    }
  });
  
  console.log(`Total quotations: ${quotations.length}\n`);
  
  for (const q of quotations) {
    const cg = q.contenidoGeneral;
    if (!cg) {
      console.log(`${q.numero} V${q.versionNumber}: SIN contenidoGeneral`);
      continue;
    }
    
    const cgStr = JSON.stringify(cg);
    const sizeKB = (cgStr.length / 1024).toFixed(2);
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📄 ${q.numero} V${q.versionNumber}: ${sizeKB} KB`);
    console.log(`${'='.repeat(60)}`);
    
    // Analizar las claves del objeto
    if (typeof cg === 'object' && cg !== null) {
      const keys = Object.keys(cg);
      console.log(`\nClaves principales (${keys.length}):`);
      
      for (const key of keys) {
        const value = cg[key];
        const valueStr = JSON.stringify(value);
        const valueSizeKB = (valueStr.length / 1024).toFixed(2);
        const valueType = Array.isArray(value) ? `array[${value.length}]` : typeof value;
        
        console.log(`  - ${key}: ${valueType} (${valueSizeKB} KB)`);
        
        // Si es muy grande, mostrar más detalles
        if (valueStr.length > 10000) {
          console.log(`    ⚠️ GRANDE - Analizando estructura...`);
          
          if (Array.isArray(value)) {
            // Mostrar primer elemento como muestra
            if (value.length > 0) {
              const firstItem = value[0];
              const firstItemKeys = typeof firstItem === 'object' ? Object.keys(firstItem) : ['(primitivo)'];
              console.log(`    Primer elemento tiene claves: ${firstItemKeys.join(', ')}`);
              
              // Ver tamaño promedio por elemento
              const avgSize = valueStr.length / value.length;
              console.log(`    Tamaño promedio por elemento: ${(avgSize / 1024).toFixed(2)} KB`);
            }
          } else if (typeof value === 'object') {
            const subKeys = Object.keys(value);
            for (const subKey of subKeys.slice(0, 5)) {
              const subValue = value[subKey];
              const subValueStr = JSON.stringify(subValue);
              console.log(`      ${subKey}: ${(subValueStr.length / 1024).toFixed(2)} KB`);
            }
            if (subKeys.length > 5) {
              console.log(`      ... y ${subKeys.length - 5} claves más`);
            }
          }
        }
      }
    }
  }
  
  // Resumen final
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESUMEN FINAL`);
  console.log(`${'='.repeat(60)}`);
  
  let totalSize = 0;
  const sizesByVersion = [];
  
  for (const q of quotations) {
    if (q.contenidoGeneral) {
      const size = JSON.stringify(q.contenidoGeneral).length;
      totalSize += size;
      sizesByVersion.push({ 
        numero: q.numero, 
        version: q.versionNumber, 
        sizeKB: (size / 1024).toFixed(2) 
      });
    }
  }
  
  sizesByVersion.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB));
  
  console.log(`\nTop 5 quotations por tamaño de contenidoGeneral:`);
  for (const item of sizesByVersion.slice(0, 5)) {
    console.log(`  ${item.numero} V${item.version}: ${item.sizeKB} KB`);
  }
  
  console.log(`\nTamaño total: ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`Promedio por quotation: ${(totalSize / quotations.length / 1024).toFixed(2)} KB`);
  
  console.log('\n=== FIN DEL ANÁLISIS ===\n');
}

analyzeContenidoGeneral()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
