# Despliegue en Netlify - Guía Rápida

## Opción 1: Desplegar desde GitHub (Recomendado)

1. **Ve a [Netlify](https://app.netlify.com)**
2. **Click en "New site from Git"**
3. **Selecciona "GitHub"** como proveedor
4. **Busca y selecciona**: `Urbanísima_Constructora`
5. **Configuración de build:**
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: `proposal-web`
6. **Click en "Deploy"**

## Opción 2: Desplegar via CLI (Manual)

```bash
# 1. Instalar Netlify CLI
npm install -g netlify-cli

# 2. Iniciar sesión
netlify login

# 3. Desplegar
cd proposal-web
netlify deploy --prod --dir=.next
```

## Información del Sitio

- **Repositorio**: https://github.com/dtreasuresp/Urbanísima_Constructora
- **Rama**: main
- **Carpeta del proyecto**: proposal-web/
- **Build command**: npm run build
- **Publish directory**: .next

## Variables de Entorno (si es necesario)

Si necesitas agregar variables:
1. Ve a Site settings → Environment
2. Agrega las variables necesarias
3. Redeploy

## Dominio Personalizado

1. Ve a Site settings → Domain management
2. Click en "Add custom domain"
3. Ingresa tu dominio
4. Sigue las instrucciones para configurar DNS

## Status de Despliegue

Puedes ver el status en:
https://app.netlify.com/sites/

---

**¿Necesitas ayuda con la configuración?** El proyecto ya está optimizado para Netlify.
