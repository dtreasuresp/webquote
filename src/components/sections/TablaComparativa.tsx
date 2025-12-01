'use client'

import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { FaTable } from 'react-icons/fa'
import type { TablaComparativaData } from '@/lib/types'

interface TablaComparativaProps {
  readonly data?: TablaComparativaData
}

export default function TablaComparativa({ data }: TablaComparativaProps) {
  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const tablaData = data
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category)
  }

  const handleExpandAll = () => {
    setExpandAll(!expandAll)
    setExpandedCategory(null)
  }

  const isCategoryExpanded = (category: string) => {
    return expandAll || expandedCategory === category
  }

  return (
    <section id="comparativa" className="py-6 md:py-8 px-4 bg-light-bg font-github">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-light-info-bg rounded-full mb-4">
              <FaTable className="text-light-accent" size={20} />
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
              {tablaData.titulo}
            </h2>
            <p className="text-sm text-light-text-secondary">
              {tablaData.subtitulo}
            </p>
          </div>

          {/* Controles de Expansión */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="bg-light-warning/10 border border-light-warning/30 rounded-md px-4 py-2">
              <p className="text-sm text-light-text">
                <span className="font-semibold text-light-warning">💡 Tip:</span> Haz clic en cada categoría para expandir
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExpandAll}
                className={`px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2 transition-colors ${
                  expandAll 
                    ? 'bg-light-text text-white hover:bg-gray-700' 
                    : 'bg-light-accent text-white hover:bg-blue-700'
                }`}
              >
                {expandAll ? (
                  <>
                    <span>▼</span>
                    <span>Colapsar Todo</span>
                  </>
                ) : (
                  <>
                    <span>▶</span>
                    <span>Expandir Todo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-light-bg rounded-md border border-light-border overflow-hidden">
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3 p-4">
              {tablaData.categorias.map((row) => (
                <div key={`mobile-${row.category}`} className="border border-light-border rounded-md overflow-hidden">
                  <button
                    onClick={() => toggleCategory(row.category)}
                    className={`w-full text-left font-medium p-3 flex justify-between items-center transition-colors text-sm ${
                      isCategoryExpanded(row.category)
                        ? 'bg-light-accent text-white'
                        : 'bg-light-bg-secondary text-light-text hover:bg-light-bg-tertiary'
                    }`}
                  >
                    <span>{row.category}</span>
                    <span>{isCategoryExpanded(row.category) ? '▼' : '▶'}</span>
                  </button>
                  {isCategoryExpanded(row.category) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 space-y-3 border-t border-light-border"
                    >
                      {row.items.map((item) => (
                        <div key={`mobile-item-${item.name.replaceAll(' ', '-')}`} className="pb-3 border-b border-light-border last:border-0">
                          <p className="font-medium text-light-text text-sm mb-2">{item.name}</p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <p className="text-light-text-secondary mb-1">{tablaData.paquetes.basic.name.replace(/🥉\s?/, '')}</p>
                              <p className="text-light-accent font-medium">{formatValue(item.basic)}</p>
                            </div>
                            <div className="text-center border-x border-light-border px-2">
                              <p className="text-light-text-secondary mb-1">{tablaData.paquetes.professional.name.replace(/🥈\s?/, '')}</p>
                              <p className="text-light-accent font-medium">{formatValue(item.professional)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-light-text-secondary mb-1">{tablaData.paquetes.enterprise.name.replace(/🥇\s?/, '')}</p>
                              <p className="text-light-accent font-medium">{formatValue(item.enterprise)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-light-bg-tertiary border-b border-light-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-light-text">Característica</th>
                    <th className="text-center p-4 font-semibold text-light-text">
                      {tablaData.paquetes.basic.name}<br />
                      <span className="text-sm font-normal text-light-text-secondary">{tablaData.paquetes.basic.price}</span>
                    </th>
                    <th className="text-center p-4 font-semibold text-light-text bg-light-accent/5">
                      {tablaData.paquetes.professional.name} {tablaData.paquetes.professional.popular && '⭐'}<br />
                      <span className="text-sm font-normal text-light-text-secondary">{tablaData.paquetes.professional.price}</span>
                    </th>
                    <th className="text-center p-4 font-semibold text-light-text">
                      {tablaData.paquetes.enterprise.name}<br />
                      <span className="text-sm font-normal text-light-text-secondary">{tablaData.paquetes.enterprise.price}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tablaData.categorias.map((category, catIdx) => (
                    <React.Fragment key={`desktop-cat-${category.category}`}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIdx * 0.03 }}
                        className="border-b border-light-border"
                      >
                        <td colSpan={4} className="p-0">
                          <button
                            onClick={() => toggleCategory(category.category)}
                            className={`w-full text-left p-4 font-medium flex justify-between items-center transition-colors ${
                              isCategoryExpanded(category.category)
                                ? 'bg-light-accent text-white'
                                : 'bg-light-bg-secondary text-light-text hover:bg-light-bg-tertiary'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              {category.category}
                              {isCategoryExpanded(category.category) && (
                                <span className="text-xs font-normal opacity-80">(Click para colapsar)</span>
                              )}
                            </span>
                            <span className="text-xl">
                              {isCategoryExpanded(category.category) ? '▼' : '▶'}
                            </span>
                          </button>
                        </td>
                      </motion.tr>

                      {isCategoryExpanded(category.category) && (
                        <>
                          {category.items.map((item, itemIdx) => (
                            <motion.tr
                              key={`desktop-item-${item.name.replaceAll(' ', '-')}`}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ delay: itemIdx * 0.03 }}
                              className="border-b border-light-border hover:bg-light-bg-secondary/50"
                            >
                              <td className="p-4 font-medium text-light-text text-sm">{item.name}</td>
                              <td className="p-4 text-center text-light-text-secondary text-sm">{formatValue(item.basic)}</td>
                              <td className="p-4 text-center text-light-text-secondary text-sm bg-light-accent/5">{formatValue(item.professional)}</td>
                              <td className="p-4 text-center text-light-text-secondary text-sm">{formatValue(item.enterprise)}</td>
                            </motion.tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nota importante */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="mt-6 bg-light-accent/5 border-l-2 border-light-accent p-4 rounded-md"
          >
            <p className="text-light-text text-sm">
              <strong>📌 Nota:</strong> {tablaData.notaPie}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Función para formatear valores (convierte boolean a check/cross)
function formatValue(value: boolean | string): string {
  if (typeof value === 'boolean') {
    return value ? '✓ Incluido' : '✗'
  }
  return value
}
