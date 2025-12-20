# 📊 ANÁLISIS DE SISTEMAS DE TESTING EXISTENTES

## 1. Estado Actual del Testing

### Frameworks Identificados

| Framework | Propósito | Ubicación | Patrón |
|-----------|-----------|-----------|--------|
| **Playwright** | E2E Testing | `tests/e2e/**/*.spec.ts` | Page Object + Fixtures |
| **Jest** | Unit Testing | `src/**/__tests__/*.test.ts` | renderHook + Testing Library |
| **TSX Runner** | Performance | `scripts/performance-test.ts` | Direct execution |

### Configuración de Scripts

```json
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report",
  "test:performance": "tsx scripts/performance-test.ts"
}
```

**Nota**: NO hay comando `npm test` para unit tests en package.json. Jest corre implícitamente en watch mode o CI.

---

## 2. Estructura de Tests Existentes

### 2.1 Unit Tests (Jest)

**Ubicación**: `src/stores/__tests__/`

```
src/stores/
├── __tests__/
│   ├── discountsStore.test.ts      ✅ 
│   ├── modalStore.test.ts           ✅
│   ├── validationStore.test.ts      ✅
│   ├── templateStore.test.ts        ✅
│   ├── snapshotStore.test.ts        ✅
│   ├── servicesStore.test.ts        ✅
│   ├── quotationStore.test.ts       ✅ (221 líneas)
│   └── paymentStore.test.ts         ✅
├── userPreferencesStore.test.ts    ✅ (En raíz de stores)
```

**Pattern Usado**:
```typescript
import { renderHook, act } from '@testing-library/react'
import { useQuotationStore } from '../quotationStore'

describe('quotationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useQuotationStore())
    act(() => {
      result.current.reset()
    })
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      // Test logic
    })
  })
})
```

**Patrón de Dependencias**:
- ✅ Testing Library: `renderHook`, `act`
- ✅ Jest Mocks: `jest.mock()`, `jest.fn()`
- ✅ Jest Assertions: `expect()`, `toBeNull()`, `toEqual()`
- ✅ Async Handling: `async/await` con `act()`

---

### 2.2 E2E Tests (Playwright)

**Ubicación**: `tests/e2e/`

```
tests/e2e/
├── auth/
│   └── login.spec.ts              ✅ (111 líneas)
├── permissions/
│   └── api-protection.spec.ts     ✅
└── quotations/
    └── quotation-filtering.spec.ts ✅
```

