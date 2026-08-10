import { HiOutlineXMark } from 'react-icons/hi2'
import type { Attachment } from './useFileAttachments'

export interface AttachmentPreviewProps {
  attachments: Attachment[]
  onRemove: (index: number) => void
}

/**
 * AttachmentPreview — shows thumbnails of pending attachments before send (Req 30.4, 30.5).
 */
export function AttachmentPreview({ attachments, onRemove }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null

  return (
    <div className="flex gap-2 px-3 py-2">
      {attachments.map((attachment, index) => (
        <div
          key={attachment.previewUrl}
          className="group relative flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-500"
        >
          {attachment.file.type.startsWith('image/') ? (
            <img
              src={attachment.previewUrl}
              alt={attachment.file.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span className="truncate px-1 text-center text-[10px]">{attachment.file.name.split('.').pop()?.toUpperCase()}</span>
          )}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Remove ${attachment.file.name}`}
          >
            <HiOutlineXMark className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
