# 🛠️ MATRIZ DE HERRAMIENTAS & DEPENDENCIAS

**Última actualización:** 17 de diciembre 2025

---

## 📋 RESUMEN RÁPIDO

¿Qué necesitas instalar para CADA documento?

| Documento | Necesita Instalar | Comando |
|-----------|------------------|---------|
| README.md | Nada especial | - |
| DOCUMENTACION_INDEX.md | Nada especial | - |
| **GUIA_TEMA_BACKUPS.md** | JSZip | `npm install jszip` |
| GUIA_TEMA_PREFERENCIAS.md | Nada | Ya instalado ✅ |
| GUIA_TEMA_STATE_MANAGEMENT.md | Nada | Ya instalado ✅ |
| RESUMEN_EJECUTIVO_BACKUPS.md | Nada | Solo lectura |
| AUDITORIA_SISTEMA_BACKUPS_COMPLETA.md | Nada | Solo lectura |
| GUIA_RAPIDA_IMPLEMENTACION_BACKUPS.md | JSZip + Prisma | `npm install jszip` |
| ZUSTAND_IMPLEMENTATION_COMPLETE.md | Nada | Ya instalado ✅ |
| SESION_17_DIC_2025_RESUMEN.md | Nada | Solo lectura |

---

## 🎯 POR CADA FUNCIONALIDAD

### 💾 SISTEMA DE BACKUPS

**Herramientas a instalar:**

```bash
# 1. Compresión de archivos
npm install jszip

# 2. (OPCIONAL) Scheduler local (si no usas Vercel Cron)
npm install node-cron

# 3. (YA EXISTE) Base de datos
# Prisma ya está instalado ✅
```

**Dependencias de Node.js:**
- Node.js 18+ (ya tienes)

**Dependencias de Next.js:**
- Next.js 14+ (ya tienes)

**TypeScript:**
- TypeScript (ya tienes)

**Archivos a crear:**
- `/src/lib/backup/backupEngine.ts`
- `/src/lib/backup/restoreEngine.ts`
- `/src/lib/backup/scheduler.ts`
- `/src/lib/types/backup.types.ts`

---

### ⚙️ SISTEMA DE PREFERENCIAS

**Herramientas a instalar:**
- ✅ Nada nuevo (todo ya existe)

**Stack actual:**
- ✅ Zustand (ya instalado)
- ✅ React (ya instalado)
- ✅ TypeScript (ya instalado)

**Lo que está hecho:**
- ✅ userPreferencesStore.ts
- ✅ Persistencia a localStorage
- ✅ Sincronización con API

---

### 🏗️ STATE MANAGEMENT

**Herramientas a instalar:**
- ✅ Zustand (ya está)
- ✅ React (ya está)

**Lo que existe:**
- ✅ `/src/stores/userPreferencesStore.ts`
- ✅ Patrón Zustand + persist
- ✅ Persistencia a localStorage

---

## 📦 DEPENDENCIAS GLOBALES DEL PROYECTO

Esto ya está en tu `package.json`:

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "next": "^14.x",
    "typescript": "^5.x",
    "zustand": "^4.x",
    "tailwindcss": "^3.x",
    "framer-motion": "^10.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "prisma": "^5.x",
    "@prisma/client": "^5.x"
  }
}
```

---

## 🚀 CHECKLIST ANTES DE IMPLEMENTAR

### Paso 0: Verifica que tienes todo

```bash
# Verificar Node.js
node --version
# ✅ Debe ser 18 o superior

# Verificar npm
npm --version
# ✅ Debe ser 8 o superior

# Verificar paquetes instalados
npm list zustand
npm list jszip
# Zustand: ✅ SÍ existe
# JSZip: ❌ No existe (instalar)

# Verificar estructura de carpetas
ls src/stores/
# userPreferencesStore.ts ✅
```

### Paso 1: Instalar JSZip (solo si vas a implementar backups)

```bash
npm install jszip
# O si usas yarn
yarn add jszip

# O si usas pnpm
pnpm add jszip
```

### Paso 2: Verificar que funciona

```bash
# En tu proyecto:
node -e "const JSZip = require('jszip'); console.log('JSZip OK')"
# ✅ Output: JSZip OK
```

---

## ⚠️ DEPENDENCIAS OPCIONALES

Si usas estas características:

| Feature | Necesitas Instalar | Para QUÉ |
|---------|------------------|---------|
| Cron jobs locales | `node-cron` | Scheduler local (si no usas Vercel) |
| Servidor externo de cron | - | EasyCron, Vercel Cron, etc. |
| Encriptación avanzada | `crypto-js` | Encriptar backups |
| Compresión ZIP | JSZip ✅ | Ya incluida en la guía |
| Testing | `vitest` o `jest` | Unit tests |

---

## 🔗 DEPENDENCIAS ENTRE DOCUMENTOS

Si lees ESTE documento → Necesitas ESTOS otros primero:

```
DOCUMENTACION_INDEX.md
  ↓
