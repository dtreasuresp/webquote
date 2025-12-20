# ⚡ QUICK START - EJECUCIÓN RÁPIDA DE TESTS

## 🚀 5 Minutos para Verificar Todo

### Paso 1: Verificar Instalación (30 segundos)
```bash
npm --version          # Verificar Node/npm
npx jest --version     # Verificar Jest está disponible
npx playwright --version # Verificar Playwright está disponible
```

### Paso 2: Ejecutar Unit Tests (2 minutos)
```bash
# En la terminal, desde d:\dgtecnova

# Opción A: Solo tests del sync store
npx jest src/stores/__tests__/quotationSyncStore.test.ts

# Opción B: Con output verbose
npx jest src/stores/__tests__/quotationSyncStore.test.ts --verbose

# Opción C: Con coverage
npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage
```

**Resultado esperado**: ✅ 50+ tests PASSED

### Paso 3: Ejecutar Integration Tests (1 minuto)
```bash
# Tests de integración
npx jest tests/quotation-sync-integration.test.ts

# Con verbose
npx jest tests/quotation-sync-integration.test.ts --verbose
```

**Resultado esperado**: ✅ 30+ tests PASSED

### Paso 4: Ejecutar E2E Tests (2+ minutos)
```bash
# Opción A: Sin UI (más rápido)
npm run test:e2e -- tests/e2e/quotations/sync.spec.ts

# Opción B: Con UI interactivo
npm run test:e2e:ui -- tests/e2e/quotations/sync.spec.ts

# Opción C: En modo debug
npm run test:e2e:debug -- tests/e2e/quotations/sync.spec.ts
```

**Nota**: Requiere que la app esté corriendo:
```bash
# En OTRA terminal
npm run dev

# Luego en la primera terminal, ejecutar los E2E tests
```

**Resultado esperado**: ✅ 6 tests PASSED

---

## 📊 Todos los Tests en Un Comando

### Ver Todos los Tests a la Vez
```bash
# Unit tests
npx jest src/stores/__tests__/quotationSyncStore.test.ts

# Integration tests
npx jest tests/quotation-sync-integration.test.ts

# E2E tests
npm run test:e2e -- tests/e2e/quotations/sync.spec.ts
```

### O Ejecutar TODO Junto
```bash
# (requiere app corriendo en otra terminal)
npx jest && npm run test:e2e
```

---

## 📈 Ver Cobertura Rápidamente

```bash
# Generar y mostrar cobertura
npx jest src/stores/__tests__/quotationSyncStore.test.ts --coverage

# Ejemplo de output:
# ─────────────────────────────────────────────
# File               | % Stmts | % Branch | % Funcs
# ─────────────────────────────────────────────
# quotationSyncStore | 95.2%   | 92.1%    | 100%
# ─────────────────────────────────────────────
```

---

## 🔍 Filtrar Tests Específicos

### Ejecutar Solo Un Test
```bash
# Ejecutar test que contiene "subscribe"
npx jest --testNamePattern="subscribe"

# Ejemplo: ejecuta solo tests de subscribe()
```

### Ejecutar Describe Específico
```bash
# Ejecutar "subscribe()" describe block
npx jest --testNamePattern="subscribe"
```

### Ejecutar en Watch Mode
```bash
# Ejecuta automáticamente cuando cambias archivos
npx jest src/stores/__tests__/quotationSyncStore.test.ts --watch

# Luego presiona:
# 'a' = ejecutar todos
# 'f' = ejecutar solo fallos
# 'p' = filtrar por filename
# 'q' = salir
```

---

## 🐛 Debugging Rápido

### Ver Logs Detallados
```bash
# Con verbose
npx jest --verbose

# Sin coverage (más rápido)
npx jest --no-coverage

# Con colored output
npx jest --colors
```

### Encontrar Errores
```bash
# Buscar qué test falla
npx jest --listTests | grep sync

# Ver error completo
npx jest --verbose --no-coverage
```

---

## 📱 E2E Tests Paso a Paso

### Opción 1: UI Interactivo (Recomendado para desarrollo)
```bash
# Terminal 1: Ejecutar app
npm run dev
# Esperar a que diga "Ready in X seconds"

# Terminal 2: Ejecutar E2E con UI
npm run test:e2e:ui -- tests/e2e/quotations/sync.spec.ts
# Se abre navegador con interfaz interactiva
```

### Opción 2: Línea de Comandos (Rápido)
```bash
# Terminal 1: App corriendo
npm run dev

# Terminal 2: Tests sin UI
npm run test:e2e -- tests/e2e/quotations/sync.spec.ts --headed
# --headed = ver navegador mientras corre
```

