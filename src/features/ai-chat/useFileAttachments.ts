import { useState, useCallback } from 'react'
import { validateFileAcceptance, type FileAcceptanceResult } from '../../lib/fileValidation'

export interface Attachment {
  file: File
  previewUrl: string
}

const FILE_RULES = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB per file
  allowedMimeTypes: undefined, // All types allowed for chat
}

const MAX_ATTACHMENTS = 3

/**
 * useFileAttachments — manages file attachments for chat messages (Req 30.1–30.5).
 *
 * Cap: 3 files, 5MB each, via validateFileAcceptance.
 * Remove frees a slot.
 */
export function useFileAttachments() {
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [error, setError] = useState<string | null>(null)

  const addFile = useCallback((file: File) => {
    setError(null)

    const result: FileAcceptanceResult = validateFileAcceptance(file, FILE_RULES, {
      currentCount: attachments.length,
      maxCount: MAX_ATTACHMENTS,
    })

    if (!result.accepted) {
      setError(result.reason ?? 'File rejected.')
      return false
    }

    const previewUrl = URL.createObjectURL(file)
    setAttachments((prev) => [...prev, { file, previewUrl }])
    return true
  }, [attachments.length])

  const removeFile = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index]
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
    setError(null)
  }, [])

  const clearAll = useCallback(() => {
    setAttachments((prev) => {
      for (const a of prev) URL.revokeObjectURL(a.previewUrl)
      return []
    })
    setError(null)
  }, [])

  return {
    attachments,
    error,
    addFile,
    removeFile,
    clearAll,
    isFull: attachments.length >= MAX_ATTACHMENTS,
  }
}
