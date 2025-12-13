require('dotenv').config()
const { neon } = require('@neondatabase/serverless')

async function checkPackages() {
  try {
    const sql = neon(process.env.DATABASE_URL)
    
    console.log('=== Verificando paquetes en QuotationConfig ===\n')
    
    // Ver si hay datos en packagesSnapshot de QuotationConfig
    const configs = await sql`
      SELECT id, numero, "packagesSnapshot", "packagesSnapshotAt"
      FROM "QuotationConfig" 
      ORDER BY "createdAt" DESC
    `
    
    configs.forEach((cfg, i) => {
      const pkgData = cfg.packagesSnapshot
      const hasPkgs = pkgData && (Array.isArray(pkgData) ? pkgData.length > 0 : Object.keys(pkgData).length > 0)
      console.log(`${i + 1}. ${cfg.numero}`)
      console.log(`   - packagesSnapshot: ${hasPkgs ? 'SÍ tiene datos' : 'VACÍO/NULL'}`)
      console.log(`   - packagesSnapshotAt: ${cfg.packagesSnapshotAt || 'NULL'}`)
      if (hasPkgs && Array.isArray(pkgData)) {
        console.log(`   - Paquetes: ${pkgData.length}`)
        pkgData.forEach(pkg => console.log(`     • ${pkg.nombre || pkg.name || 'Sin nombre'}`))
      }
      console.log('')
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkPackages()