### Opción 3: Con Debug
```bash
# Terminal 1: App corriendo
npm run dev

# Terminal 2: Tests en debug
npm run test:e2e:debug -- tests/e2e/quotations/sync.spec.ts
# Inspector se abre para debuggear paso a paso
```

---

## ✅ Checklist Rápido

```
VERIFICACIÓN COMPLETA EN 5 MINUTOS:

[ ] npm -v                           # ✅ Node instalado
[ ] npx jest --version               # ✅ Jest disponible
[ ] npx jest src/stores/__tests__... # ✅ Unit tests (50+ PASSED)
[ ] npx jest tests/quotation-sync... # ✅ Integration tests (30+ PASSED)
[ ] npm run dev                      # ✅ App corriendo
[ ] npm run test:e2e -- tests/e2e... # ✅ E2E tests (6 PASSED)
[ ] npx jest --coverage              # ✅ Coverage >80%

RESULTADO ESPERADO:
✅ 90+ Tests PASSED
✅ Coverage >95%
✅ No errors
✅ Todo verde
```

---

## 🎯 Casos de Uso Rápidos

### "Quiero verificar que todo funciona"
```bash
npx jest --coverage
```

### "Quiero ejecutar solo tests de sync"
```bash
npx jest src/stores/__tests__/quotationSyncStore.test.ts
```

### "Quiero ver tests en tiempo real mientras desarrollo"
```bash
npx jest src/stores/__tests__/ --watch
```

### "Quiero debuggear un test específico"
```bash
npx jest --testNamePattern="subscribe" --verbose
```

### "Quiero ver cómo se ve en el navegador (E2E)"
```bash
npm run dev                    # Terminal 1
npm run test:e2e:ui ...       # Terminal 2 (se abre navegador)
```

### "Quiero ver el reporte HTML de E2E"
```bash
npm run test:e2e
npm run test:e2e:report       # Abre navegador con reporte
```

---

## 📚 Referencias Rápidas

### Archivos de Tests
| Archivo | Comando |
|---------|---------|
| Unit tests sync store | `npx jest src/stores/__tests__/quotationSyncStore.test.ts` |
| Integration tests | `npx jest tests/quotation-sync-integration.test.ts` |
| E2E tests sync | `npm run test:e2e -- tests/e2e/quotations/sync.spec.ts` |

### Documentación
| Documento | Ubicación |
|-----------|-----------|
| Guía completa | `docs/GUIA_TESTING_SINCRONIZACION.md` |
| Análisis sistemas | `docs/ANALISIS_SISTEMAS_TESTING.md` |
| Resumen final | `docs/RESUMEN_FINAL_IMPLEMENTACION_SYNC.md` |

---

## 🆘 Si Algo Falla

### Error: "Command not found: jest"
```bash
# Solución 1: Instalar dependencias
npm install

# Solución 2: Usar npx
npx jest --version
```

### Error: "Cannot find module"
```bash
# Limpiar caché de Jest
npx jest --clearCache

# Reinstalar
npm install
```

### Error: "Tests timeout"
```bash
# Aumentar timeout
npx jest --testTimeout=30000

# Ejecutar E2E con timeout extendido
npm run test:e2e -- --timeout=60000
```

### E2E: "Element not found"
```bash
# Verificar que app está corriendo
npm run dev

# Ver con --headed (ver navegador)
npm run test:e2e -- --headed

# Ver reportes
npm run test:e2e:report
```

---

## 🎉 ¡Listo!

Todos los tests están configurados y listos para usar.

**Próximo paso**: Ejecuta cualquiera de los comandos anteriores y verifica que todo pase ✅

---

## 📞 Soporte Rápido

### Preguntas Frecuentes

**P: ¿Cuánto tiempo toman los tests?**  
R: Unit tests ~5-10s, Integration ~2-5s, E2E 30-60s (requiere app)

**P: ¿Necesito hacer algo especial?**  
R: No, solo ejecutar los comandos. Si son E2E, necesita app corriendo.

**P: ¿Dónde veo el resultado?**  
R: En la terminal (output de Jest/Playwright)

**P: ¿Puedo ver en el navegador?**  
R: Sí, usa `npm run test:e2e:ui`

**P: ¿Cómo agrego más tests?**  
R: Ver `docs/GUIA_TESTING_SINCRONIZACION.md` Sección 7

---

**¡Happy Testing! 🚀**

