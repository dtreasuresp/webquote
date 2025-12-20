# 🗄️ Documentos Deprecados / No Usar

**Fecha de movimiento:** 14 de diciembre de 2025  
**Motivo:** Limpieza de documentación obsoleta

---

## 📋 Contenido de esta Carpeta

Esta carpeta contiene documentos que ya cumplieron su propósito y no deben ser utilizados como referencia actual. Se mantienen aquí por razones históricas pero NO reflejan el estado actual del proyecto.

---

## 📁 Estructura

### `/audits/` - Auditorías de Problemas Resueltos
- **AUDITORIA_PERMISOS_REALES.md** ❌ OBSOLETO
  - Documentaba que solo 2 permisos funcionaban (6%)
  - **Estado actual:** Sistema de permisos 100% implementado con 8 APIs + 3 componentes UI
  
- **AUTH_SYSTEM_AUDIT.md** ❌ OBSOLETO
  - Documentaba problema de redirección en login (spinner infinito)
  - **Estado actual:** Problema resuelto, login funciona correctamente

### `/sessions/` - Sesiones de Trabajo Antiguas
- **SESSION_30NOV_SUMMARY.md** ✅ COMPLETADA
  - Sesión del 30 de noviembre de 2025 sobre sistema de Analytics
  - Todo implementado exitosamente

### `/phases/` - Phases de Admin Panel (6 archivos)
Documentos de refactorización del Admin Panel (Phases 1-7) completada anteriormente:
- PHASE_7_COMPLETE_SUMMARY.md
- PHASE_7_DELIVERY_SUMMARY.md
- PHASE_7_FINAL_REPORT.md
- PHASE_7_SESSION_CLOSED.md
- PHASE_7_TABS_SUMMARY.md
- PHASE_7_WHAT_WAS_DONE.md

**Contexto diferente:** Estos documentos son de un proyecto de modularización del Admin Panel, no del sistema de permisos actual.

### `/reports/` - Reportes Redundantes (~10 archivos)
Reportes duplicados o redundantes de phases antiguas completadas:
- FINAL_STATUS_PHASE_7.md
- SESSION_COMPLETE_SUMMARY.md
- QUICK_START_NEXT_STEPS.md
- PROJECT_STATUS.md
- MASTER_INDEX.md
- RESUMEN_EJECUTIVO_PHASES_8-10.md
- STATUS_FINAL_PHASES_8-10.md
- PROYECTO_COMPLETADO_PHASES_8-10.md
- RESUMEN_FINAL_FASES_8-10_COMPLETADAS.md
- PUNTOS_CLAVE_PHASES_8-10.md
- INDICE_DOCUMENTACION_PHASES_8-10.md
- RESUMEN_VISUAL_ARCHIVOS_CREADOS.md

---

## ⚠️ Advertencia

**NO USAR ESTOS DOCUMENTOS COMO REFERENCIA.**

Para documentación actualizada, consulta:
- **Sistema de Permisos:** `docs/propuestas/PROPUESTA_SISTEMA_PERMISOS_GRANULAR.md`
- **Arquitectura Actual:** `docs/architecture/ARCHITECTURE_CURRENT_STATE.md`
- **README Principal:** `docs/README.md`
- **Índice General:** `docs/INDEX.md`

---

## 🗑️ ¿Por qué no se eliminaron?

Se mantienen en esta carpeta por:
1. **Historial:** Referencia histórica de problemas y soluciones
2. **Auditoría:** Trazabilidad de decisiones técnicas
3. **Aprendizaje:** Documentación de lecciones aprendidas

**Si necesitas eliminar permanentemente estos archivos, puedes borrar toda la carpeta `docs/deprecated/`.**

---

*Última actualización: 14 de diciembre de 2025*
