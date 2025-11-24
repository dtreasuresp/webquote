# Flujo de Creación de Cotizaciones

## 🔴 PROBLEMA ACTUAL (ROTO)

```mermaid
graph TD
    A["🟦 Inicio:<br/>Página Administrador"] --> B["🟨 Se crea/carga<br/>QuotationConfig<br/>(ID: ckxyz123)"]
    B --> C["🟨 Usuario llena datos<br/>y crea paquetes"]
    
    C --> D["🟧 Click<br/>Crear Paquete"]
    C --> E["🟧 Click<br/>Guardar Cotización"]
    
    D --> F["🟥 crearPaqueteSnapshot()<br/>SIN quotationConfigId ❌"]
    F --> G["🟥 POST /api/snapshots<br/>(SIN quotationConfigId)"]
    G --> H["🟥 BD: PackageSnapshot<br/>quotationConfigId = NULL"]
    
    E --> I["🟩 guardarConfiguracionActual()<br/>PUT /api/quotation-config/[id]"]
    I --> J["🟧 QuotationConfig guardada ✅<br/>PERO paquetes sin vinculación ❌"]
    
    H --> K["🔴 RESULTADO:<br/>Paquetes desaparecen ❌"]
    J --> K
    
    K --> L["⚠️ Al recargar página:<br/>Paquetes no aparecen<br/>Usuario confundido"]
    
    style A fill:#d4e6f1
    style B fill:#e8daef
    style C fill:#fdebd0
    style D fill:#fdebd0
    style E fill:#fdebd0
    style F fill:#fadbd8
    style G fill:#fadbd8
    style H fill:#fadbd8
    style I fill:#d5f4e6
    style J fill:#fadbd8
    style K fill:#ff6b6b
    style L fill:#ff6b6b
```

---

## ✅ SOLUCIÓN: OPCIÓN 1 - Auto-Link on Create (RECOMENDADA)

```mermaid
graph TD
    A["🟦 Inicio:<br/>Página Administrador"] --> B["🟨 Se crea/carga<br/>QuotationConfig<br/>(ID: ckxyz123)"]
    B --> C["🟨 Usuario llena datos<br/>y crea paquetes"]
    
    C --> D["🟧 Click<br/>Crear Paquete"]
    
    D --> F["🟩 crearPaqueteSnapshot()<br/>AHORA: Incluye quotationConfigId ✅"]
    F --> F2["Nueva función:<br/>Obtiene cotizacionConfig?.id"]
    F2 --> G["🟩 POST /api/snapshots<br/>CON quotationConfigId"]
    G --> H["🟩 API recibe y guarda:<br/>quotationConfigId guardado en BD ✅"]
    
    H --> I["🟩 PackageSnapshot vinculado<br/>a la cotización"]
    
    I --> J["🟧 Usuario crea más paquetes<br/>Todos se vinculan automáticamente"]
    
    J --> K["🟧 Click<br/>Guardar Cotización"]
    K --> L["🟩 guardarConfiguracionActual()<br/>Actualiza QuotationConfig"]
    L --> M["🟩 RESULTADO:<br/>Todo está vinculado ✅"]
    
    style A fill:#d4e6f1
    style B fill:#e8daef
    style C fill:#fdebd0
    style D fill:#fdebd0
    style F fill:#a9dfbf
    style F2 fill:#a9dfbf
    style G fill:#a9dfbf
    style H fill:#a9dfbf
    style I fill:#a9dfbf
    style J fill:#fdebd0
    style K fill:#fdebd0
    style L fill:#a9dfbf
    style M fill:#90ee90
```

---

## 📊 Cambios de Código Necesarios (Opción 1)

```mermaid
graph LR
    A["📁 page.tsx<br/>Línea 559-565<br/>crearPaqueteSnapshot()"] -->|Añadir| B["quotationConfigId:<br/>cotizacionConfig?.id"]
    
    C["📁 snapshotApi.ts<br/>convertSnapshotToDB()"] -->|Mapear| D["quotationConfigId"]
    
    E["📁 /api/snapshots<br/>route.ts POST"] -->|Recibir y guardar| F["quotationConfigId<br/>en la BD"]
    
    B --> X["✅ Paquete vinculado"]
    D --> X
    F --> X
    
    style A fill:#fff4e6
    style B fill:#a9dfbf
    style C fill:#fff4e6
    style D fill:#a9dfbf
    style E fill:#fff4e6
    style F fill:#a9dfbf
    style X fill:#90ee90
```

---

## 🔄 Flujo Completo Paso a Paso (Solución)

```mermaid
sequenceDiagram
    participant Usuario
    participant Frontend as Frontend<br/>page.tsx
    participant API as API<br/>Snapshots
    participant BD as Base de Datos

    Usuario->>Frontend: 1️⃣ Click "Crear Paquete"
    Frontend->>Frontend: 2️⃣ Obtiene cotizacionConfig.id
    Frontend->>Frontend: 3️⃣ Crea PackageSnapshot CON quotationConfigId
    Frontend->>API: 4️⃣ POST /api/snapshots<br/>(CON quotationConfigId)
    API->>BD: 5️⃣ Guarda PackageSnapshot<br/>quotationConfigId = "ckxyz123" ✅
    BD->>API: 6️⃣ Confirma guardado
    API->>Frontend: 7️⃣ Retorna snapshot guardado
    Frontend->>Usuario: 8️⃣ ✅ "Paquete creado y vinculado"
    
    Usuario->>Frontend: 9️⃣ Click "Guardar Cotización"
    Frontend->>API: 🔟 PUT /api/quotation-config/[id]
    API->>BD: 1️⃣1️⃣ Actualiza QuotationConfig
    BD->>API: 1️⃣2️⃣ Confirmado
    API->>Frontend: 1️⃣3️⃣ Retorna config actualizada
    Frontend->>Usuario: 1️⃣4️⃣ ✅ "Cotización guardada con todos sus paquetes"
```

---

## 📋 Checklist de Implementación

- [ ] **Paso 1:** Modificar `crearPaqueteSnapshot()` en page.tsx
  - [ ] Obtener `cotizacionConfig?.id`
  - [ ] Incluir `quotationConfigId` en el snapshot
  
- [ ] **Paso 2:** Actualizar `convertSnapshotToDB()` en snapshotApi.ts
  - [ ] Mapear `quotationConfigId` del snapshot
  
- [ ] **Paso 3:** Modificar `/api/snapshots` POST
  - [ ] Recibir `quotationConfigId` en datos
  - [ ] Guardar `quotationConfigId` en la BD
  
- [ ] **Paso 4:** Pruebas
  - [ ] Crear paquete y verificar BD
  - [ ] Guardar cotización
  - [ ] Recargar página y verificar que los paquetes aparecen

---

## 🎯 Ventajas de Esta Solución

✅ **Paquetes se guardan inmediatamente** - No se pierden datos  
✅ **UX responsivo** - Retroalimentación inmediata al usuario  
✅ **Simple de implementar** - Solo 3 cambios de código  
✅ **Comportamiento lógico** - Los paquetes se vinculan a la cotización que se está editando  
✅ **Menos riesgo** - No requiere refactor mayor del flujo  
