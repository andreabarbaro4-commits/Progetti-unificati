import { useState, useRef, type FormEvent } from 'react'
import { HiOutlinePaperAirplane, HiOutlinePaperClip, HiOutlineMicrophone } from 'react-icons/hi2'
import { useFileAttachments } from './useFileAttachments'
import { useVoiceRecording } from './useVoiceRecording'
import { AttachmentPreview } from './AttachmentPreview'
import { RecordingIndicator } from './RecordingIndicator'
import type { ChatAttachment } from '../../mock/fixtures/types'

export interface MessageInputProps {
  onSend: (text: string, attachments?: ChatAttachment[], isVoiceRecording?: boolean) => void
  disabled?: boolean
}

/**
 * MessageInput — compose input wiring attachments and voice recording (Req 30.1, 31.1).
 *
 * - Text input with send button
 * - File attachment (cap 3, 5MB each)
 * - Voice recording with indicator
 * - Blocks empty/whitespace-only sends
 */
export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { attachments, error: attachmentError, addFile, removeFile, clearAll, isFull } = useFileAttachments()
  const { state: recordingState, elapsedSeconds, audioBlob, startRecording, stopRecording, cancelRecording, consumeAudioBlob } = useVoiceRecording()

  const canSend = text.trim().length > 0 || attachments.length > 0

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!canSend || disabled) return

    // Build attachments for the message
    const chatAttachments: ChatAttachment[] = attachments.map((a) => ({
      fileName: a.file.name,
      mimeType: a.file.type,
      data: a.previewUrl, // In a real app this would be a base64/upload URL
    }))

    onSend(text.trim(), chatAttachments.length > 0 ? chatAttachments : undefined)
    setText('')
    clearAll()
  }

  function handleFileSelect() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (let i = 0; i < files.length; i++) {
      addFile(files[i])
    }
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }

  function handleVoiceStop() {
    stopRecording()
    // Wait for blob to be available (onstop fires async)
    setTimeout(() => {
      const blob = consumeAudioBlob()
      if (blob) {
        onSend('🎤 Voice message', undefined, true)
      }
    }, 100)
  }

  // If recording, show the recording indicator instead of the regular input
  if (recordingState === 'recording') {
    return (
      <div className="flex items-center justify-center border-t border-gray-200 px-4 py-3">
        <RecordingIndicator
          elapsedSeconds={elapsedSeconds}
          onStop={handleVoiceStop}
          onCancel={cancelRecording}
        />
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200">
      <AttachmentPreview attachments={attachments} onRemove={removeFile} />

      {attachmentError && (
        <p className="px-4 py-1 text-xs text-red-500">{attachmentError}</p>
      )}

      {recordingState === 'denied' && (
        <p className="px-4 py-1 text-xs text-red-500">Microphone access denied.</p>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 px-3 py-3">
        {/* File attachment button */}
        <button
          type="button"
          onClick={handleFileSelect}
          disabled={isFull || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          aria-label="Attach file"
        >
          <HiOutlinePaperClip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend && !disabled) handleSubmit(e)
              }
            }}
            placeholder="Type a message…"
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:opacity-50"
          />
        </div>

        {/* Voice recording button */}
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          aria-label="Start voice recording"
        >
          <HiOutlineMicrophone className="h-5 w-5" />
        </button>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend || disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40"
          aria-label="Send message"
        >
          <HiOutlinePaperAirplane className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
