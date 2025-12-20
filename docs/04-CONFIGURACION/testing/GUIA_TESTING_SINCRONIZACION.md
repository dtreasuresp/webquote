# 🧪 GUÍA DE TESTING - Sistema de Sincronización Global

## 📋 Resumen

Este documento describe cómo ejecutar, escribir y mantener los tests para el sistema de sincronización global de cotizaciones implementado con Zustand.

---

## 1. Estructura de Tests Creados

### 1.1 Unit Tests
**Archivo**: `src/stores/__tests__/quotationSyncStore.test.ts` (650+ líneas)

```
Descripción: Prueba todas las funciones del store Zustand
├── Initial State (verificar estado inicial)
├── emit() (emitir eventos)
├── subscribe() (suscribirse a eventos)
├── Error Handling (manejo de errores)
├── clearListeners() (limpiar listeners)
├── reset() (resetear estado)
├── Memory Management (prevenir memory leaks)
├── Event Ordering (orden de eventos)
├── Multiple Event Types (múltiples tipos)
└── Concurrent Operations (operaciones concurrentes)

Total: 50+ test cases
```

### 1.2 Integration Tests
**Archivo**: `tests/quotation-sync-integration.test.ts` (500+ líneas)

```
Descripción: Verifica interacción entre componentes
├── Admin Page → HistorialTAB Sync
├── Admin Page → UserManagementPanel Sync
├── Admin Page → Public Page Sync
├── Cross-Component Event Flow
├── Event Delivery Guarantees
├── Error Recovery
├── Performance Considerations
└── State Consistency

Total: 30+ test cases
```

### 1.3 E2E Tests (Playwright)
**Archivo**: `tests/e2e/quotations/sync.spec.ts` (400+ líneas)

```
Descripción: Prueba flujos completos de usuario
├── Update historial when editing
├── Show new version in user panel
├── Reflect changes on public page
├── Sync with multiple edits
├── Handle rapid saves
└── Handle sync errors

Total: 6 test cases end-to-end
```

---

## 2. Requisitos Previos

### 2.1 Instalación de Dependencias
```bash
# Ya están instaladas (verificar)
npm ls zustand          # ✅ Zustand 5.0.9
npm ls @testing-library # ✅ Testing Library
npm ls @playwright      # ✅ Playwright 1.57.0
```

### 2.2 Verificar Jest Configurado
```bash
# Jest debería estar configurado implícitamente
# Verificar que funciona:
npx jest --version      # Debería mostrar versión

# Si falta, instalar:
npm install --save-dev jest @testing-library/react
```

### 2.3 Verificar Playwright Configurado
```bash
# Verificar playwright.config.ts existe
ls -la playwright.config.ts

# Verificar navegadores instalados
npx playwright install chromium
```

---

## 3. Ejecutar Tests Unitarios

### 3.1 Ejecutar Tests de Sync Store

```bash
# Ejecutar solo tests del sync store
npx jest src/stores/__tests__/quotationSyncStore.test.ts

# Con verbose output
npx jest src/stores/__tests__/quotationSyncStore.test.ts --verbose

# Con coverage
npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage

# Watch mode (rerun on changes)
npx jest src/stores/__tests__/quotationSyncStore.test.ts --watch
```

### 3.2 Ejecutar Todos los Tests de Stores

```bash
# Todos los tests de stores
npx jest src/stores/__tests__/

# Con coverage report
npx jest src/stores/__tests__/ --coverage
```

### 3.3 Ejecutar Todos los Tests Unitarios

```bash
# Todos los tests del proyecto
npx jest

# Con coverage
npx jest --coverage

# Con verbose
npx jest --verbose
```

---

## 4. Ejecutar Tests de Integración

### 4.1 Ejecutar Tests de Integración del Sync

```bash
# Solo tests de integración
npx jest tests/quotation-sync-integration.test.ts

# Con verbose
npx jest tests/quotation-sync-integration.test.ts --verbose

# Watch mode
npx jest tests/quotation-sync-integration.test.ts --watch
```

### 4.2 Ejecutar Todos los Tests de Integración

```bash
# Todos los tests en carpeta tests/
npx jest tests/

# Excluir E2E
npx jest tests/ --testPathIgnorePatterns="e2e"
```

