// EJEMPLO DE USO EN administrador/page.tsx

// ==================== IMPORTS ====================
import { ModalProgresoGuardado, ModalLoginAdmin } from '@/features/admin/components'

// ==================== DENTRO DEL COMPONENTE ====================

// Estado para login
const [showLoginModal, setShowLoginModal] = useState(false)

// Estado para progreso de guardado
const [showProgresoGuardado, setShowProgresoGuardado] = useState(false)
const [pasosGuardado, setPasosGuardado] = useState([
  { id: '1', label: 'Validando datos', estado: 'completado' as const },
  { id: '2', label: 'Guardando en base de datos', estado: 'activo' as const },
  { id: '3', label: 'Sincronizando cambios', estado: 'pendiente' as const },
])
const [resultadoGuardado, setResultadoGuardado] = useState<'progresando' | 'exito' | 'cancelado' | 'error'>('progresando')
const [totalProgresoGuardado, setTotalProgresoGuardado] = useState(33)

// ==================== HANDLERS ====================

const handleLoginSuccess = async (credentials: { email: string; password: string }) => {
  try {
    console.log('Login con:', credentials)
    // Aquí iría la lógica de autenticación
    setShowLoginModal(false)
  } catch (error) {
    console.error('Error de login:', error)
  }
}

const handleGuardar = async () => {
  setShowProgresoGuardado(true)
  setResultadoGuardado('progresando')
  setTotalProgresoGuardado(0)
  
  // Simular guardado con pasos
  try {
    // Paso 1: Validar
    setPasosGuardado(prev => prev.map((p, i) => 
      i === 0 ? { ...p, estado: 'activo' as const } : p
    ))
    await new Promise(resolve => setTimeout(resolve, 500))
    setTotalProgresoGuardado(20)
    
    // Paso 2: Guardar en BD
    setPasosGuardado(prev => prev.map((p, i) => 
      i === 0 ? { ...p, estado: 'completado' as const } :
      i === 1 ? { ...p, estado: 'activo' as const } :
      p
    ))
    await new Promise(resolve => setTimeout(resolve, 1000))
    setTotalProgresoGuardado(60)
    
    // Paso 3: Sincronizar
    setPasosGuardado(prev => prev.map((p, i) => 
      i === 1 ? { ...p, estado: 'completado' as const } :
      i === 2 ? { ...p, estado: 'activo' as const } :
      p
    ))
    await new Promise(resolve => setTimeout(resolve, 800))
    setTotalProgresoGuardado(100)
    
    // Completado
    setPasosGuardado(prev => prev.map(p => ({ ...p, estado: 'completado' as const })))
    setResultadoGuardado('exito')
    
  } catch (error) {
    setResultadoGuardado('error')
    setPasosGuardado(prev => prev.map((p, i) => 
      i === 2 ? { ...p, estado: 'error' as const } : p
    ))
  }
}

// ==================== RENDER ====================

return (
  <>
    {/* ... resto del código ... */}

    {/* Modal de Login */}
    <ModalLoginAdmin
      isOpen={showLoginModal}
      onClose={() => setShowLoginModal(false)}
      onSuccess={handleLoginSuccess}
    />

    {/* Modal de Progreso de Guardado */}
    <ModalProgresoGuardado
      isOpen={showProgresoGuardado}
      onClose={() => setShowProgresoGuardado(false)}
      pasos={pasosGuardado}
      resultado={resultadoGuardado}
      totalProgreso={totalProgresoGuardado}
    />
  </>
)
