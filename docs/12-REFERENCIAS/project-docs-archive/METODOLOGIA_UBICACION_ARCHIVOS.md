# 📂 METODOLOGÍA DE UBICACIÓN DE ARCHIVOS

**Propósito**: Garantizar que todos los archivos generados se creen en los lugares predeterminados correctos según su tipo.

---

## 🎯 ESTRUCTURA GENERAL

```
d:\dgtecnova\
├── 📁 src/                          # Código fuente principal
│   ├── app/
│   │   └── administrador/
│   │       └── page.tsx             # Página principal del admin
│   └── features/
│       └── admin/
│           └── components/
│               ├── *.tsx            # Componentes
│               ├── tabs/
│               │   └── *.tsx        # Componentes de tabs
│               └── index.ts         # Exports centralizados
│
├── 📁 docs/                         # Documentación del proyecto
│   ├── propuestas/                  # PROPUESTAS DE ARQUITECTURA
│   │   └── PROPUESTA_*.md           # Documentos de propuestas
│   ├── project-docs/                # Documentación técnica
│   ├── refactorizacion/             # Refactorizaciones
│   ├── testing/                     # Testing docs
│   ├── deployment/                  # Deployment info
│   ├── sessions/                    # Session logs
│   └── README.md
│
├── 📁 scripts/                      # Scripts utilitarios
│   ├── *.ts, *.js                   # Scripts ejecutables
│   └── *.sh                         # Scripts shell
│
├── 📁 prisma/                       # Configuración de BD
│   ├── schema.prisma
│   └── migrations/
│
└── 📁 tests/                        # Tests automatizados
    └── *.test.ts
```

---

## 📋 TABLA DE UBICACIONES POR TIPO

| Tipo de Archivo | Ubicación | Ejemplo | Notas |
|---|---|---|---|
| **Componente React** | `src/features/admin/components/` | `ModalProgresoGuardado.tsx` | Componentes principales |
| **Componentes de Tabs** | `src/features/admin/components/tabs/` | `Historial.tsx` | Tabs específicos |
| **Componentes Reutilizables** | `src/features/admin/components/` | `DialogoGenericoDinamico.tsx` | Componentes shared |
| **Página principal** | `src/app/administrador/` | `page.tsx` | Páginas Next.js |
| **Exports centralizados** | `src/features/admin/components/` | `index.ts` | File barrel |
| **PROPUESTAS** | `docs/propuestas/` | `PROPUESTA_*.md` | Docs de arquitectura |
| **Documentación técnica** | `docs/project-docs/` | `TECNICO_*.md` | Docs técnicos |
| **Documentación de refactoring** | `docs/refactorizacion/` | `REFACTOR_*.md` | Refactoring docs |
| **Comparaciones/Análisis** | `docs/` o `docs/audits/` | `COMPARACION_*.md` | Análisis comparativos |
| **Scripts utilitarios** | `scripts/` | `check-dates.js` | Scripts ejecutables |
| **Tests** | `tests/` | `offline-sync.test.ts` | Archivos de test |
| **Configuración Prisma** | `prisma/` | `schema.prisma` | BD schema |
| **Migraciones** | `prisma/migrations/` | `migrate-*.ts` | Scripts de migración |

---

## 🔍 REGLAS ESPECÍFICAS POR CARPETA

### `src/features/admin/components/`
```
✅ CREAR AQUÍ:
- Componentes de UI reutilizables
- Modales
- Diálogos
- Wrappers

❌ NO crear aquí:
- Archivos de documentación
- Scripts ejecutables
- Configuración

📝 Ejemplos:
- ModalProgresoGuardado.tsx ✅
- DialogoGenericoDinamico.tsx ✅
- ModalLoginAdmin.tsx ✅
```

### `docs/propuestas/`
```
✅ CREAR AQUÍ:
- Propuestas de arquitectura
- Análisis de diseño
- Propuestas de refactoring
- Decisiones arquitectónicas

❌ NO crear aquí:
- Código fuente
- Scripts ejecutables
- Documentación de deployment

📝 Ejemplos:
- PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md ✅
- PROPUESTA_REFACTORIZACION_*.md ✅
```

