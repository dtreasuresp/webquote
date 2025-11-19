// Script to test connection with Prisma Client
const dotenv = require('dotenv')
const fs = require('fs')

const envPathVercel = './.env.vercel'
const envPathLocal = './.env.local'
if (fs.existsSync(envPathVercel)) dotenv.config({ path: envPathVercel })
if (fs.existsSync(envPathLocal)) dotenv.config({ path: envPathLocal })

const { PrismaClient } = require('@prisma/client')

// Enable verbose logging
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

async function test() {
  try {
    console.log('Testing Prisma connection using DATABASE_URL:', (process.env.DATABASE_URL || '').replace(/(postgresql:\/\/[^:]+:)[^@]+(@)/, '$1*****$2'))
    await prisma.$connect()
    const rows = await prisma.packageSnapshot.findMany({ take: 1 })
    console.log('Prisma query success, rows length:', rows.length)
  } catch (e) {
    console.error('Prisma error:')
    console.error(e instanceof Error ? e.message : String(e))
    console.error('Full error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

test()
