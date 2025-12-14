# Propuesta: Estructura Organizacional Jerárquica

**Fecha**: 14 de diciembre de 2025  
**Estado**: ⏸️ **PROPUESTA - NO INICIADA**
**Prioridad**: BAJA (post Fases 1-7 de permisos granulares)
**Impacto**: Requerida para escalabilidad a múltiples equipos/departamentos
**Estimado**: 8-10 horas (3-4 sprints después de permisos granulares)

## 🟡 ESTADO ACTUAL (14/12/2025)

### ✅ Completado
- ✅ Propuesta documentada y revisada
- ✅ Modelos Prisma definidos

### ⏭️ Pendiente
- ⏳ Crear migración de Prisma (agregar 4 nuevos modelos)
- ⏳ Crear APIs de gestión organizacional
- ⏳ Crear componentes UI (OrganizationTree, Selectors, OrgChart)
- ⏳ Integración con UserManagementPanel
- ⏳ Testing e2e de estructura jerárquica

### 🛑 Bloqueadores
- **NINGUNO**: Esta propuesta es ortogonal a permisos granulares
- **Fase 0 completada:** ✅ Sistema de paginación/filtros implementado (v1.2.0)
- **Recomendación**: Implementar DESPUÉS de completar Fases 1-7 de PROPUESTA_SISTEMA_PERMISOS_GRANULAR.md (ahora sin bloqueadores)  

## 📋 Resumen

Implementar una estructura organizacional jerárquica de 4 niveles para organizar usuarios y gestionar permisos de forma más granular y escalable.

## 🎯 Objetivo

Permitir que las organizaciones puedan:
- Estructurar sus usuarios en jerarquías multinivel
- Asignar permisos y accesos por nivel organizacional
- Gestionar cotizaciones y recursos por departamento/grupo
- Facilitar auditoría y reportes por unidad organizacional

## 🏗️ Estructura Propuesta

```
Entidad Matriz (Corporation)
    └── Entidad (Entity/Company)
        └── Departamento (Department)
            └── Grupo (Team/Group)
                └── Usuario (User)
```

### Niveles Jerárquicos

#### 1. **Entidad Matriz** (Corporation)
- **Propósito**: Nivel corporativo más alto (holding, corporación multinacional)
- **Alcance**: Múltiples empresas/entidades
- **Ejemplos**: "Grupo Empresarial ABC", "Corporación XYZ"
- **Permisos**: Acceso total a todas las entidades hijas

#### 2. **Entidad** (Entity/Company)
- **Propósito**: Empresa u organización individual
- **Alcance**: Múltiples departamentos
- **Ejemplos**: "Empresa Norte", "Empresa Sur", "Filial Colombia"
- **Permisos**: Acceso a todos los departamentos de la entidad

#### 3. **Departamento** (Department)
- **Propósito**: División funcional de la empresa
- **Alcance**: Múltiples grupos/equipos
- **Ejemplos**: "Ventas", "IT", "Marketing", "Finanzas"
- **Permisos**: Acceso a todos los grupos del departamento

#### 4. **Grupo** (Team/Group)
- **Propósito**: Equipo de trabajo específico
- **Alcance**: Usuarios individuales
- **Ejemplos**: "Equipo Ventas Norte", "DevOps Team", "Social Media"
- **Permisos**: Acceso limitado a recursos del grupo

## 🗄️ Modelo de Datos

### Nuevos Modelos Prisma

```prisma
// ==================== ESTRUCTURA ORGANIZACIONAL ====================

model Corporation {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  logo        String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  entities    Entity[]
  
  @@index([name])
  @@index([isActive])
}

model Entity {
  id             String   @id @default(cuid())
  name           String
  displayName    String
  description    String?
  corporationId  String
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  // Relaciones
  corporation    Corporation @relation(fields: [corporationId], references: [id], onDelete: Cascade)
  departments    Department[]
  
  @@unique([corporationId, name])
  @@index([corporationId])
  @@index([isActive])
}

model Department {
  id          String   @id @default(cuid())
  name        String
  displayName String
  description String?
  entityId    String
  managerId   String?  // Usuario responsable del departamento
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relaciones
  entity      Entity   @relation(fields: [entityId], references: [id], onDelete: Cascade)
  manager     User?    @relation("DepartmentManager", fields: [managerId], references: [id], onDelete: SetNull)
  groups      Group[]
  
  @@unique([entityId, name])
  @@index([entityId])
  @@index([managerId])
  @@index([isActive])
}

model Group {
  id           String   @id @default(cuid())
  name         String
  displayName  String
  description  String?
  departmentId String
  leaderId     String?  // Usuario líder del grupo
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  // Relaciones
  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  leader       User?      @relation("GroupLeader", fields: [leaderId], references: [id], onDelete: SetNull)
  users        User[]     @relation("GroupMembers")
  
  @@unique([departmentId, name])
  @@index([departmentId])
  @@index([leaderId])
  @@index([isActive])
}
```

### Modificaciones al Modelo User