**Pattern Usado**:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
  })

  test('redirige a login desde /admin si no autenticado', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/login/)
  })
})
```

**Características**:
- ✅ Fixtures de Playwright automáticas (`page`, `context`)
- ✅ Manejo de navegación y esperas
- ✅ Screenshots y videos en fallos
- ✅ Reportes HTML
- ✅ Retries automáticos en CI

---

### 2.3 Tests de Integración Custom

**Ubicación**: `tests/`

```
tests/
├── offline-sync.test.ts           ✅ (251 líneas)
├── permissions-cache.test.ts      ✅
```

**Pattern Usado**:
```typescript
describe('Sistema de Sincronización Offline→Online', () => {
  describe('Tipos TypeScript', () => {
    test('LoadingPhase incluye "offline-cached"', () => {
      const phase = 'offline-cached'
      expect(['idle', 'cache', 'analyzing', 'syncing']).toContain(phase)
    })
  })
})
```

---

## 3. Configuración de Jest

### 3.1 Configuración Implícita

No hay `jest.config.js`, pero la configuración está en:

**tsconfig.json**:
```json
{
  "exclude": [
    "src/**/__tests__/**",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/**/*.spec.ts",
    "src/**/*.spec.tsx"
  ]
}
```

**Implicaciones**:
- ✅ Jest autodetecta patrones `**/*.test.ts` y `**/*.spec.ts`
- ✅ Tests excluidos de compilación Next.js (no en build)
- ✅ Configuración por defecto de Jest

### 3.2 Configuración de Playwright

**File**: `playwright.config.ts` (81 líneas)

**Key Settings**:
```typescript
{
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  baseURL: 'http://localhost:4101',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

---

## 4. Patrón de Testing para Zustand

### Pattern 1: Hook Básico

```typescript
describe('useStore', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useStore())
    
    act(() => {
      result.current.update(newValue)
    })
    
    expect(result.current.value).toBe(newValue)
  })
})
```

### Pattern 2: Async Operations

```typescript
it('should handle async actions', async () => {
  const { result } = renderHook(() => useStore())
  
  ;(apiMock as jest.Mock).mockResolvedValueOnce(data)
  
  await act(async () => {
    await result.current.fetchData()
  })
  
  expect(result.current.data).toEqual(data)
})
```

### Pattern 3: Error Handling

```typescript
it('should handle errors', async () => {
  ;(apiMock as jest.Mock).mockRejectedValueOnce(error)
  
  const { result } = renderHook(() => useStore())
  
  await act(async () => {
    await result.current.fetchData()
  })
  
  expect(result.current.error).toBe(error.message)
})
```

---

## 5. Puntos Clave para Tests de Sync Store

### ✅ Lo que YA EXISTE y se DEBE USAR:

1. **Framework**: Jest + Testing Library (NO instalar vitest ni mocha)
2. **Patrón**: `renderHook` + `act` para hooks de Zustand
3. **Ubicación**: `src/stores/__tests__/quotationSyncStore.test.ts`
4. **Naming**: `*.test.ts` (seguir convención)
5. **Structure**: `describe` + `beforeEach` + `it`
6. **Mocks**: `jest.mock()` para dependencias

### ❌ Lo que NO HACER:

1. ~~Crear nuevos frameworks de testing~~
2. ~~Usar vitest (aunque lo menciona node_modules)~~
3. ~~Crear jest.config.js (ya está configurado implícitamente)~~
4. ~~Mezclar patrones de Playwright en unit tests~~
5. ~~Crear tests fuera de `__tests__` o `.test.ts`~~

---

## 6. Características de Testing Existentes

### 6.1 Mocking

```typescript
// Pattern utilizado en todos los tests
jest.mock('../utils/quotationApi', () => ({
  quotationApi: {
    getQuotation: jest.fn(),
    updateQuotation: jest.fn(),
  },
}))

import { quotationApi } from '../utils/quotationApi'

// En tests:
;(quotationApi.getQuotation as jest.Mock).mockResolvedValueOnce(data)
```

### 6.2 Cleanup Automático

```typescript
beforeEach(() => {
  // Reset después de cada test
  jest.clearAllMocks()
  // Reset store state
  result.current.reset()
})
```

### 6.3 Async Handling

```typescript
await act(async () => {
  await result.current.asyncMethod()
})

// Sin act para métodos síncronos
act(() => {
  result.current.syncMethod()
})
```

---

## 7. Plan de Testing para Quotation Sync Store

### Phase 1: Unit Tests para Store
**Archivo**: `src/stores/__tests__/quotationSyncStore.test.ts`

```typescript
describe('useQuotationSyncStore', () => {
  beforeEach(() => {
    // Reset listeners y estado
  })

  describe('Initial State', () => {
    it('should start with no listeners')
    it('should have empty event history')
  })

  describe('emit()', () => {
    it('should emit event and notify listeners')
    it('should handle multiple event types')
    it('should handle wildcards (*)')
  })

  describe('subscribe()', () => {
    it('should subscribe to specific event')
    it('should return unsubscribe function')
    it('should notify listener on emit')
  })

  describe('clearListeners()', () => {
    it('should remove all listeners')
    it('should handle specific event type cleanup')
  })

  describe('Error Handling', () => {
    it('should catch listener errors without breaking others')
    it('should log errors to console')
  })

  describe('Memory Management', () => {
    it('should prevent memory leaks on unsubscribe')
    it('should clean up properly on reset')
  })
})
```

### Phase 2: Integration Tests
**Archivo**: `tests/quotation-sync-integration.test.ts`

```typescript
describe('Quotation Sync Integration', () => {
  describe('Event Flow', () => {
    it('should sync across multiple listeners')
    it('should maintain event order')
  })

  describe('with Admin Page', () => {
    it('should emit on guardarEdicion()')
    it('should trigger historialTab refresh')
  })

  describe('with UserManagementPanel', () => {
    it('should recalculate groups on update')
  })
})
```

### Phase 3: E2E Tests
**Archivo**: `tests/e2e/quotations/sync.spec.ts`

```typescript
test.describe('Quotation Synchronization', () => {
  test('should update all components when quotation changes', async ({ page }) => {
    // 1. Load admin page
    // 2. Edit quotation
    // 3. Save
    // 4. Verify HistorialTAB updates
    // 5. Verify UserPanel updates
  })
})
```

---

## 8. Checklist de Implementación Testing

### Pre-Implementation
- [x] Identificar frameworks existentes (Jest + Playwright)
- [x] Analizar patrones actuales
- [x] Revisar ubicaciones de tests
- [x] Entender convenciones de naming

### Unit Tests
- [ ] Crear `src/stores/__tests__/quotationSyncStore.test.ts`
- [ ] Test initial state
- [ ] Test emit()
- [ ] Test subscribe()
- [ ] Test listener cleanup
- [ ] Test error handling
- [ ] Test memory management
- [ ] Verificar cobertura >80%

### Integration Tests
- [ ] Crear `tests/quotation-sync-integration.test.ts`
- [ ] Test event flow
- [ ] Test with Admin Page
- [ ] Test with HistorialTAB
- [ ] Test with UserManagementPanel

### E2E Tests
- [ ] Crear `tests/e2e/quotations/sync.spec.ts`
- [ ] Test save → sync
- [ ] Test create version → sync
- [ ] Test activate → sync
- [ ] Verificar en múltiples navegadores

### CI/CD Integration
- [ ] Verificar que tests corran en CI
- [ ] Configurar retries si es necesario
- [ ] Documentar comando para correr tests

---

## 9. Recomendaciones Específicas

### ✅ HACER:

1. **Usar renderHook para Zustand**: Patrón estándar del proyecto
2. **Mock de API**: Usar `jest.mock()` consistentemente
3. **Cleanup**: `beforeEach` con reset y `clearAllMocks()`
4. **Ubicación**: `src/stores/__tests__/` para unit tests
5. **Naming**: Seguir `*.test.ts` o `*.spec.ts`
6. **Cobertura**: Aim for >80% coverage
7. **Async**: Usar `act()` con `await` para async operations

### ⚠️ CONSIDERAR:

1. **Listener Tests**: Difícil testear listeners directamente, usar mocks
2. **Event Timing**: Puede haber race conditions en tests
3. **Memory Leaks**: Importante probar cleanup en listeners

### 📝 DOCUMENTAR:

1. Cómo correr tests unitarios
2. Cómo debuggear tests
3. Cómo agregar nuevos tests
4. Cómo medir cobertura

---

## 10. Resumen Ejecutivo

| Aspecto | Estado | Framework | Ubicación |
|--------|--------|-----------|-----------|
| **Unit Tests** | ✅ Activo | Jest + Testing Library | `src/**/__tests__/**` |
| **E2E Tests** | ✅ Activo | Playwright | `tests/e2e/**` |
| **Integration** | ✅ Existe | Jest Custom | `tests/**` |
| **Performance** | ⚠️ Manual | TSX Runner | `scripts/` |
| **Code Coverage** | ❌ No configurado | - | - |

### Action Items:

1. ✅ **DONE**: Revisar sistemas existentes
2. 📋 **NEXT**: Crear tests unitarios para Sync Store
3. 📋 **NEXT**: Crear tests de integración
4. 📋 **NEXT**: Crear E2E tests
5. 📋 **NEXT**: Documentar proceso

