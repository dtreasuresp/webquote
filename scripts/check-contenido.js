// Script para verificar contenidoGeneral en la base de datos
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    const config = await prisma.quotationConfig.findFirst({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        contenidoGeneral: true
      }
    });
    
    console.log('=== Verificación de contenidoGeneral ===\n');
    console.log('ID:', config?.id || 'NO HAY REGISTRO');
    console.log('\n--- Keys en contenidoGeneral ---');
    
    if (config?.contenidoGeneral) {
      const keys = Object.keys(config.contenidoGeneral);
      console.log('Total keys:', keys.length);
      console.log('Keys:', keys.join(', '));
      
      console.log('\n--- Verificando secciones esperadas ---');
      const expectedKeys = [
        'faq',
        'garantias', 
        'contacto',
        'resumenEjecutivo',
        'terminosCondiciones',
        'analisisRequisitos',
        'fortalezas',
        'dinamicoVsEstatico',
        'tablaComparativa',
        'presupuestoCronograma',
        'observaciones',
        'conclusion'
      ];
      
      expectedKeys.forEach(key => {
        const hasKey = config.contenidoGeneral.hasOwnProperty(key);
        const value = config.contenidoGeneral[key];
        const isEmpty = !value || (typeof value === 'object' && Object.keys(value).length === 0);
        console.log(`  ${key}: ${hasKey ? (isEmpty ? '⚠️ VACÍO' : '✅ TIENE DATOS') : '❌ NO EXISTE'}`);
      });
      
      console.log('\n--- Muestra de contenido (primeros 2000 chars) ---');
      console.log(JSON.stringify(config.contenidoGeneral, null, 2).substring(0, 2000));
    } else {
      console.log('⚠️ contenidoGeneral es NULL o undefined');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