---

## 5. Ejecutar Tests E2E

### 5.1 Ejecutar Tests de Sync E2E

```bash
# Solo tests de sync E2E
npm run test:e2e -- tests/e2e/quotations/sync.spec.ts

# Con UI interactivo
npm run test:e2e:ui -- tests/e2e/quotations/sync.spec.ts

# En modo debug
npm run test:e2e:debug -- tests/e2e/quotations/sync.spec.ts

# Con reporte
npm run test:e2e -- tests/e2e/quotations/sync.spec.ts
npm run test:e2e:report
```

### 5.2 Ejecutar Todos los Tests E2E

```bash
# Todos los tests E2E
npm run test:e2e

# Con UI
npm run test:e2e:ui

# Ver reporte
npm run test:e2e:report
```

### 5.3 Configuración Importante para E2E

```bash
# Necesario: App debe estar corriendo
npm run dev    # En otra terminal

# Variables de entorno
export PLAYWRIGHT_BASE_URL=http://localhost:4101

# O en Windows
set PLAYWRIGHT_BASE_URL=http://localhost:4101
```

---

## 6. Ciclo de Desarrollo Recomendado

### Workflow: Escribir → Ejecutar → Verificar

```bash
# 1. Escribir test
# (Editar archivo .test.ts)

# 2. Ejecutar en watch mode
npx jest src/stores/__tests__/quotationSyncStore.test.ts --watch

# 3. Ver fallo (TDD)
# El test falla porque la funcionalidad no existe

# 4. Implementar funcionalidad
# (Editar el store)

# 5. Ver pasar (test pasa)
# El test ahora pasa

# 6. Refactorizar si es necesario
# (Mejorar código)

# 7. Confirmar que pasa
# (Presionar 'a' en watch mode)
```

---

## 7. Escribir Nuevos Tests

### 7.1 Patrón para Unit Tests de Zustand

```typescript
// src/stores/__tests__/myStore.test.ts
import { renderHook, act } from '@testing-library/react'
import { useMyStore } from '../myStore'

describe('useMyStore', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useMyStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should do something', () => {
    const { result } = renderHook(() => useMyStore())

    act(() => {
      result.current.someAction()
    })

    expect(result.current.someState).toBe(expectedValue)
  })

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useMyStore())

    ;(apiMock as jest.Mock).mockResolvedValueOnce(data)

    await act(async () => {
      await result.current.fetchData()
    })

    expect(result.current.data).toEqual(data)
  })
})
```

### 7.2 Patrón para Tests de Integración

```typescript
// tests/my-integration.test.ts
describe('My Integration Feature', () => {
  describe('Scenario 1', () => {
    it('should work together', () => {
      // Setup
      // Action
      // Assert
      
      const testCase = {
        scenario: 'Description',
        expected: 'Result',
      }
      
      expect(testCase.expected).toBeTruthy()
    })
  })
})
```

### 7.3 Patrón para Tests E2E

```typescript
// tests/e2e/feature/something.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate, login, etc
  })

  test('should do something', async ({ page }) => {
    // Action 1
    await page.goto('/page')
    
    // Action 2
    await page.click('button')
    
    // Assertion
    await expect(page.locator('text')).toBeVisible()
  })
})
```

---

## 8. Debugging Tests

### 8.1 Debugging de Unit Tests

```bash
# Ejecutar un test específico
npx jest src/stores/__tests__/quotationSyncStore.test.ts -t "should emit"

# Con output detallado
npx jest src/stores/__tests__/quotationSyncStore.test.ts --verbose --no-coverage

# Usar --testNamePattern para filtrar
npx jest --testNamePattern="subscribe"
```

### 8.2 Debugging de E2E Tests

```bash
# Modo debug con inspector
npm run test:e2e:debug

# Con UI interactivo
npm run test:e2e:ui

# Pausar en punto específico:
# await page.pause()  // En el test
```

### 8.3 Ver Reporte de Tests

```bash
# Ver reporte HTML de E2E
npm run test:e2e:report

# Ver screenshots de fallos
# Ubicados en: playwright-report/

# Ver videos de fallos (si está configurado)
# Ubicados en: test-results/
```

---

## 9. Cobertura de Tests

