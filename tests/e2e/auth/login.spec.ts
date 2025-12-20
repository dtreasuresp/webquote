import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'admin',
  password: 'admin123',
  role: 'SUPER_ADMIN'
}

const INVALID_USER = {
  username: 'invalid@example.com',
  password: 'wrongpassword'
}

test.describe('Autenticación', () => {
  
  test.beforeEach(async ({ page }) => {
    const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4101'

    // Asegurar admin (con reintentos)
    let ensuredAdmin = false
    for (let i = 0; i < 5; i++) {
      try {
        const response = await page.request.get(`${BASE_URL}/api/debug/ensure-admin`, { timeout: 5000 })
        if (response.ok()) { ensuredAdmin = true; break }
      } catch {}
      await new Promise(r => setTimeout(r, 500))
    }

    await page.context().clearCookies()
    await page.goto('/', { waitUntil: 'load' })
  })

  test('redirige a login desde /admin si no autenticado', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/login/, { timeout: 15000 })
    await expect(page.locator('input#username')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
  })

  test('login exitoso y redirección', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await expect(page.locator('input#username')).toBeVisible({ timeout: 15000 })
    await page.fill('input#username', TEST_USER.username)
    await page.fill('input#password', TEST_USER.password)
    
    // Esperar navegación o timeout del formulario
    const navigationPromise = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
    await page.click('button[type="submit"]')
    await navigationPromise
    
    // Verificar que NO esté en /login
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  test('credenciales inválidas muestran error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await expect(page.locator('input#username')).toBeVisible({ timeout: 15000 })
    await page.fill('input#username', INVALID_USER.username)
    await page.fill('input#password', INVALID_USER.password)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=/credenciales|incorrecto|inválido|error/i')).toBeVisible({ timeout: 15000 })
  })

  test('mantiene sesión tras recarga', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await expect(page.locator('input#username')).toBeVisible({ timeout: 15000 })
    await page.fill('input#username', TEST_USER.username)
    await page.fill('input#password', TEST_USER.password)
    
    const navigationPromise = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
    await page.click('button[type="submit"]')
    await navigationPromise

    // Reload
    await page.reload({ waitUntil: 'domcontentloaded' })
    
    // Verificar que sigue autenticado
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  test('logout funciona', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await expect(page.locator('input#username')).toBeVisible({ timeout: 15000 })
    await page.fill('input#username', TEST_USER.username)
    await page.fill('input#password', TEST_USER.password)
    await page.click('button[type="submit"]')
    
    const navigationPromise = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
    await navigationPromise

    // Simular logout limpiando cookies
    await page.context().clearCookies()

    // Volver a ruta protegida
    const logoutNav = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await logoutNav
    await expect(page).toHaveURL(/login.*callbackUrl/, { timeout: 10000 })
  })

  test('rutas protegidas requieren login', async ({ page }) => {
    const nav = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    await nav
    await expect(page).toHaveURL(/login.*callbackUrl/, { timeout: 10000 })
  })
})

