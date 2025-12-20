/**
 * Setup: Crear usuarios de prueba antes de ejecutar los tests
 * Se ejecuta una sola vez al inicio de la suite de tests
 */

import { request } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4101'

// Usuarios de prueba
const TEST_USERS = [
  {
    username: 'admin@webquote.com',
    email: 'admin@webquote.com',
    password: 'Admin123!',
    empresa: 'Admin Company',
    nombre: 'Admin User',
    role: 'SUPER_ADMIN'
  },
  {
    username: 'manager@webquote.com',
    email: 'manager@webquote.com',
    password: 'Manager123!',
    empresa: 'Manager Company',
    nombre: 'Manager User',
    role: 'ADMIN'
  },
  {
    username: 'client@example.com',
    email: 'client@example.com',
    password: 'Client123!',
    empresa: 'Client Company',
    nombre: 'Client User',
    role: 'CLIENT'
  }
]

/**
 * Crear usuario via API
 */
async function createUser(user: any) {
  try {
    console.log(`Creating test user: ${user.username}...`)

    // Usar endpoint directo de Prisma via API (sin auth para tests)
    const response = await request.post(`${BASE_URL}/api/auth/register`, {
      data: {
        username: user.username,
        email: user.email,
        password: user.password,
        empresa: user.empresa,
        nombre: user.nombre,
        role: user.role,
      }
    })

    if (!response.ok()) {
      const error = await response.text()
      console.log(`Warning: Could not create user ${user.username}: ${error}`)
      return false
    }

    console.log(`✓ User created: ${user.username}`)
    return true
  } catch (error) {
    console.log(`Error creating user ${user.username}:`, error)
    return false
  }
}

/**
 * Hook global: Ejecutar antes de todos los tests
 */
async function globalSetup() {
  console.log('\n🔧 Setting up test environment...')
  console.log(`Base URL: ${BASE_URL}`)

  // Intentar crear usuarios de prueba
  let createdCount = 0
  for (const user of TEST_USERS) {
    const success = await createUser(user)
    if (success) createdCount++
  }

  console.log(`✓ Setup complete: ${createdCount}/${TEST_USERS.length} users created\n`)

  // Continuar aunque fallen algunos (podrían ya existir)
  return async () => {}
}

export default globalSetup
