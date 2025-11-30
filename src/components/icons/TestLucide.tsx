/**
 * Componente de prueba para verificar instalación de lucide-react
 * Renderiza múltiples iconos de Lucide para confirmar funcionamiento
 */

import { CheckCircle, AlertCircle, XCircle, Info, Zap } from 'lucide-react'

export function TestLucide() {
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <CheckCircle className="w-6 h-6 text-green-600" />
      <AlertCircle className="w-6 h-6 text-yellow-600" />
      <XCircle className="w-6 h-6 text-red-600" />
      <Info className="w-6 h-6 text-blue-600" />
      <Zap className="w-6 h-6 text-purple-600" />
      <span className="text-sm text-gray-700 font-medium">
        ✓ lucide-react instalado correctamente
      </span>
    </div>
  )
}

export default TestLucide