### `docs/project-docs/`
```
✅ CREAR AQUÍ:
- Explicaciones técnicas
- Cómo usar características
- Documentación de API
- Guías internas

❌ NO crear aquí:
- Propuestas (van a propuestas/)
- Código
- Auditorías (van a audits/)

📝 Ejemplos:
- EXPLICACION_ANALYTICS_EVENTS.md ✅
- TECNICO_FORMULARIOS.md ✅
```

### `docs/audits/`
```
✅ CREAR AQUÍ:
- Auditorías de código
- Verificaciones de completitud
- Análisis de fase
- Reportes de auditoría

❌ NO crear aquí:
- Propuestas (van a propuestas/)
- Documentación técnica general

📝 Ejemplos:
- AUDITORIA_FASE_10_COMPLETA.md ✅
- CHECKLIST_FINAL_FASES_11_15.md ✅
```

### `scripts/`
```
✅ CREAR AQUÍ:
- Scripts ejecutables (.ts, .js, .sh)
- Utilidades de CLI
- Build scripts
- Migraciones de datos

❌ NO crear aquí:
- Documentación
- Componentes
- Configuración

📝 Ejemplos:
- check-dates.js ✅
- backup-data.js ✅
- test-prisma.js ✅
```

### `src/app/administrador/`
```
✅ CREAR AQUÍ:
- Página principal: page.tsx
- Layouts: layout.tsx

❌ NO crear aquí:
- Componentes reutilizables (van a features/admin/components/)
- Utilidades (van a lib/)
- Estilos globales

📝 Ejemplos:
- page.tsx ✅ (Página admin)
```

### `tests/`
```
✅ CREAR AQUÍ:
- Archivos de test: *.test.ts
- Configuración de test

❌ NO crear aquí:
- Componentes
- Documentación
- Scripts

📝 Ejemplos:
- offline-sync.test.ts ✅
- modal-progreso.test.ts ✅
```

---

## 🎯 ALGORITMO DE DECISIÓN

Cuando necesites crear un archivo, sigue este árbol de decisión:

```
¿Qué tipo de archivo es?

├─ ¿Es código COMPONENTE?
│  └─ ¿Es reutilizable o usado en admin?
│     └─ ✅ src/features/admin/components/
│        (Agregar export en index.ts)
│
├─ ¿Es código PÁGINA?
│  └─ ✅ src/app/[ruta]/
│
├─ ¿Es DOCUMENTACIÓN?
│  ├─ ¿Es PROPUESTA de arquitectura?
│  │  └─ ✅ docs/propuestas/PROPUESTA_*.md
│  │
│  ├─ ¿Es AUDITORÍA/CHECKLIST?
│  │  └─ ✅ docs/audits/AUDITORIA_*.md
│  │
│  ├─ ¿Es TÉCNICO/EXPLICACIÓN?
│  │  └─ ✅ docs/project-docs/TECNICO_*.md
│  │
│  ├─ ¿Es COMPARACIÓN/ANÁLISIS?
│  │  └─ ✅ docs/COMPARACION_*.md
│  │
│  └─ ¿Es DEPLOYMENT/CONFIGURACIÓN?
│     └─ ✅ docs/deployment/CONFIG_*.md
│
├─ ¿Es SCRIPT ejecutable?
│  └─ ✅ scripts/nombre-script.js
│
├─ ¿Es TEST?
│  └─ ✅ tests/nombre.test.ts
│
└─ ¿Es CONFIGURACIÓN?
   └─ ✅ Root o carpeta de config específica
      (package.json, tsconfig.json, etc.)
```

---

## 📍 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Crear nuevo componente modal
```
❌ INCORRECTO:
d:\dgtecnova\ModalProgresoGuardado.tsx

✅ CORRECTO:
d:\dgtecnova\src\features\admin\components\ModalProgresoGuardado.tsx

📝 Luego actualizar:
d:\dgtecnova\src\features\admin\components\index.ts
(Agregar export)
```

### Ejemplo 2: Crear propuesta de arquitectura
```
❌ INCORRECTO:
d:\dgtecnova\PROPUESTA_NUEVA_FEATURE.md
d:\dgtecnova\src\PROPUESTA_NUEVA_FEATURE.md

✅ CORRECTO:
d:\dgtecnova\docs\propuestas\PROPUESTA_NUEVA_FEATURE.md
```

