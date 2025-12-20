/**
 * Helpers y utilidades para tests E2E
 */

import { Page, expect } from '@playwright/test'

/**
 * Credenciales de usuarios de prueba
 */
export const TEST_USERS = {
  SUPER_ADMIN: {
    username: 'admin@webquote.com',
    password: 'Admin123!',
    role: 'SUPER_ADMIN',
    name: 'Super Admin'
  },
  ADMIN: {
    username: 'manager@webquote.com',
    password: 'Manager123!',
    role: 'ADMIN',
    name: 'Admin Manager'
  },
  CLIENT: {
    username: 'client@example.com',
    password: 'Client123!',
    role: 'CLIENT',
    name: 'Test Client'
  }
}

/**
 * Realiza login en la aplicación
 */
export async function login(page: Page, user: typeof TEST_USERS.SUPER_ADMIN) {
  await page.goto('/login')
  
  // Esperar a que el formulario sea visible
  await page.waitForSelector('input[name="username"]', { timeout: 5000 })
  
  // Llenar formulario
  await page.fill('input[name="username"]', user.username)
  await page.fill('input[name="password"]', user.password)
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Esperar redirección exitosa (puede ser a / o /admin)
  await page.waitForURL(/\/(admin)?$/, { timeout: 10000 })
  
  // Verificar que hay sesión activa
  await expect(page.locator('body')).not.toContainText('Iniciar sesión')
}

/**
 * Realiza logout de la aplicación
 */
export async function logout(page: Page) {
  // Buscar menú de usuario
  const userMenu = page.locator('[aria-label*="usuario"], [data-testid="user-menu"], button:has-text("Perfil")')
  
  if (await userMenu.count() > 0) {
    await userMenu.first().click()
  }
  
  // Click en logout
  const logoutButton = page.locator('button:has-text("Cerrar"), a:has-text("Salir")')
  await logoutButton.first().click()
  
  // Verificar redirección a login
  await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 })
}

/**
 * Limpia el estado de la sesión
 */
export async function clearSession(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

/**
 * Espera a que la aplicación termine de cargar
 */
export async function waitForAppReady(page: Page) {
  // Esperar a que no haya spinners
  await page.waitForSelector('.loading, [data-loading="true"]', { 
    state: 'hidden', 
    timeout: 10000 
  }).catch(() => {
    // Ignorar si no hay spinners
  })
  
  // Esperar a que termine carga de red
  await page.waitForLoadState('networkidle')
}

/**
 * Navega a una sección del admin panel
 */
export async function navigateToAdminSection(page: Page, section: string) {
  await page.goto('/admin')
  await waitForAppReady(page)
  
  // Click en tab/link de la sección
  await page.click(`text=/${section}/i`)
  await waitForAppReady(page)
}

/**
 * Verifica que un elemento esté visible con retry
 */
export async function expectVisible(page: Page, selector: string, timeout = 5000) {
  await expect(page.locator(selector)).toBeVisible({ timeout })
}

/**
 * Verifica que un elemento NO esté visible
 */
export async function expectNotVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible()
}

/**
 * Toma screenshot con nombre descriptivo
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  })
}

/**
 * Crea un usuario de prueba via API
 */
export async function createTestUser(
  page: Page, 
  userData: {
    username: string
    password: string
    role: string
    nombre?: string
    quotationAssignedId?: string
  }
) {
  const response = await page.request.post('/api/users', {
    data: userData
  })
  
  expect(response.status()).toBe(200)
  const data = await response.json()
  return data.data
}

/**
 * Elimina un usuario de prueba via API
 */
export async function deleteTestUser(page: Page, userId: string) {
  const response = await page.request.delete(`/api/users/${userId}`)
  expect(response.ok()).toBeTruthy()
}

/**
 * Verifica que un mensaje de error esté visible
 */
export async function expectErrorMessage(page: Page, messagePattern: string | RegExp) {
  const errorLocator = page.locator(`text=/${messagePattern}/i, [role="alert"]`)
  await expect(errorLocator.first()).toBeVisible({ timeout: 5000 })
}

/**
 * Verifica que un mensaje de éxito esté visible
 */
export async function expectSuccessMessage(page: Page, messagePattern: string | RegExp) {
  const successLocator = page.locator(`text=/${messagePattern}/i, [role="status"]`)
  await expect(successLocator.first()).toBeVisible({ timeout: 5000 })
}

/**
 * Espera a que termine una operación asíncrona
 */
export async function waitForOperation(page: Page, timeout = 3000) {
  // Esperar a que aparezca y desaparezca el loader
  const loader = page.locator('[data-loading="true"], .loading, .spinner')
  
  try {
    await loader.waitFor({ state: 'visible', timeout: 1000 })
    await loader.waitFor({ state: 'hidden', timeout })
  } catch {
    // Si no hay loader, continuar
  }
}

/**
 * Llena un formulario con datos
 */
export async function fillForm(page: Page, formData: Record<string, string>) {
  for (const [field, value] of Object.entries(formData)) {
    const input = page.locator(`input[name="${field}"], textarea[name="${field}"]`)
    await input.fill(value)
  }
}

/**
 * Verifica que una tabla tenga cierto número de filas
 */
export async function expectTableRowCount(
  page: Page, 
  count: number | { min?: number; max?: number }
) {
  const rows = page.locator('table tbody tr')
  
  if (typeof count === 'number') {
    await expect(rows).toHaveCount(count)
  } else {
    const actualCount = await rows.count()
    if (count.min !== undefined) {
      expect(actualCount).toBeGreaterThanOrEqual(count.min)
    }
    if (count.max !== undefined) {
      expect(actualCount).toBeLessThanOrEqual(count.max)
    }
  }
}

/**
 * Busca en una tabla y verifica resultados
 */
export async function searchInTable(
  page: Page, 
  searchTerm: string,
  expectedResults: number | { min?: number; max?: number }
) {
  const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]')
  await searchInput.fill(searchTerm)
  
  // Esperar a que se actualice la tabla
  await page.waitForTimeout(500)
  await waitForOperation(page)
  
  await expectTableRowCount(page, expectedResults)
}

/**
 * Ordena una tabla por columna
 */
export async function sortTableBy(page: Page, columnName: string) {
  const columnHeader = page.locator(`th:has-text("${columnName}")`)
  await columnHeader.click()
  await waitForOperation(page)
}

/**
 * Cambia el tamaño de página en una tabla paginada
 */
export async function changePageSize(page: Page, size: number) {
  const pageSizeSelect = page.locator('select[aria-label*="página"], select[name="pageSize"]')
  await pageSizeSelect.selectOption(size.toString())
  await waitForOperation(page)
}
