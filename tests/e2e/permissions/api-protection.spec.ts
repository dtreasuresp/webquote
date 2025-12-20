import { test, expect } from '@playwright/test'

/**
 * Tests de Sistema de Permisos Granulares
 * Verifica que los permisos se apliquen correctamente en API y UI
 */

// Usuarios de prueba con diferentes roles
const SUPER_ADMIN = {
  username: 'admin@webquote.com',
  password: 'Admin123!',
  role: 'SUPER_ADMIN'
}

const CLIENT_USER = {
  username: 'client@example.com',
  password: 'Client123!',
  role: 'CLIENT'
}

/**
 * Helper para hacer login
 */
async function login(page: any, user: typeof SUPER_ADMIN) {
  await page.goto('/login')
  await page.waitForSelector('input#username', { timeout: 5000 })
  await page.fill('input#username', user.username)
  await page.fill('input#password', user.password)
  
  const navigationPromise = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
  await page.click('button[type="submit"]')
  await navigationPromise
}

test.describe('Permisos API', () => {
  
  test('SUPER_ADMIN debe tener acceso completo a todas las APIs', async ({ page }) => {
    await login(page, SUPER_ADMIN)
    
    const protectedEndpoints = [
      '/api/users',
      '/api/roles',
      '/api/permissions',
      '/api/audit-logs',
      '/api/quotation-config'
    ]
    
    for (const endpoint of protectedEndpoints) {
      const response = await page.request.get(endpoint)
      expect(response.status()).toBeLessThan(400) // No debe ser 401 o 403
    }
  })

  test('CLIENT sin permisos debe recibir 403 en APIs protegidas', async ({ page }) => {
    // Nota: Este test requiere un usuario CLIENT sin permisos específicos
    test.skip() // Descomentar cuando exista usuario de prueba
    
    await login(page, CLIENT_USER)
    
    const response = await page.request.get('/api/users')
    expect(response.status()).toBe(403)
    
    const json = await response.json()
    expect(json.error).toContain('permiso')
  })

  test('debe respetar accessLevel read (solo lectura)', async ({ page, request }) => {
    // Nota: Requiere usuario con permiso users.view pero no users.edit
    test.skip()
    
    // Usuario puede hacer GET
    const getResponse = await request.get('/api/users')
    expect(getResponse.status()).toBe(200)
    
    // Pero no puede hacer POST (crear)
    const postResponse = await request.post('/api/users', {
      data: {
        username: 'newuser@example.com',
        password: 'Test123!',
        role: 'CLIENT'
      }
    })
    expect(postResponse.status()).toBe(403)
  })

  test('debe respetar accessLevel write (lectura + escritura)', async ({ page, request }) => {
    test.skip() // Implementar con usuario de prueba
    
    // Usuario puede crear y editar
    const postResponse = await request.post('/api/users', {
      data: {
        username: 'newuser@example.com',
        password: 'Test123!',
        role: 'CLIENT'
      }
    })
    expect(postResponse.status()).toBe(200)
    
    // Pero no puede eliminar (requiere accessLevel full)
    const deleteResponse = await request.delete('/api/users/some-id')
    expect(deleteResponse.status()).toBe(403)
  })
})

test.describe('Permisos UI - Renderizado Condicional', () => {
  
  test('SUPER_ADMIN debe ver todos los botones de acción', async ({ page }) => {
    await login(page, SUPER_ADMIN)
    await page.goto('/admin')
    
    // Navegar a sección de usuarios
    await page.click('text=/usuarios/i')
    await page.waitForLoadState('networkidle')
    
    // Debe ver botón "Crear Usuario"
    const createButton = page.locator('button:has-text("Crear"), button:has-text("Nuevo Usuario")')
    await expect(createButton.first()).toBeVisible()
    
    // Debe ver botones de edición en tabla
    const editButtons = page.locator('button[aria-label*="Editar"], button:has([data-icon="edit"])')
    await expect(editButtons.first()).toBeVisible()
    
    // Debe ver botones de eliminación
    const deleteButtons = page.locator('button[aria-label*="Eliminar"], button:has([data-icon="trash"])')
    await expect(deleteButtons.first()).toBeVisible()
  })

  test('usuario sin permisos no debe ver botones de acción', async ({ page }) => {
    test.skip() // Implementar con usuario CLIENT sin permisos
    
    await login(page, CLIENT_USER)
    await page.goto('/admin')
    
    // No debe ver botón crear
    const createButton = page.locator('button:has-text("Crear"), button:has-text("Nuevo")')
    await expect(createButton).toHaveCount(0)
  })

  test('debe ocultar tabs/secciones sin permisos', async ({ page }) => {
    test.skip()
    
    await login(page, CLIENT_USER)
    await page.goto('/admin')
    
    // Tabs que requieren permisos especiales no deben ser visibles
    const securityTab = page.locator('text=/seguridad|permisos|roles/i')
    await expect(securityTab).toHaveCount(0)
  })

  test('debe mostrar mensaje de acceso denegado en rutas protegidas', async ({ page }) => {
    test.skip()
    
    await login(page, CLIENT_USER)
    
    // Intentar acceder directamente a ruta protegida
    await page.goto('/admin/usuarios')
    
    // Debe mostrar mensaje de acceso denegado
    const deniedMessage = page.locator('text=/acceso denegado|sin permisos|no autorizado/i')
    await expect(deniedMessage).toBeVisible()
  })
})

