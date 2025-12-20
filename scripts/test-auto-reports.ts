/**
 * Script de prueba para generar reportes automáticos
 * Uso: npx ts-node scripts/test-auto-reports.ts [--userId=xxx] [--period=weekly]
 */

import { testGenerateReport } from '@/lib/audit-report-scheduler';

async function main() {
  const args = process.argv.slice(2);
  const userIdArg = args.find((a) => a.startsWith('--userId='));
  const periodArg = args.find((a) => a.startsWith('--period='));

  const userId = userIdArg?.split('=')[1] || 'admin';
  const period = (periodArg?.split('=')[1] || 'weekly') as 'daily' | 'weekly' | 'monthly';

  console.log(`[TEST] Iniciando prueba de generación de reportes`);
  console.log(`[TEST] Usuario: ${userId}`);
  console.log(`[TEST] Período: ${period}`);

  try {
    const report = await testGenerateReport(userId, period);
    console.log(`[TEST] ✅ Reporte generado exitosamente:`);
    console.log(`[TEST]   ID: ${report.id}`);
    console.log(`[TEST]   Logs totales: ${report.totalLogs}`);
    console.log(`[TEST]   Usuarios únicos: ${report.uniqueUsers}`);
    console.log(`[TEST]   Acciones únicas: ${report.uniqueActions}`);
    console.log(`[TEST]   Entidades únicas: ${report.uniqueEntities}`);
  } catch (error) {
    console.error('[TEST] ❌ Error:', error);
    process.exit(1);
  }
}

main();
