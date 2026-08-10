import { useState, useCallback } from 'react'
import { validateFileAcceptance, type FileAcceptanceResult } from '../../lib/fileValidation'

export interface Attachment {
  file: File
  previewUrl: string
}

const MAX_ATTACHMENTS = 3

const FILE_RULES = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB per file
  maxCollectionSize: MAX_ATTACHMENTS,
  // allowedTypes intentionally omitted — all types allowed for chat
}

/** Maps a rejection reason to a human-readable message (Req 30.1–30.5). */
function reasonToMessage(reason: Exclude<FileAcceptanceResult, { accepted: true }>['reason']): string {
  switch (reason) {
    case 'tooLarge':
      return 'File exceeds the 5MB size limit.'
    case 'unsupportedType':
      return 'Unsupported file type.'
    case 'collectionFull':
      return `You can attach up to ${MAX_ATTACHMENTS} files.`
  }
}

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
    })

    if (result.accepted === false) {
      setError(reasonToMessage(result.reason))
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