test.describe('Permisos - Filtrado por AccessLevel', () => {
  
  test('logs de auditoría debe filtrar por usuario si no tiene view_all', async ({ page }) => {
    test.skip()
    
    // Usuario con logs.view_own pero no logs.view_all
    await login(page, CLIENT_USER)
    await page.goto('/admin/seguridad/logs')
    
    // Esperar a que cargue tabla
    await page.waitForSelector('table')
    
    // Verificar que solo muestra logs del usuario actual
    const logRows = page.locator('table tbody tr')
    const rowCount = await logRows.count()
    
    for (let i = 0; i < rowCount; i++) {
      const userCell = logRows.nth(i).locator('td:has-text("@")')
      await expect(userCell).toContainText(CLIENT_USER.username)
    }
  })

  test('exportación CSV solo disponible con accessLevel full', async ({ page }) => {
    test.skip()
    
    // Usuario con logs.view pero no logs.export
    await login(page, CLIENT_USER)
    await page.goto('/admin/seguridad/logs')
    
    // Botón de exportar no debe ser visible
    const exportButton = page.locator('button:has-text("Exportar"), button:has([data-icon="download"])')
    await expect(exportButton).toHaveCount(0)
  })
})

test.describe('Permisos - Jerarquía de Roles', () => {
  
  test('SUPER_ADMIN puede modificar todos los usuarios', async ({ page }) => {
    await login(page, SUPER_ADMIN)
    await page.goto('/admin/usuarios')
    
    // Todos los usuarios deben tener botón editar
    const editButtons = page.locator('button[aria-label*="Editar"]')
    const count = await editButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('ADMIN no puede editar SUPER_ADMIN', async ({ page }) => {
    test.skip() // Implementar con usuario ADMIN
    
    // Login como ADMIN
    await page.goto('/admin/usuarios')
    
    // Buscar fila de SUPER_ADMIN
    const superAdminRow = page.locator('tr:has-text("SUPER_ADMIN")')
    
    // Botón editar debe estar deshabilitado o no visible
    const editButton = superAdminRow.locator('button[aria-label*="Editar"]')
    await expect(editButton).toBeDisabled()
  })

  test('CLIENT solo puede ver su propio perfil', async ({ page }) => {
    test.skip()
    
    await login(page, CLIENT_USER)
    await page.goto('/admin/usuarios')
    
    // Debe ver solo 1 usuario (sí mismo)
    const userRows = page.locator('table tbody tr')
    await expect(userRows).toHaveCount(1)
    
    const username = userRows.first().locator('td').first()
    await expect(username).toContainText(CLIENT_USER.username)
  })
})

test.describe('Permisos - Persistencia', () => {
  
  test('permisos deben persistir después de recargar página', async ({ page }) => {
    await login(page, SUPER_ADMIN)
    await page.goto('/admin/usuarios')
    
    // Verificar que botón crear existe
    const createButtonBefore = page.locator('button:has-text("Crear")')
    await expect(createButtonBefore.first()).toBeVisible()
    
    // Recargar página
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Botón debe seguir visible
    const createButtonAfter = page.locator('button:has-text("Crear")')
    await expect(createButtonAfter.first()).toBeVisible()
  })

  test('cambios en permisos deben reflejarse sin relogin', async ({ page }) => {
    test.skip() // Requiere modificar permisos durante test
    
    await login(page, CLIENT_USER)
    await page.goto('/admin')
    
    // Verificar estado inicial (sin permisos)
    let createButton = page.locator('button:has-text("Crear")')
    await expect(createButton).toHaveCount(0)
    
    // Modificar permisos (via API o segunda sesión de SUPER_ADMIN)
    // ...
    
    // Esperar actualización (caché debe invalidarse)
    await page.waitForTimeout(6000) // Esperar expiración de caché (5min + buffer)
    await page.reload()
    
    // Ahora debe tener permisos
    createButton = page.locator('button:has-text("Crear")')
    await expect(createButton.first()).toBeVisible()
  })
})
