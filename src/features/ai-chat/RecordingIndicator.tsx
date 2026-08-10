import { HiOutlineStop, HiOutlineXMark } from 'react-icons/hi2'

export interface RecordingIndicatorProps {
  elapsedSeconds: number
  onStop: () => void
  onCancel: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * RecordingIndicator — shows elapsed time and stop/cancel controls (Req 31.2, 31.3).
 */
export function RecordingIndicator({ elapsedSeconds, onStop, onCancel }: RecordingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-red-50 px-4 py-2">
      {/* Pulsing dot */}
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>

      <span className="text-sm font-medium text-red-700 tabular-nums">
        {formatTime(elapsedSeconds)}
      </span>

      <button
        type="button"
        onClick={onStop}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700"
        aria-label="Stop recording"
      >
        <HiOutlineStop className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onCancel}
        className="flex h-7 w-7 items-center justify-center rounded-full text-red-500 hover:bg-red-100"
        aria-label="Cancel recording"
      >
        <HiOutlineXMark className="h-4 w-4" />
      </button>
    </div>
  )
}