```prisma
model User {
  id                  String                @id @default(cuid())
  username            String                @unique
  email               String?               @unique
  passwordHash        String
  role                UserRole              @default(CLIENT)
  roleId              String?
  roleRef             Role?                 @relation("UserRole", fields: [roleId], references: [id])
  
  // Campos organizacionales
  groupId             String?               // Grupo al que pertenece
  groupRef            Group?                @relation("GroupMembers", fields: [groupId], references: [id])
  
  // Roles de liderazgo
  managedDepartments  Department[]          @relation("DepartmentManager")
  ledGroups           Group[]               @relation("GroupLeader")
  
  nombre              String                @default("")
  empresa             String                @default("")
  telefono            String                @default("")
  quotationAssignedId String?               @unique
  activo              Boolean               @default(true)
  lastLogin           DateTime?
  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt
  createdBy           String?
  avatarUrl           String?
  
  Session             Session[]
  quotationAssigned   QuotationConfig?      @relation(fields: [quotationAssignedId], references: [id])
  UserPermission      UserPermission[]
  UserQuotationAccess UserQuotationAccess[]
  AuditLog            AuditLog[]
  UserBackup          UserBackup[]
  BackupConfig        BackupConfig?

  @@index([groupId])
  @@index([activo])
  @@index([email])
  @@index([quotationAssignedId])
  @@index([role])
  @@index([roleId])
  @@index([username])
}
```

## 🔐 Permisos y Accesos

### Nuevos Permisos

```typescript
// Permisos de gestión organizacional
const ORGANIZATIONAL_PERMISSIONS = [
  // Corporación
  'org.corporation.view',
  'org.corporation.create',
  'org.corporation.update',
  'org.corporation.delete',
  
  // Entidad
  'org.entity.view',
  'org.entity.create',
  'org.entity.update',
  'org.entity.delete',
  
  // Departamento
  'org.department.view',
  'org.department.create',
  'org.department.update',
  'org.department.delete',
  
  // Grupo
  'org.group.view',
  'org.group.create',
  'org.group.update',
  'org.group.delete',
  
  // Asignación de usuarios
  'org.user.assign',
  'org.user.transfer',
]
```

### Reglas de Acceso

1. **Herencia de Permisos**:
   - Los managers de departamento tienen acceso a todos los grupos del departamento
   - Los líderes de grupo tienen acceso a todos los usuarios del grupo
   - SUPER_ADMIN tiene acceso a toda la estructura

2. **Visibilidad de Datos**:
   - Usuarios ven solo recursos de su grupo
   - Líderes ven recursos de su grupo y subgrupos
   - Managers ven recursos de su departamento
   - Admins de entidad ven toda la entidad
   - SUPER_ADMIN ve toda la corporación

## 🚀 Casos de Uso

### Caso 1: Empresa con Múltiples Sedes
```
Corporación: "TechCorp Internacional"
├── Entidad: "TechCorp Colombia"
│   ├── Departamento: "Ventas"
│   │   ├── Grupo: "Ventas Bogotá"
│   │   └── Grupo: "Ventas Medellín"
│   └── Departamento: "Desarrollo"
│       ├── Grupo: "Frontend Team"
│       └── Grupo: "Backend Team"
└── Entidad: "TechCorp México"
    └── Departamento: "Ventas"
        └── Grupo: "Ventas CDMX"
```

### Caso 2: Agencia con Múltiples Clientes
```
Corporación: "Digital Agency"
├── Entidad: "Cliente A"
│   └── Departamento: "Proyecto X"
│       ├── Grupo: "Diseño"
│       └── Grupo: "Desarrollo"
└── Entidad: "Cliente B"
    └── Departamento: "Proyecto Y"
        └── Grupo: "Marketing"
```

## 📊 APIs Propuestas

### Endpoints para Gestión Organizacional

```typescript
// Corporaciones
GET    /api/organizations/corporations
POST   /api/organizations/corporations
GET    /api/organizations/corporations/[id]
PUT    /api/organizations/corporations/[id]
DELETE /api/organizations/corporations/[id]

// Entidades
GET    /api/organizations/entities
POST   /api/organizations/entities
GET    /api/organizations/entities/[id]
PUT    /api/organizations/entities/[id]
DELETE /api/organizations/entities/[id]

// Departamentos
GET    /api/organizations/departments
POST   /api/organizations/departments
GET    /api/organizations/departments/[id]
PUT    /api/organizations/departments/[id]
DELETE /api/organizations/departments/[id]

// Grupos
GET    /api/organizations/groups
POST   /api/organizations/groups
GET    /api/organizations/groups/[id]
PUT    /api/organizations/groups/[id]
DELETE /api/organizations/groups/[id]

// Asignación de usuarios
POST   /api/organizations/users/[userId]/assign
POST   /api/organizations/users/[userId]/transfer
GET    /api/organizations/users/[userId]/path // Obtener ruta jerárquica
```

## 🎨 Interfaz de Usuario

### Componentes Nuevos

