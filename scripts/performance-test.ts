/**
 * Script de Performance Testing
 * Mide el impacto del sistema de permisos en la performance de la aplicación
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface PerformanceMetric {
  operation: string
  iterations: number
  avgTime: number
  minTime: number
  maxTime: number
  totalTime: number
}

/**
 * Mide el tiempo de ejecución de una función
 */
async function measureTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; time: number }> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return { result, time: end - start }
}

/**
 * Ejecuta una función múltiples veces y retorna estadísticas
 */
async function benchmark<T>(
  name: string,
  fn: () => Promise<T>,
  iterations: number = 100
): Promise<PerformanceMetric> {
  console.log(`\n🔄 Ejecutando benchmark: ${name} (${iterations} iteraciones)`)
  
  const times: number[] = []
  
  // Warm-up (no cuenta en resultados)
  await fn()
  
  // Mediciones reales
  for (let i = 0; i < iterations; i++) {
    const { time } = await measureTime(fn)
    times.push(time)
    
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r  Progreso: ${i + 1}/${iterations}`)
    }
  }
  
  const totalTime = times.reduce((a, b) => a + b, 0)
  const avgTime = totalTime / iterations
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  
  console.log(`\n  ✅ Completado`)
  console.log(`  📊 Promedio: ${avgTime.toFixed(2)}ms`)
  console.log(`  ⚡ Mínimo: ${minTime.toFixed(2)}ms`)
  console.log(`  🐌 Máximo: ${maxTime.toFixed(2)}ms`)
  
  return {
    operation: name,
    iterations,
    avgTime,
    minTime,
    maxTime,
    totalTime
  }
}

/**
 * Test 1: Query simple sin validación de permisos
 */
async function testSimpleQuery() {
  return benchmark(
    'Query simple (sin permisos)',
    async () => {
      return await prisma.user.findMany({
        take: 10
      })
    },
    100
  )
}

/**
 * Test 2: Query de usuario con permisos (incluye joins)
 */
async function testQueryWithPermissions() {
  return benchmark(
    'Query con permisos (incluye RolePermissions + UserPermissions)',
    async () => {
      return await prisma.user.findMany({
        take: 10,
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })
    },
    100
  )
}

/**
 * Test 3: Query de permisos de un usuario específico
 */
async function testUserPermissionsQuery(userId: string) {
  return benchmark(
    'Query de permisos de usuario específico',
    async () => {
      // Simular lo que hace requireReadPermission
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true
                }
              }
            }
          },
          userPermissions: {
            include: {
              permission: true
            }
          }
        }
      })
      
      // Procesar permisos
      const permissions = [
        ...(user?.role?.rolePermissions?.map(rp => rp.permission) || []),
        ...(user?.userPermissions?.map(up => up.permission) || [])
      ]
      
      return permissions
    },
    100
  )
}

/**
 * Test 4: Query de audit logs (puede ser grande)
 */
async function testAuditLogsQuery() {
  return benchmark(
    'Query de audit logs (últimos 50)',
    async () => {
      return await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              nombre: true
            }
          }
        }
      })
    },
    50 // Menos iteraciones porque puede ser pesado
  )
}

/**
 * Test 5: Query de quotation config con filtrado
 */
async function testQuotationConfigQuery(quotationId?: string) {
  return benchmark(
    'Query de QuotationConfig con filtrado',
    async () => {
      return await prisma.quotationConfig.findMany({
        where: quotationId ? {
          OR: [
            { id: quotationId },
            { isGlobal: true }
          ]
        } : { isGlobal: true },
        include: {
          packages: {
            include: {
              services: true
            }
          }
        }
      })
    },
    50
  )
}

/**
 * Test 6: Múltiples queries en paralelo (simulando carga concurrente)
 */
async function testConcurrentQueries(userId: string) {
  return benchmark(
    'Queries concurrentes (5 queries simultáneas)',
    async () => {
      return await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.permission.findMany({ take: 10 }),
        prisma.role.findMany(),
        prisma.auditLog.findMany({ take: 10 }),
        prisma.quotationConfig.findMany({ take: 5 })
      ])
    },
    50
  )
}

/**
 * Test 7: Count total de registros (potencialmente lento)
 */
async function testCountQueries() {
  return benchmark(
    'Count de múltiples tablas',
    async () => {
      return await Promise.all([
        prisma.user.count(),
        prisma.permission.count(),
        prisma.role.count(),
        prisma.auditLog.count(),
        prisma.quotationConfig.count()
      ])
    },
    30
  )
}

/**
 * Main: Ejecuta todos los tests
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║     PERFORMANCE TESTING - Sistema de Permisos        ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  
  try {
    // Obtener un usuario de prueba
    const testUser = await prisma.user.findFirst({
      where: { role: { name: 'SUPER_ADMIN' } }
    })
    
    if (!testUser) {
      throw new Error('No se encontró usuario SUPER_ADMIN para tests')
    }
    
    console.log(`\n📝 Usuario de prueba: ${testUser.username} (${testUser.id})`)
    
    // Ejecutar todos los benchmarks
    const results: PerformanceMetric[] = []
    
    results.push(await testSimpleQuery())
    results.push(await testQueryWithPermissions())
    results.push(await testUserPermissionsQuery(testUser.id))
    results.push(await testAuditLogsQuery())
    results.push(await testQuotationConfigQuery())
    results.push(await testConcurrentQueries(testUser.id))
    results.push(await testCountQueries())
    
    // Resumen
    console.log('\n\n╔═══════════════════════════════════════════════════════╗')
    console.log('║                    RESULTADOS                         ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
    
    console.log('\n📊 Tabla de Resultados:\n')
    console.log('┌─────────────────────────────────────────────────┬──────────┬──────────┬──────────┐')
    console.log('│ Operación                                       │ Promedio │ Mínimo   │ Máximo   │')
    console.log('├─────────────────────────────────────────────────┼──────────┼──────────┼──────────┤')
    
    results.forEach(metric => {
      const name = metric.operation.padEnd(47)
      const avg = `${metric.avgTime.toFixed(2)}ms`.padStart(8)
      const min = `${metric.minTime.toFixed(2)}ms`.padStart(8)
      const max = `${metric.maxTime.toFixed(2)}ms`.padStart(8)
      console.log(`│ ${name} │ ${avg} │ ${min} │ ${max} │`)
    })
    
    console.log('└─────────────────────────────────────────────────┴──────────┴──────────┴──────────┘')
    
    // Análisis
    console.log('\n\n📈 Análisis:')
    
    const simpleQuery = results[0]
    const permissionsQuery = results[1]
    const overhead = permissionsQuery.avgTime - simpleQuery.avgTime
    const overheadPercent = ((overhead / simpleQuery.avgTime) * 100).toFixed(1)
    
    console.log(`\n1. Overhead de permisos:`)
    console.log(`   Query simple: ${simpleQuery.avgTime.toFixed(2)}ms`)
    console.log(`   Query con permisos: ${permissionsQuery.avgTime.toFixed(2)}ms`)
    console.log(`   Overhead: +${overhead.toFixed(2)}ms (+${overheadPercent}%)`)
    
    if (overhead > 50) {
      console.log(`   ⚠️  ADVERTENCIA: Overhead significativo detectado`)
      console.log(`   💡 Considerar agregar índices o implementar caché`)
    } else if (overhead > 20) {
      console.log(`   ⚡ Overhead moderado - aceptable para producción`)
    } else {
      console.log(`   ✅ Overhead mínimo - excelente performance`)
    }
    
    // Identificar operaciones lentas
    const slowOperations = results.filter(r => r.avgTime > 100)
    if (slowOperations.length > 0) {
      console.log(`\n2. Operaciones lentas (>100ms):`)
      slowOperations.forEach(op => {
        console.log(`   ⚠️  ${op.operation}: ${op.avgTime.toFixed(2)}ms`)
      })
      console.log(`   💡 Considerar optimización o paginación`)
    }
    
    // Variabilidad
    const highVariability = results.filter(r => (r.maxTime - r.minTime) > (r.avgTime * 2))
    if (highVariability.length > 0) {
      console.log(`\n3. Alta variabilidad detectada:`)
      highVariability.forEach(op => {
        console.log(`   📊 ${op.operation}`)
        console.log(`      Diferencia: ${(op.maxTime - op.minTime).toFixed(2)}ms`)
      })
      console.log(`   💡 Puede indicar problemas de caché o conexión a BD`)
    }
    
    // Recomendaciones
    console.log('\n\n💡 Recomendaciones:')
    
    if (permissionsQuery.avgTime > 50) {
      console.log('   1. ✅ Implementar caché de permisos en frontend (ya hecho)')
      console.log('   2. 🔧 Agregar índices en tablas RolePermissions y UserPermission')
      console.log('   3. 🔧 Considerar caché en backend (Redis) para permisos frecuentes')
    }
    
    if (results[3].avgTime > 100) { // Audit logs
      console.log('   4. 📊 Implementar paginación eficiente en audit logs')
      console.log('   5. 🗄️  Considerar archivado de logs antiguos')
    }
    
    if (results[6].avgTime > 50) { // Counts
      console.log('   6. 📈 Cachear counts de tablas grandes')
      console.log('   7. 🔄 Actualizar counts de forma asíncrona')
    }
    
    console.log('\n✅ Performance testing completado\n')
    
    // Guardar resultados en archivo
    const fs = await import('fs/promises')
    const reportPath = 'docs/reports/PERFORMANCE_REPORT.md'
    
    const report = `# Performance Report

**Fecha:** ${new Date().toISOString()}
**Usuario de prueba:** ${testUser.username}

## Resultados

| Operación | Promedio | Mínimo | Máximo | Iteraciones |
|-----------|----------|--------|--------|-------------|
${results.map(r => 
  `| ${r.operation} | ${r.avgTime.toFixed(2)}ms | ${r.minTime.toFixed(2)}ms | ${r.maxTime.toFixed(2)}ms | ${r.iterations} |`
).join('\n')}

## Análisis

### Overhead de Permisos
- Query simple: ${simpleQuery.avgTime.toFixed(2)}ms
- Query con permisos: ${permissionsQuery.avgTime.toFixed(2)}ms
- **Overhead: +${overhead.toFixed(2)}ms (+${overheadPercent}%)**

${overhead > 50 ? '⚠️ **ADVERTENCIA:** Overhead significativo detectado' : '✅ Overhead aceptable'}

### Operaciones Lentas (>100ms)
${slowOperations.length > 0 
  ? slowOperations.map(op => `- ${op.operation}: ${op.avgTime.toFixed(2)}ms`).join('\n')
  : 'No se detectaron operaciones lentas'
}

## Recomendaciones

${permissionsQuery.avgTime > 50 ? `
1. ✅ Caché de permisos frontend implementado
2. 🔧 Agregar índices en RolePermissions/UserPermission
3. 🔧 Considerar caché backend (Redis)
` : ''}
${results[3].avgTime > 100 ? `
4. 📊 Mejorar paginación en audit logs
5. 🗄️ Archivar logs antiguos
` : ''}
${results[6].avgTime > 50 ? `
6. 📈 Cachear counts de tablas grandes
7. 🔄 Actualizar counts asincrónicamente
` : ''}
`
    
    await fs.writeFile(reportPath, report)
    console.log(`📄 Reporte guardado en: ${reportPath}\n`)
    
  } catch (error) {
    console.error('❌ Error en performance testing:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
