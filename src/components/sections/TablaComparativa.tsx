'use client'

import { motion } from 'framer-motion'
import React, { useState } from 'react'
import { FaTable } from 'react-icons/fa'
import type { TablaComparativaData } from '@/lib/types'
import { FluentSection, FluentGlass, FluentReveal } from '@/components/motion'
import { 
  fluentSlideUp,
  fluentStaggerItem
} from '@/lib/animations/variants'
import { viewport, spring } from '@/lib/animations/config'

interface TablaComparativaProps {
  readonly data?: TablaComparativaData
}

export default function TablaComparativa({ data }: TablaComparativaProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)

  // Si no hay datos, no renderizar la sección
  if (!data) return null
  
  const tablaData = data

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
    <FluentSection 
      id="comparativa" 
      animation="fade"
      paddingY="md"
      className="bg-gradient-to-b from-light-bg to-white"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <motion.div 
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-light-accent to-blue-600 rounded-2xl mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={spring.fluent}
          >
            <FaTable className="text-white" size={24} />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-semibold text-light-text mb-2">
            {tablaData.titulo}
          </h2>
          <p className="text-sm text-light-text-secondary max-w-2xl mx-auto">
            {tablaData.subtitulo}
          </p>
        </motion.div>

        {/* Controles de Expansión */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6"
          variants={fluentSlideUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewport.default}
        >
          <div className="bg-gradient-to-r from-light-warning/10 to-amber-500/10 border border-light-warning/30 rounded-xl px-5 py-3 backdrop-blur-sm">
            <p className="text-sm text-light-text">
              <span className="font-semibold text-light-warning">💡 Tip:</span> Haz clic en cada categoría para expandir
            </p>
          </div>
          <motion.button
            onClick={handleExpandAll}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all shadow-md ${
              expandAll 
                ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white' 
                : 'bg-gradient-to-r from-light-accent to-blue-600 text-white'
            }`}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.95 }}
            transition={spring.fluent}
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
          </motion.button>
        </motion.div>

        <FluentReveal>
          <FluentGlass
            variant="normal"
            className="rounded-2xl overflow-hidden"
          >
            {/* Mobile View - Cards */}
            <div className="md:hidden space-y-3 p-4">
            {tablaData.categorias.map((row, catIdx) => (
              <motion.div 
                key={`mobile-${row.category}`} 
                className="border border-light-border/50 rounded-xl overflow-hidden shadow-sm"
                variants={fluentStaggerItem}
                initial="hidden"
                whileInView="visible"
                viewport={viewport.default}
                transition={{ delay: catIdx * 0.05 }}
              >
                <button
                  onClick={() => toggleCategory(row.category)}
                  className={`w-full text-left font-medium p-4 flex justify-between items-center transition-all text-sm ${
                    isCategoryExpanded(row.category)
                      ? 'bg-gradient-to-r from-light-accent to-blue-600 text-white'
                      : 'bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary text-light-text hover:from-light-bg-tertiary hover:to-light-bg-secondary'
                  }`}
                >
                  <span>{row.category}</span>
                  <motion.span
                    animate={{ rotate: isCategoryExpanded(row.category) ? 180 : 0 }}
                    transition={spring.fluent}
                  >
                    ▼
                  </motion.span>
                </button>
                {isCategoryExpanded(row.category) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="p-4 space-y-3 border-t border-light-border/50 bg-white/50"
                  >
                    {row.items.map((item, itemIdx) => (
                      <motion.div 
                        key={`mobile-item-${item.name.replaceAll(' ', '-')}`} 
                        className="pb-3 border-b border-light-border/30 last:border-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: itemIdx * 0.03 }}
                      >
                        <p className="font-medium text-light-text text-sm mb-2">{item.name}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 rounded-lg bg-light-bg-secondary/50">
                            <p className="text-light-text-secondary mb-1">{tablaData.paquetes.basic.name.replace(/🥉\s?/, '')}</p>
                            <p className="text-light-accent font-medium">{formatValue(item.basic)}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-light-accent/5 border border-light-accent/20">
                            <p className="text-light-text-secondary mb-1">{tablaData.paquetes.professional.name.replace(/🥈\s?/, '')}</p>
                            <p className="text-light-accent font-medium">{formatValue(item.professional)}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-light-bg-secondary/50">
                            <p className="text-light-text-secondary mb-1">{tablaData.paquetes.enterprise.name.replace(/🥇\s?/, '')}</p>
                            <p className="text-light-accent font-medium">{formatValue(item.enterprise)}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-light-bg-secondary to-light-bg-tertiary border-b border-light-border/50">
                <tr>
                  <th className="text-left p-5 font-semibold text-light-text">Característica</th>
                  <th className="text-center p-5 font-semibold text-light-text">
                    {tablaData.paquetes.basic.name}<br />
                    <span className="text-sm font-normal text-light-text-secondary">{tablaData.paquetes.basic.price}</span>
                  </th>
                  <th className="text-center p-5 font-semibold text-light-text bg-gradient-to-b from-light-accent/10 to-blue-500/5">
                    {tablaData.paquetes.professional.name} {tablaData.paquetes.professional.popular && '⭐'}<br />
                    <span className="text-sm font-normal text-light-text-secondary">{tablaData.paquetes.professional.price}</span>
                  </th>
                  <th className="text-center p-5 font-semibold text-light-text">
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
                      className="border-b border-light-border/50"
                    >
                      <td colSpan={4} className="p-0">
                        <motion.button
                          onClick={() => toggleCategory(category.category)}
                          className={`w-full text-left p-5 font-medium flex justify-between items-center transition-all ${
                            isCategoryExpanded(category.category)
                              ? 'bg-gradient-to-r from-light-accent to-blue-600 text-white shadow-md'
                              : 'bg-gradient-to-r from-light-bg-secondary to-white text-light-text hover:from-light-bg-tertiary hover:to-light-bg-secondary'
                          }`}
                          whileHover={{ x: isCategoryExpanded(category.category) ? 0 : 4 }}
                          transition={spring.fluent}
                        >
                          <span className="flex items-center gap-3">
                            {category.category}
                            {isCategoryExpanded(category.category) && (
                              <span className="text-xs font-normal opacity-80">(Click para colapsar)</span>
                            )}
                          </span>
                          <motion.span 
                            className="text-xl"
                            animate={{ rotate: isCategoryExpanded(category.category) ? 180 : 0 }}
                            transition={spring.fluent}
                          >
                            ▼
                          </motion.span>
                        </motion.button>
                      </td>
                    </motion.tr>

                    {isCategoryExpanded(category.category) && (
                      <>
                        {category.items.map((item, itemIdx) => (
                          <motion.tr
                            key={`desktop-item-${item.name.replaceAll(' ', '-')}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: itemIdx * 0.03, ...spring.fluent }}
                            className="border-b border-light-border/30 hover:bg-light-bg-secondary/30 transition-colors"
                          >
                            <td className="p-5 font-medium text-light-text text-sm">{item.name}</td>
                            <td className="p-5 text-center text-light-text-secondary text-sm">{formatValue(item.basic)}</td>
                            <td className="p-5 text-center text-light-text-secondary text-sm bg-light-accent/5">{formatValue(item.professional)}</td>
                            <td className="p-5 text-center text-light-text-secondary text-sm">{formatValue(item.enterprise)}</td>
                          </motion.tr>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </FluentGlass>
      </FluentReveal>

        {/* Nota importante */}
        <FluentReveal className="mt-6">
          <motion.div
            className="bg-gradient-to-r from-light-accent/5 to-blue-500/5 border-l-4 border-light-accent p-5 rounded-xl backdrop-blur-sm"
            whileHover={{ x: 4 }}
            transition={spring.fluent}
          >
            <p className="text-light-text text-sm leading-relaxed">
              <strong>📌 Nota:</strong> {tablaData.notaPie}
            </p>
          </motion.div>
        </FluentReveal>
      </div>
    </FluentSection>
  )
}

// Función para formatear valores (convierte boolean a check/cross)
function formatValue(value: boolean | string): string {
  if (typeof value === 'boolean') {
    return value ? '✓ Incluido' : '✗'
  }
  return value
}
