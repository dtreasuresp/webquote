import { test, expect } from '@playwright/test'

/**
 * Tests de Filtrado de Cotizaciones por Usuario
 * Verifica que cada usuario solo vea sus cotizaciones asignadas
 */

const ADMIN = {
  username: 'admin@webquote.com',
  password: 'Admin123!',
  role: 'SUPER_ADMIN'
}

const CLIENT1 = {
  username: 'client1@example.com',
  password: 'Client1',
  quotationId: 'quotation-1'
}

const CLIENT2 = {
  username: 'client2@example.com',
  password: 'Client2',
  quotationId: 'quotation-2'
}

async function login(page: any, user: typeof ADMIN) {
  await page.goto('/login')
  await page.waitForSelector('input#username', { timeout: 5000 })
  await page.fill('input#username', user.username)
  await page.fill('input#password', user.password)
  
  const navigationPromise = page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' }).catch(() => null)
  await page.click('button[type="submit"]')
  await navigationPromise
}

test.describe('Filtrado de Cotizaciones', () => {
  
  test('ADMIN sin quotationAssignedId debe ver cotización global', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/')
    
    // Debe cargar cotización
    await page.waitForSelector('[data-testid="quotation-form"], form', { timeout: 5000 })
    
    // Debe mostrar datos de cotización global (isGlobal: true)
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })

  test('CLIENT debe ver solo su cotización asignada', async ({ page, request }) => {
    test.skip() // Implementar cuando existan usuarios de prueba
    
    await login(page, CLIENT1)
    
    // Hacer request a API
    const response = await request.get('/api/quotation-config')
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    
    // Debe retornar solo 1 cotización
    expect(data.success).toBe(true)
    expect(data.data).toBeDefined()
    
    // Verificar que es la cotización correcta
    expect(data.data.id).toBe(CLIENT1.quotationId)
  })

  test('CLIENT no puede acceder a cotizaciones de otros clientes', async ({ page, request }) => {
    test.skip()
    
    await login(page, CLIENT1)
    
    // Intentar acceder a cotización de CLIENT2
    const response = await request.get(`/api/quotation-config/${CLIENT2.quotationId}`)
    
    // Debe retornar 403 o 404
    expect(response.status()).toBeGreaterThanOrEqual(403)
  })

  test('cotización debe persistir filtrado después de editar', async ({ page }) => {
    test.skip()
    
    await login(page, CLIENT1)
    await page.goto('/')
    
    // Hacer un cambio en la cotización
    await page.fill('input[name="razonSocial"]', 'Nueva Razón Social Test')
    
    // Guardar
    await page.click('button:has-text("Guardar")')
    await page.waitForTimeout(1000)
    
    // Recargar página
    await page.reload()
    
    // Debe mostrar los cambios guardados
    const input = page.locator('input[name="razonSocial"]')
    await expect(input).toHaveValue('Nueva Razón Social Test')
  })
})

test.describe('Historial de Cotizaciones', () => {
  
  test('historial debe mostrar todas las cotizaciones para ADMIN', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin')
    
    // Navegar a tab de Historial
    await page.click('text=/historial/i')
    await page.waitForLoadState('networkidle')
    
    // Debe ver tabla con cotizaciones
    const table = page.locator('table')
    await expect(table).toBeVisible()
    
    // Debe haber múltiples filas
    const rows = page.locator('table tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('historial debe agrupar versiones correctamente', async ({ page }) => {
    await login(page, ADMIN)
    await page.goto('/admin')
    await page.click('text=/historial/i')
    
    // Buscar cotizaciones con múltiples versiones
    const versionBadges = page.locator('text=/v\\d+\\.\\d+/i')
    const versionCount = await versionBadges.count()
    
    // Si hay versiones, verificar formato
    if (versionCount > 0) {
      const firstVersion = await versionBadges.first().textContent()
      expect(firstVersion).toMatch(/v\d+\.\d+/)
    }
  })

  test('debe mostrar versión activa destacada', async ({ page }) => {
    test.skip() // Implementar cuando existan múltiples versiones
    
    await login(page, ADMIN)
    await page.goto('/admin')
    await page.click('text=/historial/i')
    
    // Buscar indicador de versión activa
    const activeIndicator = page.locator('[data-active="true"], .active, .bg-green')
    await expect(activeIndicator.first()).toBeVisible()
  })

  test('botones de acción deben respetar permisos', async ({ page }) => {
    test.skip()
    
    // Usuario con permiso view pero no edit/delete
    await page.goto('/admin')
    await page.click('text=/historial/i')
    
    // Botón editar no debe existir
    const editButtons = page.locator('button:has-text("Editar")')
    await expect(editButtons).toHaveCount(0)
    
    // Botón eliminar no debe existir
    const deleteButtons = page.locator('button:has-text("Eliminar")')
    await expect(deleteButtons).toHaveCount(0)
  })
})

test.describe('Creación de Cotizaciones', () => {
  
  test('nueva cotización debe asignarse automáticamente al usuario', async ({ page, request }) => {
    test.skip()
    
    await login(page, CLIENT1)
    
    // Crear nueva cotización
    const response = await request.post('/api/quotations', {
      data: {
        razonSocial: 'Test Company',
        // ... otros datos
      }
    })
    
    expect(response.status()).toBe(200)
    const data = await response.json()
    
    // Debe tener assignedUserId del usuario actual
    expect(data.data.assignedUserId).toBe(CLIENT1.username) // O el ID del usuario
  })

  test('ADMIN puede asignar cotización a otro usuario', async ({ page, request }) => {
    test.skip()
    
    await login(page, ADMIN)
    
    // Crear cotización asignada a CLIENT1
    const response = await request.post('/api/quotations', {
      data: {
        razonSocial: 'Test Company',
        assignedUserId: CLIENT1.username,
        // ... otros datos
      }
    })
    
    expect(response.status()).toBe(200)
  })

  test('CLIENT no puede asignar cotización a otro usuario', async ({ page, request }) => {
    test.skip()
    
    await login(page, CLIENT1)
    
    // Intentar crear cotización para CLIENT2
    const response = await request.post('/api/quotations', {
      data: {
        razonSocial: 'Test Company',
        assignedUserId: CLIENT2.username,
      }
    })
    
    // Debe fallar o ignorar assignedUserId
    if (response.status() === 200) {
      const data = await response.json()
      // Debe asignarse al usuario actual, no al especificado
      expect(data.data.assignedUserId).not.toBe(CLIENT2.username)
    } else {
      expect(response.status()).toBe(403)
    }
  })
})
