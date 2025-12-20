# PHASE 15: Testing Complete - Plan Detallado

**Fecha Inicio**: 2025-11-24  
**Estado**: 🔄 Planificación  
**Objetivo**: Crear suite completa de tests (80%+ coverage)

## 📋 Estrategia de Testing

### Nivel 1: Unit Tests (Priori max)

#### 1.1 Performance Utilities Tests
**Archivo**: `src/features/admin/utils/__tests__/performanceOptimizations.test.ts`
**Funciones a testear**:
- `createAutoSaveDebounce()` - Verificar debounce funciona
- `createMemoize()` - Verificar memoización y caché
- `calculateCostoInicialMemoized()` - Valores correctos
- `calculateCostoAño1Memoized()` - Cálculos correctos
- `calculateCostoAño2Memoized()` - Cálculos correctos
- `filterActiveSnapshotsMemoized()` - Filtrado correcto
- `groupServicesByCategoryMemoized()` - Agrupación correcta
- `validateSnapshotMemoized()` - Validación correcta
- `calculateSnapshotSummaryMemoized()` - Resumen correcto
- `hasObjectChanged()` - Comparación correcta
- `batchUpdates()` - Batch correcto
- `getVisibleItems()` - Virtualización correcta
- `scheduleAnimationFrame()` - RAF wrapper correcto
- `createIntersectionObserver()` - Observador correcto

**Test Cases por Función**: 3-5 cada una
**Total Tests Estimados**: 50-70 tests

#### 1.2 HOC withOptimizations Tests
**Archivo**: `src/features/admin/components/__tests__/withOptimizations.test.tsx`
**Tests**:
- HOC aplicado a componente simple
- Prevención de re-renders con props iguales
- Re-render cuando props cambian
- propsToWatch funciona correctamente
- compareProps personalizado funciona
- displayName correcto para debugging
- useOptimizedCallback funciona
- useOptimizedMemo funciona
- usePreviousProps funciona

**Total Tests Estimados**: 12-15 tests

#### 1.3 OptimizedSnapshotCard Tests
**Archivo**: `src/features/admin/components/__tests__/OptimizedSnapshotCard.test.tsx`
**Tests**:
- Renderiza sin errores
- Props cambios disparan handlers
- onEdit callback se llama
- onDelete callback se llama
- onDownload callback se llama
- onCompare callback se llama
- onToggleActivo callback se llama
- Memoización previene re-renders
- Props iguales no disparan re-renders

**Total Tests Estimados**: 12-15 tests

### Nivel 2: Component Integration Tests

#### 2.1 SnapshotsTableSection Tests
**Archivo**: `src/features/admin/components/__tests__/SnapshotsTableSection.test.tsx`
**Tests**:
- Renderiza snapshots correctamente
- Handlers optimizados funcionan
- handleToggleActivo cambiaestado
- handleCompararSnapshot trabaja
- handleDescargarPdf se llama
- useCallback previene re-creaciones
- Estado se actualiza correctamente
- Errores se manejan correctamente

**Total Tests Estimados**: 15-20 tests

#### 2.2 AdminPage Integration
**Archivo**: `src/features/admin/__tests__/AdminPage.integration.test.tsx`
**Tests**:
- AdminPage renderiza con AnalyticsProvider
- Todos los tabs funcionan
- Snapshots cargansync correctamente
- Analytics context disponible
- Performance utilities accesibles
- Navigation funciona
- State management funciona

**Total Tests Estimados**: 10-15 tests

### Nivel 3: Hook Tests

#### 3.1 useEventTracking Tests
**Archivo**: `src/features/admin/hooks/__tests__/useEventTracking.test.ts`
**Tests**:
- Hook inicializa correctamente
- startTracking() funciona
- endTracking() calcula duración
- trackCotizacionCreated() dispara evento
- trackCotizacionEdited() dispara evento
- trackCotizacionDeleted() dispara evento
- trackPaqueteCreated() dispara evento
- trackPaqueteEdited() dispara evento
- trackPaqueteDeleted() dispara evento
- trackSnapshotCreated() dispara evento
- trackSnapshotDeleted() dispara evento
- trackSnapshotExported() dispara evento
- Eventos se registran correctamente

**Total Tests Estimados**: 15-20 tests

#### 3.2 useAnalyticsMetrics Tests
**Archivo**: `src/features/admin/hooks/__tests__/useAnalyticsMetrics.test.ts`
**Tests**:
- getEventMetrics() retorna objeto correcto
- getActionMetrics() retorna objeto correcto
- getEventTrends() calcula tendencias
- getTopEvents() retorna top eventos
- getAverageActionDuration() calcula promedio
- getErrorRate() calcula tasa de errores
- Métricas se actualizan con nuevos eventos

**Total Tests Estimados**: 10-15 tests

### Nivel 4: Snapshot/Comparison Tests

#### 4.1 SnapshotComparison Tests
**Archivo**: `src/features/admin/components/__tests__/SnapshotComparison.test.tsx`
**Tests**:
- Renderiza dos snapshots
- Diferencias se highlightean
- Similitudes se muestran
- Modal funciona
- Rollback disponible
- Comparación accesible

**Total Tests Estimados**: 8-10 tests

#### 4.2 SnapshotDiffViewer Tests
**Archivo**: `src/features/admin/components/__tests__/SnapshotDiffViewer.test.tsx`
**Tests**:
- Visualiza diferencias correctamente
- Cambios se resaltan
- Contexto se muestra
- Líneas viejas/nuevas diferenciadas

**Total Tests Estimados**: 6-8 tests