GUIA_TEMA_BACKUPS.md
  ├─ RESUMEN_EJECUTIVO_BACKUPS.md
  ├─ AUDITORIA_SISTEMA_BACKUPS_COMPLETA.md
  └─ GUIA_RAPIDA_IMPLEMENTACION_BACKUPS.md
      └─ (requiere: JSZip instalado)

GUIA_TEMA_PREFERENCIAS.md
  ├─ SESION_17_DIC_2025_RESUMEN.md
  ├─ PREFERENCES_BUG_FIX_SUMMARY.md
  └─ ZUSTAND_IMPLEMENTATION_COMPLETE.md
      └─ (no requiere instalar nada)

GUIA_TEMA_STATE_MANAGEMENT.md
  ├─ ZUSTAND_IMPLEMENTATION_COMPLETE.md
  ├─ ZUSTAND_AUDIT_VERIFICATION.md
  └─ PREFERENCES_BUG_FIX_SUMMARY.md
      └─ (no requiere instalar nada)
```

---

## 💡 QUICK INSTALL COMMANDS

Si tienes prisa, aquí están los comandos listos para copiar-pegar:

### Install JSZip (Para backups)
```bash
npm install jszip
```

### Install Optional Cron (Para scheduler local)
```bash
npm install node-cron
```

### Verify Installation
```bash
npm list jszip node-cron
```

### Check Versions
```bash
npm list
# Búsca jszip y node-cron en la lista
```

---

## 🆘 TROUBLESHOOTING

| Problema | Solución |
|----------|----------|
| `npm ERR! 404 Not Found` | Paquete no existe, revisa el nombre |
| `ERR! peer dep missing` | Instala las peer dependencies también |
| `Permission denied` | Usa `sudo npm install` (NO recomendado) o `npm install -g` |
| `node_modules corrupted` | Ejecuta `npm ci` en lugar de `npm install` |
| No puedes instalar en Windows | Ejecuta PowerShell como Admin |

---

## 📊 MATRIX DE INSTALACIÓN POR SISTEMA

### Windows
```powershell
# PowerShell
npm install jszip

# Cmd
npm install jszip
```

### macOS / Linux
```bash
npm install jszip
```

### Docker
```dockerfile
RUN npm install jszip
```

---

## 🔄 DESPUÉS DE INSTALAR

### Verificar que funciona

```bash
# Test 1: Importar en Node.js
node -e "const JSZip = require('jszip'); console.log('✅ JSZip funciona')"

# Test 2: Importar en TypeScript
npx ts-node -e "import JSZip from 'jszip'; console.log('✅ JSZip con TS funciona')"

# Test 3: Verificar en tu app
npm run dev
# Abre http://localhost:3000/administrador
# Si no hay errores en consola → ✅ Todo OK
```

---

## 📝 NOTAS IMPORTANTES

1. **JSZip es SOLO para backups**
   - Si no implementas backups, NO necesitas instalarlo
   - No afecta el resto de la app

2. **Node-cron es OPCIONAL**
   - Si usas Vercel, mejor usar Vercel Cron Functions
   - Si usas otro hosting, node-cron es más fácil

3. **Todas las otras dependencias ya existen**
   - Zustand ✅
   - React ✅
   - Prisma ✅
   - Next.js ✅

4. **Actualiza regularmente**
   ```bash
   npm outdated
   npm update
   ```

---

## ✨ RESUMEN

| Paso | Acción | Comando |
|------|--------|---------|
| 1 | Lee qué necesitas | [DOCUMENTACION_INDEX.md](./DOCUMENTACION_INDEX.md) |
| 2 | Lee tu tema | [GUIA_TEMA_*.md](./GUIA_TEMA_BACKUPS.md) |
| 3 | Instala lo necesario | `npm install jszip` (si backups) |
| 4 | Verifica | `npm list jszip` |
| 5 | Implementa | Sigue la guía rápida |

---

**Última actualización:** 17 de diciembre 2025  
**Próximo paso:** [GUIA_TEMA_BACKUPS.md](./GUIA_TEMA_BACKUPS.md)