1. **OrganizationTree**: Árbol visual de la estructura
2. **DepartmentSelector**: Selector de departamento con autocompletado
3. **GroupSelector**: Selector de grupo filtrado por departamento
4. **OrgChart**: Organigrama visual (opcional, con librería como d3.js)
5. **UserOrgCard**: Card de usuario con badge de grupo/departamento

### Vistas Nuevas

1. **Panel de Estructura Organizacional**: Admin view para gestionar la jerarquía
2. **Selector de Organización**: Al crear usuario, asignar a grupo/departamento
3. **Visor de Organigrama**: Visualización interactiva de la estructura

## 🔄 Migración

### Paso 1: Crear Estructura por Defecto

```typescript
// Script de migración
async function createDefaultOrganization() {
  // Crear corporación por defecto
  const corporation = await prisma.corporation.create({
    data: {
      name: 'default-corp',
      displayName: 'Organización Principal',
      description: 'Estructura organizacional por defecto',
    }
  })
  
  // Crear entidad por defecto
  const entity = await prisma.entity.create({
    data: {
      name: 'default-entity',
      displayName: 'Entidad Principal',
      corporationId: corporation.id,
    }
  })
  
  // Crear departamento por defecto
  const department = await prisma.department.create({
    data: {
      name: 'general',
      displayName: 'General',
      entityId: entity.id,
    }
  })
  
  // Crear grupo por defecto
  const group = await prisma.group.create({
    data: {
      name: 'default-group',
      displayName: 'Grupo General',
      departmentId: department.id,
    }
  })
  
  // Asignar todos los usuarios existentes al grupo por defecto
  await prisma.user.updateMany({
    where: { groupId: null },
    data: { groupId: group.id }
  })
}
```

### Paso 2: Migración de Datos Existentes

- Usuarios existentes → Grupo "General" en Departamento "General"
- Se puede mantener compatibilidad con sistema actual
- Implementación gradual sin romper funcionalidad existente

## ✅ Ventajas

1. **Escalabilidad**: Soporta organizaciones de cualquier tamaño
2. **Flexibilidad**: Estructura adaptable a diferentes modelos de negocio
3. **Granularidad**: Permisos y accesos más específicos
4. **Auditoría**: Trazabilidad por nivel organizacional
5. **Multi-tenant**: Soporte natural para múltiples clientes/empresas
6. **Reportes**: Análisis por cualquier nivel de la jerarquía

## ⚠️ Consideraciones

1. **Complejidad**: Mayor complejidad en queries y lógica de permisos
2. **Performance**: Requiere índices adecuados y queries optimizadas
3. **UX**: Interface debe ser intuitiva para no confundir usuarios
4. **Migración**: Requiere script de migración cuidadoso
5. **Compatibilidad**: Mantener retrocompatibilidad con sistema actual

## 📈 Implementación Gradual

### Fase 1: Modelos y Migraciones (Sprint 1)
- [ ] Crear modelos Prisma
- [ ] Generar migraciones
- [ ] Script de estructura por defecto
- [ ] Migrar usuarios existentes

### Fase 2: APIs Base (Sprint 2)
- [ ] CRUD Corporaciones
- [ ] CRUD Entidades
- [ ] CRUD Departamentos
- [ ] CRUD Grupos
- [ ] Asignación de usuarios

### Fase 3: UI Básica (Sprint 3)
- [ ] Panel de gestión organizacional
- [ ] Selectores de departamento/grupo
- [ ] Modificar formulario de usuarios
- [ ] Badges organizacionales

### Fase 4: Permisos y Auditoría (Sprint 4)
- [ ] Implementar permisos organizacionales
- [ ] Filtros de acceso por nivel
- [ ] Logs de auditoría con contexto organizacional
- [ ] Reportes por departamento/grupo

### Fase 5: Avanzado (Sprint 5+)
- [ ] Visor de organigrama
- [ ] Transferencias entre grupos
- [ ] Reportes analíticos
- [ ] Dashboard por nivel organizacional

## 🔍 Alternativas Consideradas

### Opción 1: Solo 2 niveles (Departamento + Grupo)
- ✅ Más simple
- ❌ Menos flexible para grandes organizaciones

### Opción 2: 5 niveles (agregar Subdepartamento)
- ✅ Aún más granular
- ❌ Demasiado complejo para mayoría de casos

### Opción 3: Árbol flexible (sin niveles fijos)
- ✅ Máxima flexibilidad
- ❌ Complejidad en queries y UI

## 📝 Conclusión

La estructura de 4 niveles (Corporación → Entidad → Departamento → Grupo) ofrece el mejor balance entre flexibilidad, usabilidad y escalabilidad. Permite organizar desde pequeñas empresas hasta corporaciones multinacionales sin agregar complejidad innecesaria.

La implementación gradual asegura que el sistema actual siga funcionando mientras se construye la nueva estructura, minimizando riesgos y permitiendo validación en cada fase.

## 📚 Referencias

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Multi-tenancy Patterns](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [Organizational Charts Best Practices](https://www.lucidchart.com/pages/organizational-chart)
