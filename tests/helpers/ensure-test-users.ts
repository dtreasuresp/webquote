/**
 * Asegurar que existen usuarios de prueba
 * Llama al endpoint debug sin necesidad de BD remota
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4101'

export async function ensureTestUserExists() {
  try {
    console.log('Ensuring test user admin exists...')
    const response = await fetch(`${BASE_URL}/api/debug/ensure-admin`)
    const result = await response.json()
    console.log('Admin user ensured:', result.status)
    return result
  } catch (error) {
    console.error('Error ensuring test user:', error)
    throw error
  }
}