### Ejemplo 3: Crear análisis comparativo
```
❌ INCORRECTO:
d:\dgtecnova\src\COMPARACION_MODAL_GUARDADO.md

✅ CORRECTO (primera vez):
d:\dgtecnova\COMPARACION_MODAL_GUARDADO.md

✅ CORRECTO (actualizado):
d:\dgtecnova\docs\COMPARACION_MODAL_GUARDADO.md
(Mover después de creación inicial)
```

### Ejemplo 4: Crear script de verificación
```
❌ INCORRECTO:
d:\dgtecnova\check-dates.js
d:\dgtecnova\src\check-dates.js

✅ CORRECTO:
d:\dgtecnova\scripts\check-dates.js
```

### Ejemplo 5: Crear documentación técnica
```
❌ INCORRECTO:
d:\dgtecnova\TECNICO_HOOKS.md
d:\dgtecnova\src\TECNICO_HOOKS.md

✅ CORRECTO:
d:\dgtecnova\docs\project-docs\TECNICO_HOOKS.md
```

---

## 🔄 WORKFLOW PARA CREAR ARCHIVOS

### Paso 1: Identificar tipo
```
¿Qué estoy creando?
- [ ] Componente React
- [ ] Script ejecutable
- [ ] Documento de propuesta
- [ ] Documentación técnica
- [ ] Test
```

### Paso 2: Consultar tabla de ubicaciones
Referencia la tabla anterior

### Paso 3: Crear en ubicación correcta
Usar full path absoluto

### Paso 4: Actualizar exports (si aplica)
- Componentes → actualizar `index.ts`
- Scripts → no requiere
- Docs → no requiere

### Paso 5: Documentar decisión (si aplica)
En comentarios o README de carpeta

---

## 📊 RESUMEN DE CARPETAS PRINCIPALES

| Carpeta | Propósito | Archivos | Control |
|---|---|---|---|
| `src/features/admin/components/` | Componentes React | `*.tsx` | Reutilizables |
| `docs/propuestas/` | Propuestas arquitectónicas | `PROPUESTA_*.md` | Estricto |
| `docs/project-docs/` | Documentación técnica | `TECNICO_*.md` | Referencia |
| `docs/audits/` | Auditorías y reportes | `AUDITORIA_*.md` | Histórico |
| `scripts/` | Scripts ejecutables | `*.js, *.ts, *.sh` | Utilitarios |
| `tests/` | Tests automatizados | `*.test.ts` | Cobertura |
| `prisma/` | Configuración de BD | `schema.prisma` | Crítico |

---

## ✅ CHECKLIST ANTES DE CREAR ARCHIVO

Antes de crear cualquier archivo, verifica:

- [ ] ¿Cuál es el tipo de archivo?
- [ ] ¿En qué carpeta va según la tabla?
- [ ] ¿Necesita folder padre creada?
- [ ] ¿Necesita actualizar index.ts o exports?
- [ ] ¿El nombre sigue la convención de la carpeta?
- [ ] ¿No está duplicando archivo existente?
- [ ] ¿Será fácil de encontrar después?

---

## 🚀 CONVENCIONES DE NOMBRES

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Componentes | `PascalCase.tsx` | `ModalProgresoGuardado.tsx` |
| Propuestas | `PROPUESTA_*.md` | `PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md` |
| Técnicos | `TECNICO_*.md` | `TECNICO_HOOKS.md` |
| Auditorías | `AUDITORIA_*.md` | `AUDITORIA_FASE_10_COMPLETA.md` |
| Scripts | `kebab-case.js` | `check-dates.js` |
| Tests | `kebab-case.test.ts` | `modal-progreso.test.ts` |
| Comparaciones | `COMPARACION_*.md` | `COMPARACION_MODAL_GUARDADO.md` |

---

## 🎓 PRÓXIMAS ACCIONES

Al momento de crear `ModalProgresoGuardado.tsx`:

1. ✅ Crear en: `src/features/admin/components/ModalProgresoGuardado.tsx`
2. ✅ Actualizar: `src/features/admin/components/index.ts` (agregar export)
3. ✅ Documentación: Ya está en `docs/propuestas/PROPUESTA_MODALPROGRESOGUARDADO_COMPLETO.md`
4. ✅ Comparación: Ya está en `docs/COMPARACION_MODAL_GUARDADO.md`

**Todo está listo para implementación** ✅
