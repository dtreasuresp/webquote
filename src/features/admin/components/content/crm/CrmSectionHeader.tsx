'use client'

import React from 'react'
import SectionHeader from '../../SectionHeader'

interface CrmSectionHeaderProps {
  title: string
  description?: string
  icon?: React.ReactNode
  onAdd?: () => void
  onRefresh?: () => void
  onSettings?: () => void
  isLoading?: boolean
  itemCount?: number
  badges?: Array<{ label: string; value: string | number; color?: string }>
}

export default function CrmSectionHeader(props: Readonly<CrmSectionHeaderProps>) {
  return <SectionHeader {...props} variant="success" />
}
