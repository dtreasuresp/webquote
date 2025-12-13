const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const q = await p.quotationConfig.findFirst({
    where: { isGlobal: true },
    select: { contenidoGeneral: true }
  });
  
  const logo = q.contenidoGeneral?.analisisRequisitos?.identidadVisual?.logoCorporativo;
  
  console.log('Tipo:', typeof logo);
  console.log('Longitud:', logo?.length || 0, 'caracteres');
  console.log('Tamaño:', ((logo?.length || 0) / 1024).toFixed(2), 'KB');
  console.log('Primeros 100 chars:', logo?.substring(0, 100));
  console.log('Es Base64 de imagen:', logo?.startsWith('data:image') ? 'SÍ ✅' : 'NO');
  
  await p.$disconnect();
})().catch(console.error);
