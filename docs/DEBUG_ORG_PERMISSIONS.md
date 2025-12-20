/**
 * Script para verificar permisos de organizaciones del usuario actual
 * Uso: Ejecutar en la consola del navegador cuando estés logueado
 */

async function checkOrgPermissions() {
  console.log('🔍 Verificando permisos de organizaciones...')
  
  try {
    const response = await fetch('/api/debug/org-permissions')
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Error:', data)
      return
    }
    
    console.table({
      'Usuario': data.username,
      'Email': data.email,
      'Rol': data.role.name,
      'Ver (org.view)': data.hasOrgView ? '✅' : '❌',
      'Crear (org.create)': data.hasOrgCreate ? '✅' : '❌',
      'Editar (org.update)': data.hasOrgUpdate ? '✅' : '❌',
      'Eliminar (org.delete)': data.hasOrgDelete ? '✅' : '❌'
    })
    
    console.log('📋 Todos los permisos:', data.allPermissions)
    console.log('🏢 Permisos de organizaciones:', data.orgPermissions)
    
    return data
  } catch (error) {
    console.error('❌ Error al verificar permisos:', error)
  }
}

// Ejecutar automáticamente
checkOrgPermissions()
