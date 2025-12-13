/**
 * Script para analizar en detalle analisisRequisitos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeAnalisisRequisitos() {
  console.log('\n=== ANÁLISIS DETALLADO DE analisisRequisitos ===\n');
  
  // Obtener una sola quotation como muestra
  const quotation = await prisma.quotationConfig.findFirst({
    where: { isGlobal: true },
    select: {
      numero: true,
      versionNumber: true,
      contenidoGeneral: true
    }
  });
  
  if (!quotation || !quotation.contenidoGeneral) {
    console.log('No se encontró quotation con contenidoGeneral');
    return;
  }
  
  const cg = quotation.contenidoGeneral;
  const ar = cg.analisisRequisitos;
  
  if (!ar) {
    console.log('No existe analisisRequisitos');
    return;
  }
  
  console.log(`Analizando: ${quotation.numero} V${quotation.versionNumber}\n`);
  console.log(`Tamaño total de analisisRequisitos: ${(JSON.stringify(ar).length / 1024).toFixed(2)} KB\n`);
  
  // Analizar cada clave
  const keys = Object.keys(ar);
  console.log(`Claves en analisisRequisitos (${keys.length}):\n`);
  
  for (const key of keys) {
    const value = ar[key];
    const valueStr = JSON.stringify(value);
    const sizeKB = (valueStr.length / 1024).toFixed(2);
    const valueType = Array.isArray(value) ? `array[${value.length}]` : typeof value;
    
    console.log(`${'─'.repeat(50)}`);
    console.log(`📁 ${key}: ${valueType} (${sizeKB} KB)`);
    
    if (valueStr.length > 1000) {
      // Mostrar estructura para campos grandes
      if (Array.isArray(value) && value.length > 0) {
        console.log(`   Elementos: ${value.length}`);
        const firstItem = value[0];
        if (typeof firstItem === 'object') {
          const itemKeys = Object.keys(firstItem);
          console.log(`   Estructura de cada elemento: { ${itemKeys.join(', ')} }`);
          
          // Mostrar tamaño de cada propiedad del primer elemento
          for (const ik of itemKeys) {
            const ikSize = JSON.stringify(firstItem[ik]).length;
            if (ikSize > 100) {
              console.log(`     - ${ik}: ${(ikSize / 1024).toFixed(2)} KB`);
            }
          }
        }
        
        // Si hay muchos elementos, mostrar distribución de tamaños
        if (value.length > 5) {
          const sizes = value.map(v => JSON.stringify(v).length);
          const maxSize = Math.max(...sizes);
          const avgSize = sizes.reduce((a, b) => a + b, 0) / sizes.length;
          console.log(`   Tamaño máximo por elemento: ${(maxSize / 1024).toFixed(2)} KB`);
          console.log(`   Tamaño promedio por elemento: ${(avgSize / 1024).toFixed(2)} KB`);
        }
      } else if (typeof value === 'object' && value !== null) {
        const subKeys = Object.keys(value);
        console.log(`   Sub-claves: ${subKeys.length}`);
        
        // Mostrar las claves más grandes
        const subSizes = subKeys.map(sk => ({
          key: sk,
          size: JSON.stringify(value[sk]).length
        })).sort((a, b) => b.size - a.size);
        
        console.log(`   Top 5 por tamaño:`);
        for (const item of subSizes.slice(0, 5)) {
          console.log(`     - ${item.key}: ${(item.size / 1024).toFixed(2)} KB`);
        }
      } else if (typeof value === 'string') {
        console.log(`   Primeros 200 caracteres: "${value.substring(0, 200)}..."`);
      }
    } else {
      // Mostrar valor completo para campos pequeños
      if (typeof value === 'string') {
        console.log(`   Valor: "${value.substring(0, 100)}${value.length > 100 ? '...' : ''}"`);
      } else if (typeof value === 'object' && value !== null) {
        console.log(`   Valor: ${valueStr.substring(0, 200)}${valueStr.length > 200 ? '...' : ''}`);
      }
    }
  }
  
  console.log('\n=== FIN DEL ANÁLISIS ===\n');
}

analyzeAnalisisRequisitos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