#### 4.3 SnapshotTimeline Tests
**Archivo**: `src/features/admin/components/__tests__/SnapshotTimeline.test.tsx`
**Tests**:
- Renderiza timeline
- Eventos se ordenan cronológicamente
- Click selecciona evento
- Visual timeline correcto

**Total Tests Estimados**: 8-10 tests

## 📊 Resumen de Tests por Categoría

| Categoría | Archivos | Tests | Peso |
|-----------|----------|-------|------|
| Unit - Utilities | 1 | 50-70 | 30% |
| Unit - HOC | 1 | 12-15 | 10% |
| Unit - Components | 1 | 12-15 | 10% |
| Integration - Sections | 1 | 15-20 | 15% |
| Integration - AdminPage | 1 | 10-15 | 10% |
| Hooks | 2 | 25-35 | 15% |
| Features | 3 | 22-28 | 10% |
| **TOTAL** | **10** | **146-198** | **100%** |

## 🛠️ Stack de Testing

### Dependencias a Instalar
```bash
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install --save-dev @testing-library/user-event jsdom
npm install --save-dev @vitest/coverage-v8
```

### Configuración
- **Test Runner**: Vitest
- **Testing Library**: React Testing Library
- **Assertion**: Expect (Vitest)
- **Coverage**: @vitest/coverage-v8
- **UI**: Vitest UI

### Configuración Vitest (`vitest.config.ts`)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
```

## 📝 Ejemplos de Tests

### Unit Test - Performance Utilities
```typescript
import { describe, it, expect } from 'vitest'
import { calculateCostoInicialMemoized } from '@/features/admin/utils'
import { createMockSnapshot } from '@/test/mocks'

describe('performanceOptimizations', () => {
  it('calculateCostoInicialMemoized debería calcular costo correcto', () => {
    const snapshot = createMockSnapshot()
    const costo = calculateCostoInicialMemoized(snapshot)
    
    expect(costo).toBe(expectedValue)
  })
  
  it('calculateCostoInicialMemoized debería usar caché', () => {
    const snapshot = createMockSnapshot()
    
    const costo1 = calculateCostoInicialMemoized(snapshot)
    const costo2 = calculateCostoInicialMemoized(snapshot)
    
    expect(costo1).toBe(costo2)
  })
})
```

### Component Test - HOC
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { withOptimizations } from '@/features/admin/components'

describe('withOptimizations HOC', () => {
  it('debería prevenir re-renders cuando props no cambian', () => {
    const Component = () => <div>test</div>
    const renderSpy = vi.spyOn(Component.prototype, 'render')
    
    const Optimized = withOptimizations(Component)
    const { rerender } = render(<Optimized prop="value" />)
    
    rerender(<Optimized prop="value" />)
    
    expect(renderSpy).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Test - SnapshotsTableSection
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SnapshotsTableSection from '@/features/admin/components/SnapshotsTableSection'

describe('SnapshotsTableSection Integration', () => {
  it('debería renderizar snapshots', () => {
    const snapshots = [createMockSnapshot()]
    
    render(
      <SnapshotsTableSection
        snapshots={snapshots}
        setSnapshots={vi.fn()}
        cargandoSnapshots={false}
        errorSnapshots={null}
        refreshSnapshots={vi.fn()}
      />
    )
    
    expect(screen.getByText(snapshots[0].nombre)).toBeInTheDocument()
  })
})
```

## 📋 Checklist de Implementación

### Fase 1: Setup (Día 1)
- [ ] Instalar dependencias de testing
- [ ] Crear vitest.config.ts
- [ ] Crear directorio test/ con mocks y utilidades
- [ ] Crear helpers de testing comunes
- [ ] Configurar GitHub Actions para CI/CD

### Fase 2: Unit Tests (Días 2-3)
- [ ] Tests para performanceOptimizations.ts
- [ ] Tests para withOptimizations.tsx
- [ ] Tests para OptimizedSnapshotCard.tsx
- [ ] Coverage mínimo 80%

### Fase 3: Integration Tests (Días 4-5)
- [ ] Tests para SnapshotsTableSection
- [ ] Tests para AdminPage
- [ ] Tests para hooks (useEventTracking, useAnalyticsMetrics)
- [ ] Tests para componentes de snapshots (Timeline, Comparison, DiffViewer)

### Fase 4: E2E Tests (Día 6)
- [ ] Setup Playwright/Cypress
- [ ] Crear scenarios E2E principales
- [ ] Testing de workflows completos
- [ ] Performance testing

### Fase 5: Documentation (Día 7)
- [ ] Documentar estrategia de testing
- [ ] Crear guía de coverage
- [ ] Documentar CI/CD pipeline
- [ ] Crear CONTRIBUTING.md con testing guidelines

## 🎯 Métricas de Éxito

- ✅ **Coverage Global**: ≥80% de líneas
- ✅ **Coverage Funciones**: ≥85%
- ✅ **Coverage Branches**: ≥75%
- ✅ **Todas las pruebas pasan**: 100%
- ✅ **CI/CD verde**: 0 fallos
- ✅ **Performance**: < 1s tiempo de test suite
- ✅ **Documentación**: 100% completa

## 📚 Recursos

### Librerías
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Testing Utilities: https://testing-library.com/

### Documentos
- `docs/PHASE_15_TESTING_COMPLETE.md` - Documentación principal
- `test/setup.ts` - Configuración de tests
- `test/mocks/` - Mocks compartidos
- `test/helpers/` - Utilidades de testing

---

**Estado**: Fase de Planificación ✅  
**Siguiente Acción**: Implementar PHASE 15
