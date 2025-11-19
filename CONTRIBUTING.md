# Guía de Contribución - WebQuote

¡Gracias por tu interés en contribuir a WebQuote! Este documento describe cómo puedes participar en el desarrollo del proyecto.

## 🚀 Empezando

### Requisitos Previos

- Node.js 18.x o superior
- npm 9.x o superior
- Git configurado localmente
- Cuenta en GitHub

### Instalación del Entorno

1. **Fork del repositorio**
   ```bash
   # Ve a https://github.com/dtreasuresp/webquote y haz fork
   ```

2. **Clonar tu fork**
   ```bash
   git clone https://github.com/[tu-usuario]/webquote.git
   cd webquote
   ```

3. **Añadir upstream remoto**
   ```bash
   git remote add upstream https://github.com/dtreasuresp/webquote.git
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   ```

5. **Configurar variables de entorno**
   ```bash
   cp .env .env.local
   # Edita .env.local con tus credenciales de Neon
   ```

6. **Iniciar desarrollo**
   ```bash
   npm run dev
   ```

## 🌿 Proceso de Contribución

### 1. Crear una rama

```bash
git checkout -b feature/descripcion-clara
# o
git checkout -b fix/descripcion-del-bug
```

**Convenciones de nombres:**
- `feature/` - Para nuevas características
- `fix/` - Para correcciones de bugs
- `docs/` - Para documentación
- `refactor/` - Para refactorización de código
- `test/` - Para pruebas

### 2. Realizar cambios

- Mantén los commits pequeños y enfocados
- Usa mensajes de commit claros y descriptivos
- Sigue las convenciones de código del proyecto

### 3. Sincronizar con upstream

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Enviar cambios

```bash
git push origin feature/descripcion-clara
```

### 5. Crear Pull Request

1. Ve a https://github.com/dtreasuresp/webquote
2. Haz clic en "New Pull Request"
3. Selecciona tu rama
4. Completa la descripción:
   - ¿Qué cambios realizaste?
   - ¿Por qué son necesarios?
   - ¿Hay breaking changes?
   - Referencia cualquier issue relacionado (#123)

## 📝 Estándares de Código

### TypeScript/React

- Usa TypeScript estrictamente (no `any`)
- Componentes funcionales con hooks
- Props bien tipadas
- Nombres descriptivos para variables y funciones

**Ejemplo:**
```typescript
interface PackageProps {
  title: string;
  price: number;
  features: string[];
  onSelect: (id: string) => void;
}

export function Package({ title, price, features, onSelect }: PackageProps) {
  return (
    // Implementación
  );
}
```

### Estilos

- Usa Tailwind CSS para estilos
- Evita CSS-in-JS innecesario
- Mantén la consistencia visual con el tema corporativo

### Commits

```bash
# Malo
git commit -m "cambios"

# Bueno
git commit -m "feat: agregar validación de presupuesto en Modal"
git commit -m "fix: corregir cálculo de descuentos en componente TabsModal"
git commit -m "docs: actualizar guía de instalación"
```

## 🧪 Testing

Antes de hacer commit:

```bash
# Verificar tipos de TypeScript
npm run lint

# Compilar el proyecto
npm run build

# Ejecutar en desarrollo
npm run dev
```

## 🐛 Reportar Bugs

Si encuentras un bug:

1. **Verifica que no esté reportado** en https://github.com/dtreasuresp/webquote/issues
2. **Crea un nuevo issue** con:
   - Título descriptivo
   - Descripción detallada del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si es relevante
   - Tu entorno (OS, Node version, etc.)

## 💡 Sugerir Características

Para sugerir una nueva característica:

1. **Verifica que no esté propuesta** en GitHub Discussions o Issues
2. **Abre una Discusión** en https://github.com/dtreasuresp/webquote/discussions
3. **Describe tu idea:**
   - Caso de uso
   - Beneficios
   - Alternativas consideradas
   - Ejemplos

## 📚 Documentación

Si modificas funcionalidad importante:

- Actualiza el README.md
- Comenta código complejo
- Actualiza tipos TypeScript
- Documenta cambios en la BD

## ✅ Checklist Antes de hacer PR

- [ ] Mi código sigue los estándares del proyecto
- [ ] He actualizado la documentación relevante
- [ ] He realizado pruebas locales
- [ ] He sincronizado con `upstream/main`
- [ ] Mis commits tienen mensajes claros
- [ ] No hay conflictos con la rama main
- [ ] No he agregado dependencias sin necesidad

## 🤝 Código de Conducta

Por favor sé respetuoso y constructivo. Todos estamos aquí para mejorar el proyecto juntos.

## 📞 Ayuda

¿Preguntas? 
- Abre una Discusión en GitHub
- Revisa los Issues existentes
- Lee el README.md

## 📄 Licencia

Al contribuir, aceptas que tus cambios se licencien bajo CC0 1.0 Universal (mismo que el proyecto).

---

¡Gracias por contribuir a WebQuote! 🎉
