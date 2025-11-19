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
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-accent transition-colors duration-300" />
        <input
          type="text"
          placeholder="Buscar por nombre del paquete..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-white placeholder-neutral-400 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {/* Filtros por fecha */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(filter.id as FilterType)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              filterValue === filter.id
                ? 'bg-accent/20 border border-accent/50 text-accent'
                : 'bg-white/8 border border-white/15 text-white hover:bg-white/12 hover:border-white/25'
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
