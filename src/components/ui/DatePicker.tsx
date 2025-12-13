"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value?: string | null // ISO date string
  onChange: (isoDate: string | null) => void
  placeholder?: string
  label?: string
  className?: string
  id?: string
}

const pad = (n: number) => n.toString().padStart(2, '0')

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export default function DatePicker({ value, onChange, placeholder = 'dd/mm/aaaa', label, className = '', id }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => (value ? new Date(value) : new Date()))
  const [selected, setSelected] = useState<Date | null>(() => (value ? new Date(value) : null))
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => { if (value) setSelected(new Date(value)) }, [value])

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !panelRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    panelRef.current.style.position = 'fixed'
    panelRef.current.style.top = `${rect.bottom + 8}px`
    panelRef.current.style.left = `${rect.left}px`
    panelRef.current.style.minWidth = `${rect.width}px`
    panelRef.current.style.zIndex = '99999'
  }, [])

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      window.addEventListener('resize', updatePosition)
      window.addEventListener('scroll', updatePosition, true)
    }
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, updatePosition])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (isOpen && panelRef.current && buttonRef.current && !panelRef.current.contains(t) && !buttonRef.current.contains(t)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen])

  const goPrev = () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const goNext = () => setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const weeks = (() => {
    const start = startOfMonth(calendarMonth)
    const end = endOfMonth(calendarMonth)
    const days: Date[] = []
    // Backfill previous month days to start on Sunday
    const startWeekday = start.getDay()
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(start)
      d.setDate(start.getDate() - (i + 1))
      days.push(d)
    }
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d))
    // fill to complete weeks
    while (days.length % 7 !== 0) {
      const last = days[days.length - 1]
      const d = new Date(last)
      d.setDate(last.getDate() + 1)
      days.push(d)
    }
    const rows: Date[][] = []
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7))
    return rows
  })()

  const handleSelectDay = (d: Date) => {
    setSelected(d)
    onChange(d.toISOString())
    setIsOpen(false)
  }

  const handleClear = () => { setSelected(null); onChange(null); setIsOpen(false) }
  const handleToday = () => { const t = new Date(); setCalendarMonth(startOfMonth(t)); setSelected(t); onChange(t.toISOString()); setIsOpen(false) }

  const renderedPanel = isOpen && typeof document !== 'undefined' ? createPortal(
    <div ref={panelRef} className="bg-gh-bg-secondary/95 border border-gh-border/70 rounded-md shadow-xl overflow-hidden p-3 text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goPrev} className="p-2 rounded hover:bg-gh-bg-tertiary/40"><ChevronLeft className="w-4 h-4 text-gh-text-muted" /></button>
          <div className="text-xs font-medium text-gh-text">{calendarMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</div>
          <button type="button" onClick={goNext} className="p-2 rounded hover:bg-gh-bg-tertiary/40"><ChevronRight className="w-4 h-4 text-gh-text-muted" /></button>
        </div>
        <div className="text-xs text-gh-text-muted">do. lu. ma. mi. ju. vi. sá.</div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map(d => {
          const isCurrentMonth = d.getMonth() === calendarMonth.getMonth()
          const isSelected = selected && d.toDateString() === selected.toDateString()
          return (
            <button
              key={d.toISOString()}
              type="button"
              onClick={() => handleSelectDay(d)}
              className={`w-8 h-8 flex items-center justify-center rounded ${isSelected ? 'bg-gh-success text-white' : isCurrentMonth ? 'text-gh-text' : 'text-gh-text-muted' } hover:bg-gh-bg-tertiary/40`}
            >{d.getDate()}</button>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={handleClear} className="text-xs text-gh-text-muted hover:underline">Borrar</button>
        <div className="flex gap-2">
          <button type="button" onClick={handleToday} className="px-3 py-1 text-xs bg-gh-success rounded-md text-white">Hoy</button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-gh-text mb-2">{label}</label>}

      <div className="relative">
        <button ref={buttonRef} id={id} type="button" onClick={() => { setIsOpen(v => !v); if (!isOpen) updatePosition() }} className="w-full px-3 py-2 text-left text-xs bg-gh-bg-secondary border border-gh-border/30 rounded-md text-gh-text hover:border-gh-border/50">
          {selected ? `${pad(selected.getDate())}/${pad(selected.getMonth()+1)}/${selected.getFullYear()}` : placeholder}
        </button>
      </div>

      {renderedPanel}
    </div>
  )
}