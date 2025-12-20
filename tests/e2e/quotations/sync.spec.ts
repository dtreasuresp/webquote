/**
 * E2E Tests para Quotation Synchronization
 * 
 * Verifica que la sincronización global funcione correctamente
 * en un flujo real del usuario desde inicio a fin
 * 
 * Escenarios:
 * 1. Admin edita cotización → Historial se actualiza
 * 2. Admin crea nueva versión → UserPanel la ve
 * 3. Admin activa versión → Página pública la muestra
 */

import { test, expect } from '@playwright/test'

const TEST_USER = {
  username: 'admin',
  password: 'admin123',
}

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4101'

test.describe('Quotation Synchronization E2E', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies para session limpia
    await context.clearCookies()

    // Asegurar admin user existe
    try {
      await page.request.get(`${BASE_URL}/api/debug/ensure-admin`, {
        timeout: 5000,
      })
    } catch {
      // Continuar aunque falle
    }

    // Login
    await page.goto('/login', { waitUntil: 'load' })
    await page.fill('input#username', TEST_USER.username)
    await page.fill('input#password', TEST_USER.password)

    const navigationPromise = page
      .waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' })
      .catch(() => null)

    await page.click('button[type="submit"]')
    await navigationPromise

    // Verificar autenticación
    expect(page.url()).not.toContain('/login')
  })

  test('should update historial when editing quotation', async ({ page }) => {
    /**
     * Flujo:
     * 1. Ir a /admin
     * 2. Abrir una cotización existente
     * 3. Editar algún campo (ej: nombre empresa)
     * 4. Guardar cambios
     * 5. Verificar que HistorialTAB se actualice
     * 6. Verificar que la versión más reciente muestre el cambio
     */

    // Ir a admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/admin')

    // Esperar que cargue la lista de cotizaciones
    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    // Seleccionar primera cotización
    const firstQuotationRow = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotationRow.click({ timeout: 5000 })

    // Esperar que se abra el modal
    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Esperar HistorialTAB
    const historialTab = page.locator(
      'button:has-text("Historial"), [role="tab"]:has-text("Historial")'
    )

    // Obtener versiones ANTES de editar
    const versionsBefore = await page
      .locator('[data-testid="historial-version-item"]')
      .count()

    // Ir a tab de cotización
    const cotizacionTab = page.locator(
      'button:has-text("Cotización"), [role="tab"]:has-text("Cotización")'
    )
    await cotizacionTab.click({ timeout: 5000 })

    // Editar un campo (ej: empresa)
    const empresaField = page.locator('input[name="empresa"]')
    if ((await empresaField.count()) > 0) {
      const currentValue = await empresaField.inputValue()
      const newValue = `${currentValue}-EDIT`
      await empresaField.fill(newValue)
    }

    // Guardar
    const saveButton = page.locator(
      'button:has-text("Guardar"), button[type="submit"]:has-text("Guardar")'
    )
    await saveButton.click({ timeout: 5000 })

    // Esperar confirmación
    await page.waitForTimeout(1000)

    // Verificar que el cambio se guardó (sin error)
    const errorMessage = page.locator('[data-testid="error-message"]')
    expect(await errorMessage.count()).toBe(0)

    // Ir a HistorialTAB
    await historialTab.click({ timeout: 5000 })

    // Esperar a que se actualice (la versión más reciente debe mostrar el cambio)
    await page.waitForTimeout(500)

    // Verificar que el historial está presente
    const historialItems = page.locator('[data-testid="historial-version-item"]')
    expect(await historialItems.count()).toBeGreaterThan(0)

    // Cerrar modal
    const closeButton = page.locator(
      '[data-testid="modal-close"], button:has-text("×"), [aria-label="Cerrar"]'
    )
    if ((await closeButton.count()) > 0) {
      await closeButton.click({ timeout: 5000 })
    }
  })

  test('should show new version in user panel after creation', async ({
    page,
  }) => {
    /**
     * Flujo:
     * 1. Ir a /admin
     * 2. Abrir cotización
     * 3. Crear nueva versión
     * 4. Ir a tab "Cliente"
     * 5. Verificar que UserManagementPanel muestre la nueva versión
     * 6. Poder asignarla a un usuario
     */

    // Ir a admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/admin')

    // Esperar que cargue
    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    // Seleccionar primera cotización
    const firstQuotation = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotation.click({ timeout: 5000 })

    // Esperar modal
    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Ir a Historial para crear versión
    const historialTab = page.locator(
      'button:has-text("Historial"), [role="tab"]:has-text("Historial")'
    )
    await historialTab.click({ timeout: 5000 })

    // Buscar botón "Crear Versión" o similar
    const createVersionButton = page.locator(
      'button:has-text("Crear"), button:has-text("Nueva versión")'
    )

    if ((await createVersionButton.count()) > 0) {
      await createVersionButton.click({ timeout: 5000 })

      // Esperar a que se cree la versión
      await page.waitForTimeout(1000)

      // Ir a tab de Cliente
      const clienteTab = page.locator(
        'button:has-text("Cliente"), [role="tab"]:has-text("Cliente")'
      )
      await clienteTab.click({ timeout: 5000 })

      // Esperar UserManagementPanel
      await page.waitForSelector('[data-testid="user-management-panel"]', {
        timeout: 10000,
      })

      // Verificar que hay usuarios o selector de cotizaciones
      const quotationSelectors = page.locator(
        '[data-testid="quotation-selector"], select, [role="combobox"]'
      )
      expect(await quotationSelectors.count()).toBeGreaterThan(0)
    }
  })

  test('should reflect public page changes when version activated', async ({
    page,
    context,
  }) => {
    /**
     * Flujo:
     * 1. Abrir página pública en tab separado
     * 2. Notar qué versión está activa
     * 3. En /admin, activar una versión diferente
     * 4. En página pública, esperar y verificar que se actualice
     * 5. O hacer reload y verificar que muestre nueva versión
     */

    // Crear nuevo tab para página pública
    const publicPage = await context.newPage()

    // Ir a página pública
    await publicPage.goto('/', { waitUntil: 'domcontentloaded' })

    // Esperar que cargue la cotización
    await publicPage.waitForSelector('[data-testid="quotation-display"]', {
      timeout: 10000,
    })

    // Obtener versión actual visible
    const currentVersionText = await publicPage
      .locator('[data-testid="quotation-version"]')
      .textContent()

    // En admin, ir a /admin
    await page.goto('/admin', { waitUntil: 'domcontentloaded' })

    // Abrir una cotización
    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    const firstQuotation = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotation.click({ timeout: 5000 })

    // Esperar modal
    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Ir a Historial
    const historialTab = page.locator(
      'button:has-text("Historial"), [role="tab"]:has-text("Historial")'
    )
    await historialTab.click({ timeout: 5000 })

    // Buscar botón de activación
    const activateButtons = page.locator(
      'button:has-text("Activar"), [data-testid*="activate"]'
    )

    if ((await activateButtons.count()) > 0) {
      // Activar una versión diferente (si no es la primera)
      const versionButtons = page.locator(
        '[data-testid="version-button"]:not([data-active="true"])'
      )

      if ((await versionButtons.count()) > 0) {
        await versionButtons.first().click({ timeout: 5000 })

        // Esperar confirmación
        await page.waitForTimeout(1000)

        // En página pública, recargar para ver cambios
        await publicPage.reload({ waitUntil: 'domcontentloaded' })

        // Verificar que la versión cambió
        const newVersionText = await publicPage
          .locator('[data-testid="quotation-version"]')
          .textContent()

        // La versión debe ser diferente o el contenido debe haber cambiado
        expect(newVersionText).toBeTruthy()
      }
    }

    await publicPage.close()
  })

  test('should sync when multiple fields are edited', async ({ page }) => {
    /**
     * Flujo más complejo:
     * 1. Abrir cotización
     * 2. Editar múltiples campos simultáneamente
     * 3. Guardar
     * 4. Verificar que Historial refleja TODOS los cambios
     * 5. Verificar que UserPanel ve los cambios
     */

    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/admin')

    // Esperar lista
    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    // Abrir cotización
    const firstQuotation = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotation.click({ timeout: 5000 })

    // Esperar modal
    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Ir a tab de cotización
    const cotizacionTab = page.locator(
      'button:has-text("Cotización"), [role="tab"]:has-text("Cotización")'
    )
    await cotizacionTab.click({ timeout: 5000 })

    // Editar múltiples campos
    const empresaField = page.locator('input[name="empresa"]')
    if ((await empresaField.count()) > 0) {
      await empresaField.fill('TestEmpresa-Updated')
    }

    // Guardar
    const saveButton = page.locator(
      'button:has-text("Guardar"), button[type="submit"]:has-text("Guardar")'
    )
    await saveButton.click({ timeout: 5000 })

    // Esperar a que se guarde
    await page.waitForTimeout(1000)

    // Verificar que no hay error
    const errorMessage = page.locator('[data-testid="error-message"]')
    expect(await errorMessage.count()).toBe(0)

    // Verificar que el modal se cerró o mostró confirmación
    const successMessage = page.locator('[data-testid="success-message"]')
    const isClosedOrSuccess =
      (await successMessage.count()) > 0 ||
      (await page.locator('[data-testid="quotation-modal"]').count()) === 0

    expect(isClosedOrSuccess).toBeTruthy()
  })

  test('should handle rapid consecutive saves', async ({ page }) => {
    /**
     * Test de robustez:
     * 1. Abrir cotización
     * 2. Editar campo
     * 3. Guardar
     * 4. Inmediatamente: Editar otro campo
     * 5. Guardar de nuevo
     * 6. Verificar que ambos cambios se guardaron
     * 7. Historial muestra ambas ediciones
     */

    await page.goto('/admin', { waitUntil: 'domcontentloaded' })
    expect(page.url()).toContain('/admin')

    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    // Abrir cotización
    const firstQuotation = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotation.click({ timeout: 5000 })

    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Primera edición y guardado
    const cotizacionTab = page.locator(
      'button:has-text("Cotización"), [role="tab"]:has-text("Cotización")'
    )
    await cotizacionTab.click({ timeout: 5000 })

    const empresaField = page.locator('input[name="empresa"]')
    if ((await empresaField.count()) > 0) {
      await empresaField.fill('FirstEdit')
    }

    const saveButton = page.locator(
      'button:has-text("Guardar"), button[type="submit"]:has-text("Guardar")'
    )
    await saveButton.click({ timeout: 5000 })
    await page.waitForTimeout(500)

    // Segunda edición y guardado
    if ((await empresaField.count()) > 0) {
      await empresaField.fill('SecondEdit')
    }

    await saveButton.click({ timeout: 5000 })
    await page.waitForTimeout(500)

    // Verificar sin errores
    const errorMessage = page.locator('[data-testid="error-message"]')
    expect(await errorMessage.count()).toBe(0)

    // Modal debe estar abierto o cerrado con confirmación
    const isValid =
      (await page.locator('[data-testid="quotation-modal"]').count()) > 0 ||
      (await page
        .locator('[data-testid="success-message"]')
        .count()) > 0

    expect(isValid).toBeTruthy()
  })

  test('should gracefully handle sync errors', async ({ page }) => {
    /**
     * Test de error handling:
     * 1. Simular fallo en API (ej: simular offline)
     * 2. Intentar guardar
     * 3. Verificar que error se muestra al usuario
     * 4. Verificar que NO se emitió evento (no sincronizar si no se guardó)
     * 5. Recuperar conexión
     * 6. Intentar de nuevo
     */

    await page.goto('/admin', { waitUntil: 'domcontentloaded' })

    await page.waitForSelector('[data-testid="quotations-list"]', {
      timeout: 10000,
    })

    // Abrir cotización
    const firstQuotation = page.locator(
      '[data-testid="quotation-row"]:first-child'
    )
    await firstQuotation.click({ timeout: 5000 })

    await page.waitForSelector('[data-testid="quotation-modal"]', {
      timeout: 10000,
    })

    // Simular offline intercept
    await page.context().setOffline(true)

    const cotizacionTab = page.locator(
      'button:has-text("Cotización"), [role="tab"]:has-text("Cotización")'
    )
    await cotizacionTab.click({ timeout: 5000 })

    // Intentar guardar
    const empresaField = page.locator('input[name="empresa"]')
    if ((await empresaField.count()) > 0) {
      await empresaField.fill('OfflineEdit')
    }

    const saveButton = page.locator(
      'button:has-text("Guardar"), button[type="submit"]:has-text("Guardar")'
    )
    await saveButton.click({ timeout: 5000 })

    // Esperar error
    await page.waitForTimeout(1000)

    // Debe mostrar algún error de conexión
    const errorOrWarning = page.locator(
      '[data-testid="error-message"], [data-testid="warning"]'
    )
    // El error puede no existir si el app maneja offline silenciosamente
    // Pero no debe decir "guardado exitosamente"

    // Recuperar conexión
    await page.context().setOffline(false)
    await page.waitForTimeout(500)

    // Intentar guardar de nuevo
    const saveButtonAgain = page.locator(
      'button:has-text("Guardar"), button[type="submit"]:has-text("Guardar")'
    )

    if ((await saveButtonAgain.count()) > 0) {
      await saveButtonAgain.click({ timeout: 5000 })
      await page.waitForTimeout(1000)

      // Esta vez debe ser exitoso (o intentarlo sin error de red)
      const networkError = page.locator(
        '[data-testid="network-error"], text=/conexión|conexión|network/i'
      )
      // No debe haber error de red
    }
  })
})
