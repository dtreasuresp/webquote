'use client'

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

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
        <Search className="absolute left-4 top-2.5 text-gh-text-muted group-hover:text-gh-text transition-colors" />
        <input
          type="text"
          placeholder="Buscar por nombre del paquete..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-2.5 bg-gh-bg rounded border border-gh-border text-gh-text placeholder-gh-text-muted focus:outline-none focus:border-gh-success focus:ring-1 focus:ring-gh-success transition-all"
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
                ? 'bg-gh-success text-white border-gh-success font-bold'
                : 'bg-gh-bg-secondary border-gh-border text-gh-text-muted hover:bg-gh-border hover:border-gh-success'
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