### 9.1 Generar Reporte de Cobertura

```bash
# Coverage para sync store
npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage

# Coverage para todos los stores
npx jest src/stores/__tests__/ --coverage

# Coverage para todo el proyecto
npx jest --coverage
```

### 9.2 Interpretar Cobertura

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
quotationSyncStore.ts         |   95.2  |   92.1   |   100   |   95.0  |
-----|---------|----------|---------|---------|

Líneas >= 80% es aceptable
Líneas >= 90% es muy bueno
Líneas >= 95% es excelente
```

### 9.3 Ver Cobertura en HTML

```bash
# Generar reporte HTML
npx jest --coverage --collectCoverage

# Abrir en navegador
open coverage/lcov-report/index.html  # Mac/Linux
start coverage\lcov-report\index.html # Windows
```

---

## 10. CI/CD Integration

### 10.1 Agregar Tests a CI (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npx jest src/stores/__tests__/ --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### 10.2 Comandos para CI

```bash
# Todos los tests sin watch
npm run test:ci

# O individual:
npx jest --ci --coverage --maxWorkers=2
npm run test:e2e
```

---

## 11. Troubleshooting

### Problema: Tests no corren

```bash
# Solución 1: Instalar dependencias
npm install

# Solución 2: Limpiar caché de Jest
npx jest --clearCache

# Solución 3: Verificar Jest instalado
npx jest --version
```

### Problema: Error "Cannot find module"

```bash
# Solución: Verificar imports
# Archivo debe estar en la ubicación correcta
ls -la src/stores/__tests__/quotationSyncStore.test.ts

# Verificar que el archivo que testea existe
ls -la src/stores/quotationSyncStore.ts
```

### Problema: E2E tests no encuentran elementos

```bash
# Solución: Usar esperas correctamente
await page.waitForSelector('[data-testid="element"]', { timeout: 10000 })

# O usar más espera
await page.waitForLoadState('networkidle')
```

### Problema: Tests lentos

```bash
# Optimizar:
# 1. Usar --maxWorkers
npx jest --maxWorkers=4

# 2. Excluir E2E de unit tests
npx jest --testPathIgnorePatterns="e2e"

# 3. Ejecutar en paralelo
npm run test:e2e -- --workers=2
```

---

## 12. Checklist de Pruebas

### Pre-Release Checklist

```
Antes de hacer merge/deploy:

[ ] Unit tests pasan: npx jest src/stores/__tests__/ --coverage
[ ] Coverage >= 80%: npx jest --coverage
[ ] Integration tests pasan: npx jest tests/quotation-sync-integration.test.ts
[ ] E2E tests pasan: npm run test:e2e
[ ] No warnings en tests: --no-warnings
[ ] Reporte de cobertura revisado
[ ] Nuevo código tiene tests
[ ] Deprecated tests removidos
[ ] Tests documentados
```

### Post-Deployment Checklist

```
Después de deploy a producción:

[ ] Monitoreo de errores activado
[ ] Logs revisados
[ ] Performance metrics normales
[ ] Users reportan funcionalidad ok
[ ] No issues relacionados a sync
```

---

## 13. Recursos Útiles

### Documentación
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Comandos Rápidos

```bash
# Ayuda general
npx jest --help
npm run test:e2e -- --help

# Listar todos los tests
npx jest --listTests

# Mostrar coverage por archivo
npx jest --coverage | grep quotation
```

---

## 14. Próximos Pasos

### Tasks Completadas ✅
- [x] Unit tests para sync store (50+ cases)
- [x] Integration tests (30+ cases)
- [x] E2E tests con Playwright (6+ scenarios)
- [x] Guía de ejecución
- [x] Coverage tracking

### Tasks Pendientes (Opcional)
- [ ] Configurar coverage mínimo en CI (80%)
- [ ] Agregar snapshot tests
- [ ] Optimizar performance de tests
- [ ] Documentar cómo debuggear en IDE
- [ ] Crear matriz de compatibilidad de navegadores E2E

---

## 15. Soporte y Contacto

Para preguntas sobre los tests:
1. Revisar este documento
2. Ver ejemplos en los archivos .test.ts
3. Consultar documentación oficial de frameworks
4. Revisar issue en repositorio

