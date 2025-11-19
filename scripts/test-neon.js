// Simple script to test TCP+SSL connection to neon endpoints using 'pg'
const { Client } = require('pg')
const dotenv = require('dotenv')
const fs = require('fs')

const envPathLocal = './.env.local'
const envPathVercel = './.env.vercel'
if (fs.existsSync(envPathVercel)) dotenv.config({ path: envPathVercel })
if (fs.existsSync(envPathLocal)) dotenv.config({ path: envPathLocal })

const pooled = process.env.DATABASE_URL || process.env.STORAGE_POSTGRES_URL
const unpooled = process.env.DATABASE_URL_UNPOOLED || process.env.STORAGE_POSTGRES_URL_NON_POOLING

async function test(url, label) {
  if (!url) {
    console.log(`${label}: No URL found`)
    return
  }

  console.log(`\n== ${label} ==`) 
  console.log('URL:', url.replace(/(postgresql:\/\/[^:]+:)[^@]+(@)/, '$1*****$2'))

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, statement_timeout: 15000 })
  try {
    await client.connect()
    const res = await client.query('SELECT 1 as ok')
    console.log('Connected OK, query result:', res.rows)
  } catch (err) {
    console.error('Connection error:', err && err.code ? `${err.code} - ${err.message}` : String(err))
  } finally {
    try { await client.end() } catch (e) {}
  }
}

;(async () => {
  await test(pooled, 'Pooled endpoint (pgbouncer)')
  await test(unpooled, 'Unpooled endpoint (direct)')
})()
