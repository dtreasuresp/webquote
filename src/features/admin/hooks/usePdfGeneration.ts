import { useCallback } from 'react'
import { generateSnapshotPDF, generateSnapshotPDFBlob } from '@/features/pdf-export/utils/generator'
import type { PackageSnapshot } from '@/lib/types'

export function usePdfExport() {
  const handleDownloadPDF = useCallback((snapshot: PackageSnapshot) => {
    generateSnapshotPDF(snapshot)
  }, [])

  const handleGetPDFBlob = useCallback((snapshot: PackageSnapshot): Blob => {
    return generateSnapshotPDFBlob(snapshot)
  }, [])

  return {
    handleDownloadPDF,
    handleGetPDFBlob,
  }
}
