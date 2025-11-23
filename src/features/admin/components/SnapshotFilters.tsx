'use client'

import { motion } from 'framer-motion'
import { FaSearch } from 'react-icons/fa'

type FilterType = 'all' | '7days' | '30days'

interface SnapshotFiltersProps {
  readonly onSearchChange: (value: string) => void
  readonly onFilterChange: (filter: FilterType) => void
  readonly searchValue: string
  readonly filterValue: FilterType
}

export default function SnapshotFilters({
  onSearchChange,
  onFilterChange,
  searchValue,
  filterValue
}: SnapshotFiltersProps) {
  const filters = [
    { id: 'all', label: 'Todos', icon: '∞' },
    { id: '7days', label: 'Últimos 7 días', icon: '📅' },
    { id: '30days', label: 'Últimos 30 días', icon: '📆' }
  ]

  return (
    <div className="space-y-3 mb-6">
      {/* Barra de búsqueda */}
      <div className="relative group">
        <FaSearch className="absolute left-4 top-2.5 text-[#888888] group-hover:text-[#ededed] transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nombre del paquete..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-black rounded border border-[#333] text-[#ededed] placeholder-[#666] focus:outline-none focus:border-[#666] focus:ring-1 focus:ring-[#666] transition-all"
        />
      </div>

      {/* Filtros por fecha */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(filter.id as FilterType)}
            className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center gap-2 border ${
              filterValue === filter.id
                ? 'bg-[#ededed] text-black border-[#ededed] font-bold'
                : 'bg-[#111] border-[#333] text-[#888888] hover:bg-[#222] hover:border-[#555]'
            }`}
          >
            <span>{filter.icon}</span>
            {filter.label}
          </motion.button>
        ))}
      </div>
    </div>
  )
}



