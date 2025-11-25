📋 ANÁLISIS DEL FLUJO ACTUAL vs. FLUJO REQUERIDO
DIAGNÓSTICO: El flujo ACTUAL es INCORRECTO y DEBE MODIFICARSE
Problemas principales identificados:

PROBLEMA 1: Falta el botón "Nueva Cotización" ❌
Tu flujo paso 1: Debe existir botón "Nueva Cotización" entre "Guardar Cotización" y "Volver"
Flujo actual: No existe este botón. El sistema espera que llenes datos sin crear una cotización primero
Impacto: No hay forma de iniciar un flujo limpio
PROBLEMA 2: No hay validación de TABs ❌
Tu flujo pasos 3-8: Cada TAB debe tener un estado de validación (TABCotizacion, TABOferta, TABPaquete, TABEstilos)
Flujo actual: Solo hay validaciones locales en cada TAB, pero no hay un sistema centralizado que impida pasar a otro TAB si faltan datos
Impacto: El usuario puede navegar TABs sin llenar datos obligatorios
PROBLEMA 3: No hay indicadores visuales de TABs incompletos ❌
Tu flujo paso 8: "Marca en la parte superior derecha de cada TAB con un identificador lumínico"
Flujo actual: Los TABs no muestran ningún indicador si están completos/incompletos
Impacto: El usuario no sabe qué TAB necesita revisión
PROBLEMA 4: El modal de edición no distingue entre "Ver" y "Editar" ⚠️
Tu flujo pasos 10-11: "Ver" abre en lectura, "Editar" abre editable Y evalúa si debe activarse
Flujo actual:
onViewProposal carga los datos pero SÍ permite edición (debería ser solo lectura)
onEdit carga los datos en modo editable pero NO VALIDA si debe cambiar estado activo
PROBLEMA 5: No hay validación de dependencias entre TABs ❌
Tu flujo paso 7: Antes de entrar a "Estilos", debe validarse que existe un paquete
Tu flujo paso 5-6: Antes de entrar a "Paquetes", debe validarse servicios base + descripción
Flujo actual: No hay estas validaciones. El usuario entra a cualquier TAB en cualquier orden
PROBLEMA 6: El flujo de guardar no es atómico ❌
Tu flujo paso 8: "Valida que las variables TAB estén en estado OK"
Flujo actual: guardarConfiguracionActual() guarda datos pero NO valida completitud de todos los TABs antes de persistir
PROBLEMA 7: La lógica de activación/desactivación no es completa ⚠️
Tu flujo paso 11: Al editar y guardar, debe preguntarse si activar la cotización editada
Flujo actual: onToggleActive existe pero no forma parte del flujo de guardado en edición
🎯 MI PROPUESTA DE CAMBIO (Sin tocar nada)
Arquitectura recomendada:
1. Sistema de Estados TAB
// Agregar estado central:
type TabValidationStatus = 'pending' | 'valid' | 'invalid';

const [tabValidationStatus, setTabValidationStatus] = useState<{
  cotizacion: TabValidationStatus;
  oferta: TabValidationStatus;
  paquetes: TabValidationStatus;
  estilos: TabValidationStatus;
  preferencias: TabValidationStatus;
}>({
  cotizacion: 'pending',
  oferta: 'pending',
  paquetes: 'pending',
  estilos: 'pending',
  preferencias: 'pending',
});

const [cotizacionIdActual, setCotizacionIdActual] = useState<string | null>(null);
2. Botón "Nueva Cotización"
Ubicación: Header, entre "Guardar Cotización" y "Volver"
Acción:
Genera un cotizacionIdActual único
Limpia todos los estados (serviciosBase, paqueteActual, serviciosOpcionales, snapshots)
Resetea todos los tabValidationStatus a 'pending'
Abre automáticamente TAB "Cotización"
Muestra toast: "Nueva cotización iniciada. Completa todos los campos obligatorios"
3. Validación de Cambio de TAB
Cuando el usuario hace clic en un TAB diferente:
Valida el TAB actual según reglas:
TAB Cotización: Todos los campos obligatorios completos + formato válido
TAB Oferta: Servicios base declarados + descripción del paquete
TAB Paquetes: Al menos 1 paquete creado
TAB Estilos: Requiere paquete (paso 7)
Si hay errores:
Muestra toast con lista específica de campos faltantes
Marca TAB actual con indicador rojo
NO permite cambio de TAB
Si está OK:
Marca TAB anterior como 'valid'
Permite cambio a nuevo TAB
4. Indicadores Visuales en TABs
Verde ✅: TAB completo y válido
Amarillo ⚠️: TAB abierto actualmente
Rojo ❌: TAB con datos incompletos/inválidos
Gris ⭕: TAB no iniciado aún
5. Lógica de Guardado Centralizado
guardarConfiguracionActual() debe:
1. Validar tabValidationStatus: todos deben ser 'valid'
2. Si alguno está 'pending' o 'invalid':
   - Toast: "Faltan datos en TAB {nombre}"
   - Highlight el TAB incompleto
   - Cancelar guardado
3. Si todo OK:
   - POST a /api/quotations (crear/actualizar)
   - POST a /api/snapshots (guardar paquetes)
   - Desactivar todas las otras cotizaciones
   - Activar esta cotización (isGlobal = true)
   - Toast: "Cotización guardada y activada"
   - Recargar historial
6. Diferenciación "Ver" vs "Editar" en Historial
Botón "Ver":

Modal abre en modo READ-ONLY (todos inputs disabled)
No permite cambios
Cierra sin preguntar cambios
Botón "Editar":

Modal abre en modo EDITABLE
Si la cotización es la ACTIVA (isGlobal=true):
Alert: "Esta es la cotización ACTIVA. Los cambios la desactivarán"
Si acepta: Entra a modo editable
Si la cotización NO es ACTIVA:
Entra directamente a modo editable
Al guardar cambios:
Pregunta: "¿Deseas activar esta cotización al guardar?"
Si sí: Desactiva todas, activa esta, cierra modal
Si no: Solo guarda cambios, mantiene desactiva
7. Validaciones de Dependencias
TabChange interceptor:
- Al ir a "Paquetes": Valida tabValidationStatus['oferta'] === 'valid'
- Al ir a "Estilos": Valida que snapshots.length > 0
- Al ir a "Historial": Solo visualización, sin validación
✅ RESUMEN EJECUTIVO
Aspecto	Estado Actual	Estado Requerido
Botón "Nueva Cotización"	❌ No existe	✅ Debe existir
Validación entre TABs	❌ No existe	✅ Bloquear navegación si hay errores
Indicadores visuales TABs	❌ No existe	✅ Verde/Amarillo/Rojo
Estado TAB centralizado	❌ No existe	✅ Sistema único de validación
Diferenciación Ver/Editar	⚠️ Parcial	✅ Totalmente diferenciado
Lógica de activación	⚠️ Incompleta	✅ Integrada al flujo de guardar
Mensajes de validación	⚠️ Genéricos	✅ Específicos por TAB
Atomicidad de guardado	❌ No	✅ Todo o nada
🔧 IMPACTO DE CAMBIOS
Complejidad: MEDIA-ALTA (requiere arquitectura significativa)

