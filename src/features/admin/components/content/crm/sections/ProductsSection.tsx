'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Package, Tag, Search, Filter, Download, MoreVertical, ExternalLink, Plus, Trash2, Edit2 } from 'lucide-react'
import { useToast } from '@/components/providers/ToastProvider'
import { useAdminAudit } from '@/features/admin/hooks/useAdminAudit'
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions'
import { useCrmStore, useCrmModalStore } from '@/stores'
import SectionHeader from '@/features/admin/components/SectionHeader'
import { Product } from '@/lib/types'

export default function ProductsSection() {
  const toast = useToast()
  const { logAction } = useAdminAudit()
  const { canCreate, canEdit, canDelete } = useAdminPermissions()
  const { products, isLoading, fetchProducts, deleteProduct } = useCrmStore()
  const { openModal } = useCrmModalStore()
  
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddProduct = useCallback(() => {
    if (!canCreate('PRODUCTS')) {
      toast.error('No tienes permiso para crear productos')
      return
    }
    logAction('CREATE', 'PRODUCTS', 'new-product', 'Abriendo formulario de nuevo producto')
    openModal('product', 'create')
  }, [canCreate, logAction, openModal, toast])

  const handleEdit = useCallback((product: Product) => {
    if (!canEdit('PRODUCTS')) {
      toast.error('No tienes permiso para editar productos')
      return
    }
    logAction('EDIT', 'PRODUCTS', product.id, 'Abriendo formulario de edición de producto')
    openModal('product', 'edit', product)
  }, [canEdit, logAction, openModal, toast])

  const handleRefresh = useCallback(async () => {
    await fetchProducts()
    logAction('VIEW', 'PRODUCTS', 'products-list', 'Catálogo de productos actualizado')
    toast.success('Catálogo actualizado')
  }, [fetchProducts, logAction, toast])

  const handleDelete = useCallback(async (id: string) => {
    if (!canDelete('PRODUCTS')) {
      toast.error('No tienes permiso para eliminar productos')
      return
    }

    if (confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteProduct(id)
        logAction('DELETE', 'PRODUCTS', id, 'Producto eliminado')
        toast.success('Producto eliminado correctamente')
      } catch (error) {
        toast.error('Error al eliminar el producto')
      }
    }
  }, [canDelete, deleteProduct, logAction, toast])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBadgeColor = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('software')) return 'bg-gh-success/10 text-gh-success border-gh-success/20'
    if (cat.includes('servicio')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    if (cat.includes('hardware')) return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    return 'bg-gh-bg-tertiary text-gh-text-muted border-gh-border/30'
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <SectionHeader
        title="Catálogo de Productos"
        description="Gestiona tus productos, servicios y listas de precios"
        icon={<Package className="w-5 h-5" />}
        onAdd={handleAddProduct}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        itemCount={products.length}
        variant="success"
        badges={[
          { label: 'Total', value: products.length, color: 'bg-gh-success/10 text-gh-success border-gh-success/20' }
        ]}
      />

      <div className="px-6 py-4 border-b border-gh-border/50 bg-gh-bg-secondary/5 backdrop-blur-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gh-text-muted" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text focus:outline-none focus:ring-2 focus:ring-gh-accent/30 focus:border-gh-accent/50 transition-all placeholder:text-gh-text-muted/50"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-secondary/40 transition-colors">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gh-bg-secondary/20 border border-gh-border/50 rounded-lg text-sm text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-secondary/40 transition-colors">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gh-border/50 rounded-xl bg-gh-bg-secondary/10 backdrop-blur-md overflow-hidden group hover:border-gh-accent/50 transition-all flex flex-col shadow-lg hover:shadow-gh-accent/5">
                <div className="aspect-video bg-gh-bg-secondary/20 flex items-center justify-center relative border-b border-gh-border/50">
                  <Package className="w-8 h-8 text-gh-text-muted opacity-20" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-1.5 bg-gh-bg-secondary/80 backdrop-blur-sm border border-gh-border/50 rounded-lg text-gh-text-muted hover:text-gh-accent transition-colors"
                      title="Ver detalles"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColor(product.category)}`}>
                      {product.category}
                    </span>
                    <span className="text-xs font-bold text-gh-text tabular-nums">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(product.listPrice))}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gh-text mb-2 group-hover:text-gh-success transition-colors line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-gh-text-muted line-clamp-2 mb-4 flex-1">
                    {product.description || 'Sin descripción disponible.'}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-gh-border/30">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-gh-text-muted" />
                      <span className="text-[10px] text-gh-text-muted font-mono">SKU: {product.sku}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-1 text-gh-text-muted hover:text-gh-text hover:bg-gh-bg-tertiary rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-1 text-gh-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gh-text-muted">
            <Package className="w-12 h-12 opacity-10 mb-4" />
            <p className="text-sm">No se encontraron productos</p>
            <button 
              onClick={handleAddProduct}
              className="mt-4 flex items-center gap-2 text-xs text-gh-success hover:underline"
            >
              <Plus className="w-3 h-3" /> Crear primer producto
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
