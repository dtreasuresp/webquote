# Tests E2E con Playwright

Este directorio contiene tests end-to-end (E2E) para WebQuote, enfocados en verificar el sistema de permisos granulares y autenticación.

## 📁 Estructura

```
tests/
├── e2e/
│   ├── auth/
│   │   └── login.spec.ts          # Tests de autenticación (login, logout, protección)
│   ├── permissions/
│   │   └── api-protection.spec.ts # Tests de permisos en API y UI
│   └── quotations/
│       └── quotation-filtering.spec.ts # Tests de filtrado por usuario
├── helpers/
│   └── test-helpers.ts            # Utilidades compartidas
└── README.md                       # Este archivo
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm run test:e2e
```

### Tests en modo UI (interactivo)
```bash
npm run test:e2e:ui
```

### Solo tests de autenticación
```bash
npm run test:e2e -- tests/e2e/auth
```

### Solo tests de permisos
```bash
npm run test:e2e -- tests/e2e/permissions
```

### Con reporte HTML
```bash
npm run test:e2e
npx playwright show-report
```

## ⚙️ Configuración

La configuración está en [`playwright.config.ts`](../../playwright.config.ts).

### Variables de entorno

Puedes sobrescribir la URL base:
```bash
PLAYWRIGHT_BASE_URL=http://localhost:4000 npm run test:e2e
```

## 📝 Escribir Tests

### Ejemplo básico

```typescript
import { test, expect } from '@playwright/test'
import { login, TEST_USERS } from '../helpers/test-helpers'

test('debe permitir acceso a admin', async ({ page }) => {
  await login(page, TEST_USERS.SUPER_ADMIN)
  await page.goto('/admin')
  
  await expect(page).toHaveURL('/admin')
})
```

### Helpers disponibles

Ver [`test-helpers.ts`](helpers/test-helpers.ts) para lista completa:

- `login(page, user)` - Login automático
- `logout(page)` - Logout
- `clearSession(page)` - Limpiar cookies/localStorage
- `waitForAppReady(page)` - Esperar carga completa
- `navigateToAdminSection(page, section)` - Navegar a sección admin
- `expectErrorMessage(page, pattern)` - Verificar mensaje de error
- `expectSuccessMessage(page, pattern)` - Verificar mensaje de éxito
- `fillForm(page, data)` - Llenar formulario
- `expectTableRowCount(page, count)` - Verificar filas en tabla
- `searchInTable(page, term, expectedResults)` - Buscar en tabla

### Usuarios de prueba

Definidos en `TEST_USERS`:

```typescript
import { TEST_USERS } from '../helpers/test-helpers'

// SUPER_ADMIN - acceso completo
TEST_USERS.SUPER_ADMIN
// ADMIN - gestión de usuarios
TEST_USERS.ADMIN
// CLIENT - acceso limitado
TEST_USERS.CLIENT
```

## 🎯 Cobertura de Tests

### ✅ Implementados

- **Autenticación**
  - Login exitoso/fallido
  - Logout
  - Protección de rutas
  - Persistencia de sesión

### ⏳ Por Implementar (marcados con `test.skip()`)

- **Permisos API**
  - AccessLevel read/write/full
  - 403 para usuarios sin permisos
  
- **Permisos UI**
  - Renderizado condicional de botones
  - Ocultamiento de tabs sin permisos
  - Mensajes de acceso denegado

- **Filtrado de datos**
  - Logs filtrados por usuario
  - Cotizaciones por assignedUserId
  - Historial multi-cliente

- **Jerarquía de roles**
  - ADMIN no puede editar SUPER_ADMIN
  - CLIENT solo ve su perfil

## 🔧 Debugging

### Ver tests en modo debug
```bash
npm run test:e2e:debug
```

### Ver trace de test fallido
```bash
npx playwright show-trace test-results/.../trace.zip
```

### Screenshots
Los screenshots de fallos están en `test-results/`

## 📊 CI/CD

En CI los tests se ejecutan con:
- 2 reintentos en caso de fallo
- 1 worker (sin paralelización)
- Servidor de desarrollo automático

## ⚠️ Requisitos

- Base de datos con usuarios de prueba configurados
- Variables de entorno correctas
- Puerto 3000 disponible (o configurar otro)

## 📚 Recursos

- [Playwright Docs](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)
