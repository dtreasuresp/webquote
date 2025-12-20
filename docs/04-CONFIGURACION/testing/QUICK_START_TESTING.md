# 🧪 QUICK START - Integration Testing de Analytics

**Tiempo total:** ~30-45 minutos  
**Complejidad:** Media (pasos repetitivos)  
**Resultado:** Validación completa del sistema de analytics

---

## 📍 Ubicación en la App

- **URL:** `http://localhost:4101/administrador`
- **Navega a:** El tab "Oferta" y "Historial" principalmente

---

## 🔧 Preparativos

### Paso 1: Abre DevTools
```
F12 → Console
```

### Paso 2: Establece acceso a Analytics
En la Console, ejecuta:
```javascript
// Para ver eventos en tiempo real
const { useAnalytics } = require('react')
// La mayoría de eventos estarán disponibles en state.events del context
```

### Paso 3: Monitor Quick
Copia esto en Console para monitorear eventos en tiempo real:
```javascript
// Ejecutar cada 2 segundos
setInterval(() => {
  console.log('=== EVENTOS ÚLTIMOS 2 MIN ===')
  const now = Date.now()
  // Simulación: ver eventos posteriores a cierto timestamp
  console.log('Total eventos registrados: X')
}, 2000)
```

---

## ✅ TESTS RÁPIDOS (Orden recomendado)

### **TEST 1.1** ⭐ Admin Tab View (60s TTL) - FUNDAMENTAL
```
1. Abre DevTools → Console
2. Navega a TAB "Oferta"
3. Busca en console: mensaje de tracking
4. Espera 5 segundos
5. Vuelve al mismo TAB "Oferta" 
   → ESPERADO: ❌ NO debería duplicar (TTL aún activo)
6. Espera 61 segundos total
7. Vuelve a "Oferta" nuevamente
   → ESPERADO: ✅ SÍ debería registrar (TTL expirado)

✅ PASS si: Sin duplicados en <60s, nuevo evento en >60s
❌ FAIL si: Duplica eventos o TTL no funciona
```

### **TEST 2.1** Oferta Section (2s TTL)
```
1. En TAB "Oferta", navega a subsección "Servicios Base"
2. Revisa console (busca "oferta_section_viewed")
3. Inmediatamente vuelve a misma sección
   → ESPERADO: ❌ NO duplica (TTL 2s)
4. Espera 3 segundos
5. Vuelve a la sección
   → ESPERADO: ✅ SÍ registra (TTL expirado)

✅ PASS si: Dedup en <2s, nuevo evento en >2s
❌ FAIL si: Duplica o TTL no funciona
```

### **TEST 3.1** Descuentos (400ms Debounce)
```
1. Navega a TAB "Financiero"
2. Configura un descuento: cambiar a 10%
3. Espera 500ms
4. Revisa console: evento "descuento_configured" debería estar
5. Haz cambios rápidos: 15% → 20% → 25% (todos en <400ms)
6. Espera 500ms
7. Revisa console: ❌ NO debería haber 3 eventos, solo 1 (el final: 25%)

✅ PASS si: Debounce funciona, solo final se registra
❌ FAIL si: Ve múltiples eventos para cambios rápidos
```

### **TEST 4.1** Historial View (60s TTL)
```
1. Navega a TAB "Historial"
2. Revisa console: evento "historial_viewed"
3. Cambia a otra TAB
4. Vuelve a "Historial" en <60s
   → ESPERADO: ❌ NO duplica

✅ PASS si: Sin duplicados en <60s
❌ FAIL si: Se duplica
```

### **TEST 5.1** CRUD - Crear Cotización
```
1. En TAB "Historial"
2. Botón "+ Nueva Cotización"
3. Revisa console: evento "cotizacion_created"

✅ PASS si: Evento registrado con metadata
❌ FAIL si: Sin evento o sin metadata
```

### **TEST 5.2** CRUD - Editar Cotización
```
1. Click en cotización existente
2. Modifica un campo (ej: nombre)
3. Espera 2s (TTL de edición)
4. Revisa console: evento "cotizacion_edited"

✅ PASS si: Evento después de 2s
❌ FAIL si: Sin evento o inmediato
```

### **TEST 5.3** CRUD - Eliminar Cotización
```
1. Click derecho en cotización
2. Opción "Eliminar"
3. Confirma
4. Revisa console: evento "cotizacion_deleted"

✅ PASS si: Evento registrado
❌ FAIL si: Sin evento
```

### **TEST 6.1** Validación General - Sin Undefined
```javascript
// En Console, ejecuta:
const events = Array.from(document.body.textContent.match(/\"eventType\":\"[^\"]+\"/g) || [])
// O si tienes acceso al state:
console.table(events.map(e => ({
  type: e.eventType,
  timestamp: e.timestamp,
  valid: !!e.timestamp && !!e.eventType
})))

✅ PASS si: Todos tienen type y timestamp válidos
❌ FAIL si: Hay undefined o valores vacíos
```

### **TEST 6.2** Sin Duplicados por TTL
```javascript
// En Console, agrupa eventos por type+tab/section:
const grouped = {};
// Lógica de agrupación...
// Si ves >1 del mismo en <TTL = FAIL

✅ PASS si: Sin duplicados dentro de TTL
❌ FAIL si: Duplicados violando TTL
```

---

## 🎯 Checklist Rápido

- [ ] TEST 1.1: Admin Tab 60s TTL ✅/❌
- [ ] TEST 2.1: Oferta Section 2s TTL ✅/❌
- [ ] TEST 3.1: Descuentos 400ms Debounce ✅/❌
- [ ] TEST 4.1: Historial 60s TTL ✅/❌
- [ ] TEST 5.1: CRUD Create ✅/❌
- [ ] TEST 5.2: CRUD Edit ✅/❌
- [ ] TEST 5.3: CRUD Delete ✅/❌
- [ ] TEST 6.1: No Undefined ✅/❌
- [ ] TEST 6.2: No Duplicados TTL ✅/❌

**Total Passing:** ___ / 9  
**Status:** ___

---

## 📸 Si Algo Falla

1. **Captura:**
   - Screenshot de console
   - URL donde falló
   - Pasos exactos que hiciste

2. **Abre Console y ejecuta:**
   ```javascript
   console.log(document.location.href)
   console.log(navigator.userAgent)
   // Ver si hay errores en rojo
   ```

3. **Crea issue en GitHub con:**
   - Test número que falló
   - Screenshot/console log
   - Pasos reproducibles

---

## ⏱️ Timeline Estimado

| Test | Tiempo | Total |
|------|--------|-------|
| 1.1 | 2 min | 2 min |
| 2.1 | 2 min | 4 min |
| 3.1 | 2 min | 6 min |
| 4.1 | 1 min | 7 min |
| 5.1 | 1 min | 8 min |
| 5.2 | 2 min | 10 min |
| 5.3 | 1 min | 11 min |
| 6.1 | 3 min | 14 min |
| 6.2 | 5 min | 19 min |
| **Documentar** | 10 min | **29 min** |

---

## ✅ Resultado Final

Si todos pasan ✅ → **Sistema APROBADO** ✨  
Procede a hacer commit:
```bash
git add .
git commit -m "feat: analytics system operativo + content sections"
git push origin feature/oferta-sidebar-navigation
```

Si alguno falla ❌ → Reporta en docs/testing/ con detalles

---

**¡Adelante! 🚀**