Archivos a modificar:

page.tsx - Estados, funciones de validación, interceptores
TabsModal.tsx - Indicadores visuales
Historial.tsx - Diferenciación Ver/Editar
Componentes TAB - Callbacks de validación
Tiempo estimado: 4-6 horas (diseño + implementación + pruebas)

🎯 PROPUESTA ACTUALIZADA: FLUJO VER vs EDITAR CON ESTADO ACTIVO/INACTIVO
1. DIAGRAMA DE FLUJO - HISTORIAL (BOTONES VER / EDITAR)
┌─────────────────────────────────────────────────────────────────────────┐
│                    HISTORIAL - LISTA DE COTIZACIONES                    │
│  [Cotización #1] [Cotización #2] [Cotización #3 - ACTIVA] [Cotización #4]│
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
            ┌───────▼────┐  ┌───────▼────┐  ┌────────▼────┐
            │  VER (👁️)   │  │EDITAR(✏️)   │  │ELIMINAR(🗑️) │
            └────────┬────┘  └───────┬────┘  └─────────────┘
                     │              │
        ┌────────────▼──────────────┴────────────┐
        │                                        │
    ┌───▼────────────────────┐   ┌──────────────▼───────────────────┐
    │   FLUJO "VER" (PASO 10) │   │     FLUJO "EDITAR" (PASO 11)     │
    └───┬────────────────────┘   └──────────────┬───────────────────┘
        │                                        │
        ▼                                        ▼
2. FLUJO DETALLADO "VER" (PASO 10 - MODO LECTURA)
┌────────────────────────────────────────────────────────────┐
│              USUARIO PRESIONA BOTÓN "VER"                  │
│           (Cotización #1, #2, #3 o #4)                     │
└────────────┬───────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Cargar datos de    │
    │ la cotización      │
    │ seleccionada       │
    │ (ID: xxx)          │
    └────────┬───────────┘
             │
             ▼
    ┌─────────────────────────────────────────────┐
    │  Abrir Modal de Edición de Paquetes         │
    │  Estado: READ-ONLY (Todos inputs disabled)  │
    │  Propiedad: readOnly = TRUE                 │
    └────────┬────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────┐
    │  Modal muestra TODA la información:          │
    │  - TAB Cotización: Datos cargados (disabled) │
    │  - TAB Oferta: Servicios (disabled)          │
    │  - TAB Paquetes: Paquetes (disabled)         │
    │  - TAB Estilos: Diseño (disabled)            │
    │  - TAB Historial: visible                    │
    │                                              │
    │  BOTONES:                                    │
    │  ✅ "Descargar PDF" (HABILITADO)             │
    │  ❌ "Guardar" (DESHABILITADO)                │
    │  ❌ "Guardar como Borrador" (DESHABILITADO)  │
    │  ✅ "Cerrar" (HABILITADO)                    │
    └────────┬─────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Usuario navega entre TABs        │
    │ (sin poder modificar nada)       │
    │                                  │
    │ Al presionar "Cerrar":           │
    │ → No pregunta cambios            │
    │ → Cierra modal inmediatamente    │
    │ → Vuelve a Historial             │
    └──────────────────────────────────┘
3. FLUJO DETALLADO "EDITAR" (PASO 11 - MODO EDITABLE CON DECISIONES)
┌────────────────────────────────────────────────────────────┐
│             USUARIO PRESIONA BOTÓN "EDITAR"                │
│        (Cotización #1, #2, #3 o #4)                        │
└────────┬───────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────┐
    │ Cargar datos de             │
    │ la cotización seleccionada  │
    │ (ID: yyy)                   │
    └────────┬────────────────────┘
             │
             ▼
        ┌────────────────────────────────────┐
        │ VALIDAR ESTADO DE LA COTIZACIÓN    │
        │ ¿isGlobal === true?                │
        │ (¿es la cotización ACTIVA?)        │
        └────┬──────────────────────┬────────┘
             │ SÍ (ACTIVA)         │ NO (INACTIVA)
             │                     │
    ┌────────▼────────────────┐   ┌────────▼──────────────────────┐
    │ ALERT TIPO A            │   │ ALERT TIPO B                   │
    │ "Esta es la cotización  │   │ "Esta cotización está          │
    │ ACTIVA. Los cambios     │   │ INACTIVA. Si hace cambios y    │
    │ serán actualizados al   │   │ oprime Guardar, podrá          │
    │ presionar Guardar"      │   │ seleccionar si ponerla en      │
    │                         │   │ modo ACTIVA"                   │
    │ [Aceptar] [Cancelar]    │   │ [Aceptar] [Cancelar]           │
    └────┬───────┬────────────┘   └────┬───────┬──────────────────┘
         │       │                      │       │
      SÍ│       │NO                  SÍ│       │NO
         │       │                      │       │
         │       └──────┬───────────────┼──────┘
         │              │               │
         └──────┬───────┘               │
                │                       │
                ▼                       ▼
    ┌──────────────────────────────────────────────────┐
    │ Abrir Modal MODO EDITABLE                        │
    │ Propiedad: readOnly = FALSE                      │
    │ Estado: editable = TRUE                          │
    │ Indicador: "🟡 En edición"                       │
    └────────┬─────────────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────────────┐
    │ Modal muestra TODA la información EDITABLE:      │
    │                                                  │
    │ - TAB Cotización: Inputs HABILITADOS             │
    │ - TAB Oferta: Inputs HABILITADOS                 │
    │ - TAB Paquetes: Inputs HABILITADOS               │
    │ - TAB Estilos: Inputs HABILITADOS                │
    │                                                  │
    │ BOTONES:                                         │
    │ ✅ "Descargar PDF" (HABILITADO)                  │
    │ ✅ "Guardar" (HABILITADO)                        │
    │ ✅ "Guardar como Borrador" (HABILITADO)          │
    │ ✅ "Cerrar" (HABILITADO)                         │
    │                                                  │
    │ ESTADO: Autoguardado ACTIVO (cada 800ms)        │
    └────────┬──────────────────────────────────────────┘
             │
             ▼
    ┌───────────────────────────────────────────────┐
    │  Usuario edita información en TABs            │
    │  (Autoguardado en segundo plano)              │
    │                                                │
    │  Opciones:                                     │
    │  1. Presiona "Cerrar"                          │
    │  2. Presiona "Guardar como Borrador"           │
    │  3. Presiona "Guardar"  ← IMPORTANTE           │
    └─┬────────────┬────────────────────────────────┘
      │            │
      │            ▼
      │   ┌────────────────────────────────────┐
      │   │ FLUJO "GUARDAR" (VER ABAJO)        │
      │   └────────────────────────────────────┘
      │
      ▼
    ┌──────────────────────────────────────────┐
    │ ¿Hay cambios sin guardar?                │
    │ (Comparar snapshotActual vs savedVersion)│
    │                                          │
    │ SÍ: Pregunta "¿Descartar cambios?"       │
    │     [Sí] → Cierra sin guardar            │
    │     [No] → Vuelve al modal               │
    │                                          │
    │ NO: Cierra inmediatamente                │
    └──────────────────────────────────────────┘
4. FLUJO DETALLADO "GUARDAR" (DENTRO DEL MODAL EDITABLE)
┌────────────────────────────────────────────────────────────┐
│  USUARIO PRESIONA BOTÓN "GUARDAR" EN MODAL EDITABLE        │
└────────┬───────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────────────┐
    │ Validar que todos los datos sean OK      │
    │ (Mismo nivel de validación que creación) │
    │                                          │
    │ ✓ TAB Cotización: Campos obligatorios    │
    │ ✓ TAB Oferta: Servicios + Descripción    │
    │ ✓ TAB Paquetes: Al menos 1 paquete      │
    └────────┬──────────────────────┬─────────┘
             │ VÁLIDO               │ INVÁLIDO
             │                      │
             │                  ┌───▼──────────┐
             │                  │ Toast Error:  │
             │                  │ "Faltan datos │
             │                  │ en TAB: ___"  │
             │                  │               │
             │                  │ Vuelve al     │
             │                  │ modal         │
             │                  └───────────────┘
             │
             ▼
    ┌────────────────────────────────────────────┐
    │ DECISION CRÍTICA                           │
    │ ¿Esta cotización era ACTIVA al abrir?      │
    │ (Comparar estado anterior vs actual)       │
    │                                            │
    │ if (wasGlobalBefore)                       │
    │    → GUARDADO SIMPLE (RAMA A)              │
    │ else                                       │
    │    → GUARDADO CON DECISIÓN (RAMA B)        │
    └────┬─────────────────────────────┬────────┘
         │                             │
    RAMA A│                         RAMA B│
    (ERA  │                      (NO ERA  │
    ACTIVA)                       ACTIVA)
         │                             │
         ▼                             ▼
  ┌────────────────────┐    ┌──────────────────────────┐
  │ GUARDAR SIMPLE     │    │ GUARDAR CON ACTIVACIÓN   │
  │                    │    │                          │
  │ 1. Guardar cambios │    │ 1. Guardar cambios en BD │
  │    en BD           │    │ 2. Mostrar ALERT:        │
  │ 2. NO cambiar      │    │    "¿Deseas activar esta │
  │    estado activo   │    │    cotización al         │
  │ 3. Toast:          │    │    guardar?"             │
  │    "✅ Cotización   │    │    [SÍ] [NO]            │
  │    actualizada"    │    │                          │
  │ 4. Cerrar modal    │    │ if (SÍ):                 │
  │ 5. Recargar datos  │    │    → IR A "ACTIVACIÓN"   │
  │                    │    │                          │
  │ ✓ Estado sigue     │    │ if (NO):                 │
  │   ACTIVO (si era)  │    │    → Ir a "FIN EDITAR"   │
  │ ✓ Estado sigue     │    │                          │
  │   INACTIVO (si era)│    │ ✓ Permite elegir al user │
  └────────────────────┘    └──────────────────────────┘
         │                             │
         │                             ├─────────────┐
         │                             │             │
         │                        (SÍ)▼        (NO)  ▼
         │                     ┌──────────────┐ ┌──────────┐
         │                     │ACTIVACIÓN    │ │FIN EDITAR│
         │                     └──────┬───────┘ └────┬─────┘
         │                            │             │
         │                            ▼             │
         │                   ┌─────────────────┐    │
         │                   │Desactivar todas │    │
         │                   │excepto esta     │    │
         │                   │                 │    │
         │                   │Activar esta:    │    │
         │                   │isGlobal = TRUE  │    │
         │                   │                 │    │
         │                   │Toast: "✅       │    │
         │                   │Cotización       │    │
         │                   │activada"        │    │
         │                   └────────┬────────┘    │
         │                            │             │
         └────────────┬───────────────┤─────────────┘
                      │               │
                      ▼               ▼
            ┌────────────────────────────────────┐
            │ FIN EDITAR                         │
            │                                    │
            │ 1. Cerrar modal                    │
            │ 2. Recargar lista de cotizaciones │
            │ 3. Actualizar estado en Historial │
            │ 4. Volver a Historial             │
            └────────────────────────────────────┘
5. TABLA COMPARATIVA VER vs EDITAR vs NUEVA
Aspecto	VER (Paso 10)	EDITAR (Paso 11)	NUEVA COTIZACIÓN
Modal abre en	READ-ONLY	EDITABLE	EDITABLE
readOnly	TRUE	FALSE	FALSE
¿Pregunta al abrir?	No	SÍ (Alert TIPO A o B)	No
Alert si ACTIVA	No	"Los cambios serán actualizados..."	N/A
Alert si INACTIVA	No	"Podrá seleccionar si ponerla ACTIVA..."	N/A
Inputs habilitados	❌ NO	✅ SÍ	✅ SÍ
Botón Guardar	❌ Deshabilitado	✅ Habilitado	✅ Habilitado
Botón Descargar PDF	✅ Habilitado	✅ Habilitado	✅ Habilitado
Autoguardado activo	❌ NO	✅ SÍ (800ms)	✅ SÍ
Al cerrar	Sin preguntar	Pregunta si hay cambios	Pregunta si hay cambios
Al guardar	N/A	Pregunta activación (si era inactiva)	Desactiva todas, activa esta
Estado después guardar	N/A	Puede cambiar o mantenerse	Siempre ACTIVA

6. MATRIZ DE DECISIONES - FLUJO EDITAR
┌─────────────────────────────────────────────────────────────────┐
│ EDITAR: MATRIZ DE DECISIONES                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ENTRADA: Usuario abre botón "EDITAR" en Historial              │
│                                                                 │
│ PREGUNTA 1: ¿isGlobal === true? (¿Es ACTIVA?)                  │
│                                                                 │
│  ├─ SÍ → ALERT TIPO A + "Los cambios serán actualizados..."    │
│  │       ├─ [Aceptar] → EDITAR en modo ACTIVA                  │
│  │       │             └─ Al guardar: Guarda cambios SOLAMENTE │
│  │       └─ [Cancelar] → Cierra sin abrir modal                │
│  │                                                              │
│  └─ NO → ALERT TIPO B + "Podrá seleccionar si ponerla ACTIVA" │
│          ├─ [Aceptar] → EDITAR en modo INACTIVA               │
│          │             └─ Al guardar: Pregunta sobre activación│
│          │                ├─ SÍ → Activa + Desactiva otras    │
│          │                └─ NO → Solo guarda cambios           │
│          └─ [Cancelar] → Cierra sin abrir modal                │
│                                                                 │
│ PREGUNTA 2: (Ya dentro del modal editable)                      │
│             ¿Usuario presiona "Guardar"?                        │
│                                                                 │
│  └─ SÍ → Validar datos completitud (igual a creación)          │
│         ├─ INVÁLIDO → Toast error específico + Vuelve a modal  │
│         └─ VÁLIDO →                                             │
│              └─ PREGUNTA 3: ¿wasGlobalBeforeOpening?           │
│                  ├─ SÍ (Era ACTIVA) → Guarda sin preguntar     │
│                  └─ NO (Era INACTIVA) →                        │
│                      └─ PREGUNTA 4: ¿Deseas activar?           │
│                          ├─ SÍ → Activa + Desactiva otras      │
│                          └─ NO → Solo guarda cambios            │
│                                                                 │
│ PREGUNTA 3: ¿Usuario presiona "Cerrar"?                        │
│  ├─ Y hay cambios → Pregunta: "¿Descartar cambios?"           │
│  │                  ├─ SÍ → Cierra sin guardar                 │
│  │                  └─ NO → Vuelve a modal                     │
│  └─ Sin cambios → Cierra inmediatamente                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
7. VARIABLES/ESTADOS NECESARIOS
// En page.tsx - NUEVOS ESTADOS REQUERIDOS

// 1. Distinguir si el modal se abrió en modo "Ver" vs "Editar"
const [modoHistorial, setModoHistorial] = useState<'ver' | 'editar' | null>(null)

// 2. Guardar el estado ANTES de abrir el modal para comparar
const [quotationEstadoAntes, setQuotationEstadoAntes] = useState<{
  wasGlobal: boolean
  wasActive: boolean
} | null>(null)

// 3. Guardar datos para comparar cambios
const [snapshotOriginalJson, setSnapshotOriginalJson] = useState<string | null>(null)

// 4. Control de confirmación después de guardar
const [mostrarConfirmacionActivacion, setMostrarConfirmacionActivacion] = useState(false)

// ESTADOS YA EXISTENTES QUE SE REUTILIZARÁN:
// - readOnly: boolean (ya existe)
// - showModalEditar: boolean (ya existe)
// - snapshotEditando: PackageSnapshot | null (ya existe)
// - autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error' (ya existe)
8. FUNCIONES NECESARIAS
// Nuevas funciones a crear:

1. abrirModalVer(quotation: QuotationConfig) 
   └─ Cargar datos en readOnly=true
   └─ No mostrar alerts
   └─ Deshabilirar botón guardar

2. abrirModalEditar(quotation: QuotationConfig)
   ├─ Guardar estado anterior (wasGlobal)
   ├─ Mostrar alert TIPO A o TIPO B según isGlobal
   ├─ Si acepta:
   │  └─ Cargar datos en readOnly=false
   │  └─ Activar autoguardado
   └─ Si cancela: No abrir modal

3. validarYGuardarEdicion()
   ├─ Validar completitud de datos
   ├─ if (wasGlobal) → guardar sin preguntar
   └─ else → pregunta si activar
   
4. manejarActivacionAlGuardar()
   ├─ Mostrar ALERT: "¿Deseas activar?"
   ├─ if (sí) → desactivarTodas() + activar actual
   └─ if (no) → solo guardar cambios

5. cerrarModalConValidacion()
   ├─ if (hay cambios) → pregunta descartar
   ├─ if (no hay cambios) → cierra directo
   └─ Limpiar estados

// FUNCIONES A MODIFICAR:

- Historial.tsx: Diferenciar callbacks onEdit y onViewProposal
- page.tsx: Los callbacks en Historial deben usar abrirModalVer y abrirModalEditar
9. FLUJO COMPLETO DE ESTADOS (Timeline)
ESCENARIO 1: Usuario abre "VER" una cotización ACTIVA
┌─────────────────────────────────────────────────────────┐
│ 1. Click "VER"                                          │
│ 2. readOnly = TRUE                                      │
│ 3. modoHistorial = 'ver'                                │
│ 4. Modal abre → Datos cargados (disabled)               │
│ 5. User navega TABs (sin editar)                        │
│ 6. Click "Cerrar" → Modal cierra sin preguntar          │
│ 7. Vuelve a Historial                                   │
│ ✓ Cotización sigue ACTIVA                              │
│ ✓ Sin cambios registrados                              │
└─────────────────────────────────────────────────────────┘

ESCENARIO 2: Usuario abre "EDITAR" cotización ACTIVA
┌─────────────────────────────────────────────────────────┐
│ 1. Click "EDITAR"                                       │
│ 2. quotationEstadoAntes = { wasGlobal: true, ... }      │
│ 3. ALERT A: "Esta es la cotización ACTIVA. Los cambios │
│    serán actualizados al presionar Guardar"             │
│ 4. [Aceptar] → readOnly = FALSE, modoHistorial='editar'│
│ 5. Modal abre → Datos cargados (enabled)               │
│ 6. User edita varios campos                             │
│ 7. Click "Guardar"                                      │
│ 8. Validación OK → since wasGlobal=true → Guardar      │
│ 9. Toast: "✅ Cotización actualizada"                  │
│ 10. Modal cierra                                        │
│ 11. Recargar Historial                                  │
│ ✓ Cotización sigue ACTIVA (estado no cambió)           │
│ ✓ Cambios persistidos en BD                            │
└─────────────────────────────────────────────────────────┘

ESCENARIO 3: Usuario abre "EDITAR" cotización INACTIVA
┌─────────────────────────────────────────────────────────┐
│ 1. Click "EDITAR"                                       │
│ 2. quotationEstadoAntes = { wasGlobal: false, ... }     │
│ 3. ALERT B: "Esta cotización está INACTIVA. Si hace     │
│    cambios y oprime Guardar, podrá seleccionar si       │
│    ponerla en modo ACTIVA"                              │
│ 4. [Aceptar] → readOnly = FALSE, modoHistorial='editar'│
│ 5. Modal abre → Datos cargados (enabled)               │
│ 6. User edita servicios y descripción                   │
│ 7. Click "Guardar"                                      │
│ 8. Validación OK → since wasGlobal=false →             │
│    ALERT: "¿Deseas activar esta cotización?"           │
│    [SÍ] [NO]                                            │
│                                                         │
│    ── Si [SÍ] ──                                        │
│    9a. Desactivar todas las cotizaciones               │
│    10a. Activar esta (isGlobal = true)                 │
│    11a. Toast: "✅ Cotización activada"                │
│    12a. Modal cierra                                    │
│    ✓ Cotización ahora ACTIVA                           │
│                                                         │
│    ── Si [NO] ──                                        │
│    9b. Guardar cambios solamente                        │
│    10b. Toast: "✅ Cambios guardados"                  │
│    11b. Modal cierra                                    │
│    ✓ Cotización sigue INACTIVA                         │
│                                                         │
│ 13. Recargar Historial                                 │
└─────────────────────────────────────────────────────────┘

ESCENARIO 4: Usuario abre "VER" y luego "EDITAR"
┌─────────────────────────────────────────────────────────┐
│ 1. Click "VER" en Cotización #2                         │
│ 2. readOnly = TRUE, modoHistorial = 'ver'               │
│ 3. Navega TABs en modo lectura                          │
│ 4. Click "Cerrar" → Modal cierra                        │
│ 5. Vuelve a Historial                                   │
│ 6. Click "EDITAR" en MISMA Cotización #2                │
│ 7. quotationEstadoAntes = { wasGlobal: false }          │
│ 8. ALERT B mostrado                                     │
│ 9. Entra a modo edición                                 │
│ ... (continúa Escenario 3)                              │
└─────────────────────────────────────────────────────────┘
10. CAMBIOS EN COMPONENTES
A. Historial.tsx - Cambios necesarios:
// ANTES:
<button onClick={() => onEdit?.(quotation)}>
  <FaEdit /> Editar
</button>

// DESPUÉS: Dos botones separados con callbacks diferentes
<button onClick={() => onView?.(quotation)}>
  <FaEye /> Ver
</button>
<button onClick={() => onEdit?.(quotation)}>
  <FaEdit /> Editar
</button>
B. page.tsx (administrador/page.tsx) - Cambios necesarios:
// En pageTabs array, modificar callbacks de Historial:

onView={(quotation) => {
  // Nuevo callback para VER (read-only)
  abrirModalVer(quotation)
}}

onEdit={(quotation) => {
  // Callback para EDITAR (con alerts)
  abrirModalEditar(quotation)
}}

// Las funciones abrirModalVer y abrirModalEditar manejan toda la lógica
C. Modal de Edición - Cambios visuales:
VER (readOnly=true):
┌─────────────────────────────────┐
│ 📖 MODO LECTURA (Ver)            │  ← Indicador visual
├─────────────────────────────────┤
│ [TAB Cotización] [TAB Oferta]... │
│ ┌─────────────────────────────  │
│ │ Empresa: [XYZ Corp] (disabled) │
│ │ Email: [email@...] (disabled)  │
│ └─────────────────────────────  │
│                                  │
│ Botones:                         │
│ [Descargar PDF] [✅ Cerrar]      │  ← Solo Cerrar habilitado
└─────────────────────────────────┘

EDITAR (readOnly=false):
┌─────────────────────────────────┐
│ ✏️  MODO EDICIÓN (Editar)        │  ← Indicador visual
├─────────────────────────────────┤
│ [TAB Cotización] [TAB Oferta]... │
│ ┌─────────────────────────────  │
│ │ Empresa: [XYZ Corp] (enabled)  │
│ │ Email: [email@...] (enabled)   │
│ └─────────────────────────────  │
│                                  │
│ Botones:                         │
│ [Descargar PDF] [Guardar] [Cerrar]
└─────────────────────────────────┘
11. VALIDACIONES REQUERIDAS
// Validación al cambiar de TAB dentro del modal

const validarCambioTab = (tabActual: string, tabNuevo: string) => {
  if (readOnly) return true // Si es lectura, permitir
  
  if (tabActual === 'cotizacion' && !validarCotizacionCompleta()) {
    toast.error('❌ Completa los campos obligatorios en Cotización')
    return false
  }
  
  if (tabActual === 'oferta' && !validarOfertaCompleta()) {
    toast.error('❌ Declara servicios bases y descripción del paquete')
    return false
  }
  
  if (tabActual === 'paquetes' && snapshots.length === 0) {
    toast.error('❌ Crea al menos un paquete antes de continuar')
    return false
  }
  
  return true
}
12. RESUMEN DE CAMBIOS POR ARCHIVO
Archivo	Cambio	Impacto
Historial.tsx	Agregar callback onView	Interface cambia
page.tsx	Crear abrirModalVer(), abrirModalEditar()	+300-400 líneas
page.tsx	Agregar nuevos estados (modoHistorial, quotationEstadoAntes, etc)	+5 estados
Modal edición	Agregar indicadores visuales (VER/EDITAR)	CSS + UI
AlertDialog	Crear componente para ALERT TIPO A y B	Nuevo componente


📋 PROPUESTA: Integración "Ver" vs "Editar" sin Modificar TABs del Modal
Después de revisar detalladamente la estructura actual, tengo muy clara tu solicitud. Aquí está mi análisis:

🔍 ESTADO ACTUAL
Modal de Edición - TABs Existentes (6 TABs que NO deben tocarse):

Descripción - Nombre, Tipo, Emoji, Tagline, Tiempo Entrega, Costo Desarrollo, Descripción + Vista Previa del Hero
Servicios Base - Lista de servicios base + Vista Previa de Montos
Otros Servicios - (Revisar para completar)
Opciones de Pago - (Revisar para completar)
Descuentos - (Revisar para completar)
Gestión - (Revisar para completar)
Botones de Acción en PaquetesTab:

✓ Toggle Activo (FAB checkbox) - Activa/desactiva el paquete
✓ Editar (FAB lápiz) - Abre modal con abrirModalEditar(snapshot)
✓ Eliminar (FAB basura) - Elimina el paquete
✓ Activar checkbox (En paquetes inactivos)
Problema Identificado:

El modal llena los TABs con datos del snapshotEditando
NO vincula datos de cotizacionActual (header: empresa, profesional, fechas, contactos, etc.)
El flag readOnly existe pero solo deshabilita inputs (visual débil)
No diferencia claramente entre "Ver" (lectura total) y "Editar" (modificable)
✅ MI PROPUESTA DE INTEGRACIÓN
Objetivo: Los TABs del modal mantienen su estructura actual, pero llenamos con datos vinculados a la cotización seleccionada, y diferenciamos Ver/Editar de forma clara.

1. Dos Puntos de Entrada al Modal (Funciones NUEVAS)
// NUEVA FUNCIÓN: Abrir Modal en Modo VER (Read-Only)
const abrirModalVer = (quotation: QuotationConfig, snapshot: PackageSnapshot) => {
  // Vincular datos del header (cotizacionActual)
  setCotizacionActual({
    id: quotation.id,
    numero: quotation.numero,
    versionNumber: quotation.versionNumber,
    fechaEmision: quotation.fechaEmision,
    tiempoValidez: quotation.tiempoValidez,
    empresa: quotation.empresa,
    sector: quotation.sector,
    ubicacion: quotation.ubicacion,
    emailCliente: quotation.emailCliente,
    whatsappCliente: quotation.whatsappCliente,
    profesional: quotation.profesional,
    empresaProveedor: quotation.empresaProveedor,
    emailProveedor: quotation.emailProveedor,
    whatsappProveedor: quotation.whatsappProveedor,
    ubicacionProveedor: quotation.ubicacionProveedor,
    heroTituloMain: quotation.heroTituloMain,
    heroTituloSub: quotation.heroTituloSub,
  })
  
  // Cargar snapshot en el modal
  setSnapshotEditando(snapshot)
  setSnapshotOriginalJson(JSON.stringify(snapshot))
  
  // Mostrar alerta VER (TIPO A para ACTIVA, TIPO B para INACTIVA)
  if (quotation.activo && quotation.isGlobal) {
    toast.info('📖 Esta es la cotización ACTIVA. Los cambios NO se guardarán.')
  } else if (!quotation.activo) {
    toast.warning('📖 Esta cotización está INACTIVA. Visualizando configuración actual.')
  }
  
  // Modo lectura
  setReadOnly(true)
  setShowModalEditar(true)
  setActiveModalTab('descripcion') // Siempre empezar en Descripción
}

// NUEVA FUNCIÓN: Abrir Modal en Modo EDITAR (Editable)
const abrirModalEditar = (quotation: QuotationConfig | null, snapshot: PackageSnapshot) => {
  // Si viene desde Historial (quotation exists)
  if (quotation) {
    setCotizacionActual({
      id: quotation.id,
      numero: quotation.numero,
      versionNumber: quotation.versionNumber,
      fechaEmision: quotation.fechaEmision,
      tiempoValidez: quotation.tiempoValidez,
      empresa: quotation.empresa,
      sector: quotation.sector,
      ubicacion: quotation.ubicacion,
      emailCliente: quotation.emailCliente,
      whatsappCliente: quotation.whatsappCliente,
      profesional: quotation.profesional,
      empresaProveedor: quotation.empresaProveedor,
      emailProveedor: quotation.emailProveedor,
      whatsappProveedor: quotation.whatsappProveedor,
      ubicacionProveedor: quotation.ubicacionProveedor,
      heroTituloMain: quotation.heroTituloMain,
      heroTituloSub: quotation.heroTituloSub,
    })
    
    // Mostrar ALERT TIPO A o TIPO B según estado
    if (quotation.activo && quotation.isGlobal) {
      toast.info('⚠️ ALERT TIPO A: Esta es la cotización ACTIVA. Los cambios serán actualizados al presionar Guardar')
    } else if (!quotation.activo) {
      toast.warning('⚠️ ALERT TIPO B: Esta cotización está INACTIVA. Si hace cambios y oprime en guardar, podrá seleccionar si ponerla en modo ACTIVA')
    }
  }
  
  // Cargar snapshot
  setSnapshotEditando(snapshot)
  setSnapshotOriginalJson(JSON.stringify(snapshot))
  
  // Modo editable
  setReadOnly(false)
  setShowModalEditar(true)
  setActiveModalTab('descripcion')
}

2. Modificar Callbacks en Historial.tsx
Actualmente Historial.tsx recibe 3 callbacks: onEdit, onViewProposal, onDelete

NUEVA estructura con 2 puntos de entrada claramente diferenciados:
{/* En Historial.tsx - Botones de Acción */}

// Botón "VER" - Abre en modo read-only
<button onClick={() => onViewProposal(quotation)} className="...">
  📖 VER
</button>

// Botón "EDITAR" - Abre en modo editable
<button onClick={() => onEdit(quotation)} className="...">
  ✏️ EDITAR
</button>

// Botón "ELIMINAR" - Existing
<button onClick={() => onDelete(quotation.id)} className="...">
  🗑️ ELIMINAR
</button>
3. Los TABs del Modal Permanecen Igual
Los 6 TABs NO cambian:

✓ Descripción
✓ Servicios Base
✓ Otros Servicios
✓ Opciones de Pago
✓ Descuentos
✓ Gestión
PERO, al abrir el modal:

Si readOnly = true → Todos los inputs deshabilitados + visual indicador "📖 SOLO LECTURA"
Si readOnly = false → Inputs habilitados + visual indicador "✏️ EDITAR"
Los campos se pre-llenan automáticamente con los datos del snapshot.

4. Flujo de Guardado (Sin Cambiar TABs)
Si readOnly = true (Modo VER):

Botón "Guardar" NO visible o deshabilitado
Usuario solo puede ver y navegar entre TABs
Si readOnly = false (Modo EDITAR):

Botón "Guardar" habilitado
Al guardar:
Si cotización es ACTIVA → Guardar sin preguntar
Si cotización es INACTIVA → Después de guardar, preguntar: "¿Deseas activar esta cotización?"
YES → Desactivar todas, activar esta, cerrar modal
NO → Solo guardar cambios, mantener inactiva, cerrar modal
5. Vinculación de Datos del Header
Los datos de cotizacionActual (que vienen del header - empresa, profesional, fechas, contactos) se cargan en ambas funciones pero:

NO se editan en el modal (pertenecen al TAB "Cotización" en la página principal)
Se muestran como referencia en la página principal cuando cargas un snapshot
El modal solo edita datos del snapshotEditando (Paquete + Servicios)
6. Cambios Requeridos por Archivo
Archivo	Cambio	Detalle
page.tsx (administrador)	✨ NUEVA función abrirModalVer()	Abre modal con readOnly = true
page.tsx (administrador)	🔄 MODIFICAR abrirModalEditar()	Recibe quotation como parámetro, vincula datos, muestra alertas
page.tsx (administrador)	🔄 MODIFICAR callback onEdit en Historial	Llama a abrirModalEditar(quotation, snapshot)
page.tsx (administrador)	🔄 MODIFICAR callback onViewProposal en Historial	Llama a abrirModalVer(quotation, snapshot)
Historial.tsx	➕ Agregar botón "VER" claro	Estilo diferenciado de "EDITAR"
Modal Header	🎨 Mejorar indicador visual	Mostrar "📖 VER" o "✏️ EDITAR" de forma destacada
🎯 RESUMEN: Lo Que NO Cambia
✅ TABs del modal permanecen intactos - 6 TABs con su estructura actual
✅ Botones en PaquetesTab sin cambios - Toggle Activo, Editar, Eliminar funcionan igual
✅ Campos dentro de TABs sin cambios - Mismos inputs, misma validación
✅ API calls sin cambios - Mismo guardado de snapshots

🎯 RESUMEN: Lo Que SÍ Cambia
✨ 2 funciones nuevas - abrirModalVer() (read-only) + mejorada abrirModalEditar() (editable)
✨ Vinculación de datos - Header data (cotizacionActual) se carga cuando abres el modal
✨ Alertas diferenciadas - ALERT TIPO A (ACTIVA) vs ALERT TIPO B (INACTIVA)
✨ Lógica de guardado condicional - Si INACTIVA, preguntar si activar
✨ UI visual diferenciada - "📖 VER" vs "✏️ EDITAR" en header del modal
✨ Botón VER en Historial - Diferenciado visualmente de EDITAR
📋 PROPUESTA ACTUALIZADA: Cargar Cotización Completa (No Solo Snapshot)
Ahora lo entiendo correctamente. Aquí está la aclaración:

🔴 LO QUE ESTAVA MAL EN MI PROPUESTA ANTERIOR
❌ Yo pensaba: Modal carga UN snapshot individual
❌ Por eso decía: "Llenar TABs con datos del snapshot"
❌ Resultado: Solo editar UN paquete a la vez

✅ LO QUE DEBE SER (TU CORRECCIÓN)
✅ Modal debe cargar la COTIZACIÓN COMPLETA usando quotation.id
✅ La cotización contiene: Header data (empresa, profesional, fechas, contactos) + TODOS sus paquetes (quotationSnapshots[])
✅ Resultado: Editar la cotización completa con todos sus paquetes de una vez

🏗️ ESTRUCTURA DE DATOS CORRECTA
// NUEVA FUNCIÓN: Abrir Modal en Modo VER (Read-Only)
// Recibe la QuotationConfig COMPLETA + acceso a todos sus snapshots
const abrirModalVer = (quotation: QuotationConfig) => {
  // 1. Cargar datos COMPLETOS de la cotización (header)
  setCotizacionActual({
    id: quotation.id,
    numero: quotation.numero,
    versionNumber: quotation.versionNumber,
    fechaEmision: quotation.fechaEmision,
    tiempoValidez: quotation.tiempoValidez,
    empresa: quotation.empresa,
    sector: quotation.sector,
    ubicacion: quotation.ubicacion,
    emailCliente: quotation.emailCliente,
    whatsappCliente: quotation.whatsappCliente,
    profesional: quotation.profesional,
    empresaProveedor: quotation.empresaProveedor,
    emailProveedor: quotation.emailProveedor,
    whatsappProveedor: quotation.whatsappProveedor,
    ubicacionProveedor: quotation.ubicacionProveedor,
    heroTituloMain: quotation.heroTituloMain,
    heroTituloSub: quotation.heroTituloSub,
    activo: quotation.activo,
    isGlobal: quotation.isGlobal,
  })

  // 2. Obtener TODOS los paquetes de esta cotización
  const quotationSnapshots = snapshots.filter(s => s.quotationConfigId === quotation.id)
  
  // 3. Si hay paquetes, cargar el PRIMERO como referencia (read-only)
  if (quotationSnapshots.length > 0) {
    setSnapshotEditando(quotationSnapshots[0])
    setSnapshotOriginalJson(JSON.stringify(quotationSnapshots[0]))
  }

  // 4. Mostrar alerta apropiada
  if (quotation.activo && quotation.isGlobal) {
    toast.info('📖 Esta es la cotización ACTIVA. Modo visualización.')
  } else if (!quotation.activo) {
    toast.warning('📖 Esta cotización está INACTIVA. Modo visualización.')
  }

  // 5. Activar modo lectura
  setReadOnly(true)
  setShowModalEditar(true)
  setActiveModalTab('descripcion')
}

// NUEVA FUNCIÓN: Abrir Modal en Modo EDITAR (Editable)
// Recibe la QuotationConfig COMPLETA + acceso a todos sus snapshots
const abrirModalEditar = (quotation: QuotationConfig) => {
  // 1. Cargar datos COMPLETOS de la cotización (header)
  setCotizacionActual({
    id: quotation.id,
    numero: quotation.numero,
    versionNumber: quotation.versionNumber,
    fechaEmision: quotation.fechaEmision,
    tiempoValidez: quotation.tiempoValidez,
    empresa: quotation.empresa,
    sector: quotation.sector,
    ubicacion: quotation.ubicacion,
    emailCliente: quotation.emailCliente,
    whatsappCliente: quotation.whatsappCliente,
    profesional: quotation.profesional,
    empresaProveedor: quotation.empresaProveedor,
    emailProveedor: quotation.emailProveedor,
    whatsappProveedor: quotation.whatsappProveedor,
    ubicacionProveedor: quotation.ubicacionProveedor,
    heroTituloMain: quotation.heroTituloMain,
    heroTituloSub: quotation.heroTituloSub,
    activo: quotation.activo,
    isGlobal: quotation.isGlobal,
  })

  // 2. Obtener TODOS los paquetes de esta cotización
  const quotationSnapshots = snapshots.filter(s => s.quotationConfigId === quotation.id)
  
  // 3. Si hay paquetes, cargar el PRIMERO para editar
  if (quotationSnapshots.length > 0) {
    setSnapshotEditando(quotationSnapshots[0])
    setSnapshotOriginalJson(JSON.stringify(quotationSnapshots[0]))
  } else {
    // Si no hay paquetes, crear estructura vacía
    setSnapshotEditando({
      id: '',
      nombre: '',
      serviciosBase: [],
      gestion: { precio: 0, mesesGratis: 0, mesesPago: 12 },
      paquete: { desarrollo: 0, descuento: 0 },
      otrosServicios: [],
      costos: { inicial: 0, año1: 0, año2: 0 },
      activo: true,
      quotationConfigId: quotation.id,
      createdAt: new Date().toISOString(),
    })
  }

  // 4. Mostrar ALERT TIPO A o TIPO B según estado
  if (quotation.activo && quotation.isGlobal) {
    toast.warning('⚠️ ALERT TIPO A: Esta es la cotización ACTIVA. Los cambios serán actualizados al presionar Guardar')
  } else if (!quotation.activo) {
    toast.warning('⚠️ ALERT TIPO B: Esta cotización está INACTIVA. Si hace cambios y oprime en guardar, podrá seleccionar si ponerla en modo ACTIVA')
  }

  // 5. Activar modo editable
  setReadOnly(false)
  setShowModalEditar(true)
  setActiveModalTab('descripcion')
}

2. Cambios en Historial.tsx (Botones de Acción)
Estructura actual: 3 botones (Editar, Ver, Eliminar) + Toggle Activo

Nueva estructura (SIN CAMBIAR el render visual):
// En el callback:

{/* Botón "VER" - Abre cotización completa en modo read-only */}
<button onClick={() => onViewProposal?.(quotation)} className="...">
  📖 VER
</button>

{/* Botón "EDITAR" - Abre cotización completa en modo editable */}
<button onClick={() => onEdit?.(quotation)} className="...">
  ✏️ EDITAR
</button>

// Los botones pasan la QuotationConfig COMPLETA, no un snapshot
3. TABs del Modal - SIGUEN IGUAL
Los 6 TABs mantienen su estructura, pero ahora:

TAB	Contenido	Fuente de Datos
Descripción	Nombre, Tipo, Emoji, Tagline, etc.	snapshotEditando.paquete + snapshotEditando.nombre
Servicios Base	Lista de servicios base	snapshotEditando.serviciosBase[]
Otros Servicios	Servicios opcionales	snapshotEditando.otrosServicios[]
Opciones Pago	Formas de pago	snapshotEditando.paquete.opcionesPago[]
Descuentos	Descuentos por tipo	snapshotEditando.paquete.descuentos*
Gestión	Configuración de gestión	snapshotEditando.gestion
Lo que CAMBIA:

Los datos ahora vienen del snapshotEditando que está vinculado a la quotation.id
El header del modal muestra: "Cotización #COT-001 - Acme Corp - Juan" (datos de cotizacionActual)
Abajo se editan los 6 TABs del primer paquete de esa cotización
4. Flujo de Edición (Actualizado)
Paso a Paso:

Usuario hace clic en botón "EDITAR" en Historial

Se pasa quotation (QuotationConfig completa)

abrirModalEditar(quotation) ejecuta:

Carga cotizacionActual con TODOS los datos del header
Busca todos los snapshots vinculados: snapshots.filter(s => s.quotationConfigId === quotation.id)
Carga el PRIMER paquete en snapshotEditando (para editar)
Muestra alertas TIPO A o TIPO B según estado
Abre el modal con readOnly = false
Usuario edita los 6 TABs del paquete:

Descripción (nombre, tipo, emoji, etc.)
Servicios Base
Otros Servicios
Opciones Pago
Descuentos
Gestión
Al guardar:

Si ACTIVA: Guardar cambios sin preguntar
Si INACTIVA: Guardar cambios + preguntar "¿Activar esta cotización?"
5. Cambios por Archivo (Actualizado)
Archivo	Cambio	Detalle
page.tsx (administrador)	✨ NUEVA función abrirModalVer()	Recibe quotation (no snapshot)
page.tsx (administrador)	🔄 MODIFICAR abrirModalEditar()	Recibe quotation (no snapshot), carga toda la cotización
page.tsx (administrador)	🔄 MODIFICAR callback onEdit en Historial	Pasa quotation a abrirModalEditar(quotation)
page.tsx (administrador)	🔄 MODIFICAR callback onViewProposal en Historial	Pasa quotation a abrirModalVer(quotation)
Historial.tsx	✅ SIN CAMBIOS	Los botones YA pasan quotation al callback
Modal TABs	✅ SIN CAMBIOS	Siguen llenándose desde snapshotEditando
6. RESUMEN: Diferencia Clave
Aspecto	Antes (Mi propuesta)	Ahora (Correcta)
¿Qué se abre en el modal?	UN snapshot individual	La QuotationConfig COMPLETA (header + todos sus paquetes)
¿Qué se muestra en el header?	Solo nombre del paquete	Cotización #001 - Acme - Juan (datos header)
¿Qué se edita en los TABs?	Ese snapshot	El PRIMER paquete de esa cotización
¿Datos de cotizacionActual?	Vinculados pero no usados	Cargados completamente y mostrados en el header
¿De dónde vienen los datos del header?	De cotizacionActual	De la quotation que se pasó al abrir el modal

