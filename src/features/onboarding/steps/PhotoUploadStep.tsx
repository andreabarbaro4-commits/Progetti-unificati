import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepIndicator } from '../components/StepIndicator'

const QUICK_ROLE_TAGS = ['Project Manager', 'HR Manager', 'Dog Sitter']

interface PhotoUploadStepProps {
  hasPhoto: boolean
  onNext: () => void
}

/** Upload a profile photo step. */
export function PhotoUploadStep({ hasPhoto: initialHasPhoto, onNext }: PhotoUploadStepProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleCircleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const hasImage = previewUrl || initialHasPhoto

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Title */}
      <div
        className="w-full text-left mb-4 text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('upload_photo')}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />

      {/* Photo circle — clickable */}
      <div
        className="w-[160px] h-[160px] rounded-full bg-[#f0f0f0] flex justify-center items-center border-2 border-dashed border-[#ccc] my-4 cursor-pointer hover:border-gray-500 transition-colors"
        role="button"
        tabIndex={0}
        onClick={handleCircleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCircleClick() }}
      >
        {hasImage ? (
          <img className="w-full h-full object-cover rounded-full" alt="Profilo" src={previewUrl ?? ''} />
        ) : (
          <span className="text-4xl text-gray-400">+</span>
        )}
      </div>

      {/* Name & email */}
      <div className="text-center mb-2">
        <p className="font-bold text-[24px] text-black">
          Mario Rossi
        </p>
        <p className="text-[14px] text-[#666]">
          mario.rossi@gmail.com
        </p>
      </div>

      {/* Role tags */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {QUICK_ROLE_TAGS.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 border border-gray-300 rounded-full text-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 w-full">
        <button
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors"
          type="button"
          onClick={onNext}
        >
          {t('start').toUpperCase()}
        </button>
        <StepIndicator hasNext={false} />
      </div>
    </div>
  )
}
