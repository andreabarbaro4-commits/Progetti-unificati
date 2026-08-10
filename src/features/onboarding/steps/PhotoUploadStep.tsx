import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StepIndicator } from '../components/StepIndicator'
import { RegistrationError, type RegistrationErrorVariant } from '../components/RegistrationError'
import { PhotoFileSchema } from '../schemas'
import { useRegistrationStore } from '../useRegistrationStore'
import { useProfileCreation, type CreationStep } from '../hooks/useProfileCreation'
import { useAuth } from '../../auth/AuthProvider'

const QUICK_ROLE_TAGS = ['Project Manager', 'HR Manager', 'Dog Sitter']

/** Derives the RegistrationError variant from the error message produced by useProfileCreation. */
function deriveErrorVariant(message: string): RegistrationErrorVariant {
  if (message.startsWith('Connection error')) return 'network'
  if (message.startsWith('Authorization error')) return 'auth'
  // 400 validation errors are passed through as-is from the API
  // They won't match any of the prefixes above, so check for known retry-able patterns
  if (
    message.startsWith('Something went wrong') ||
    message.startsWith('Photo upload failed')
  ) {
    return 'server'
  }
  // Anything else (e.g. 400 validation messages from the API) is a validation error
  return 'validation'
}

/** Maps the current creation step to a user-facing progress message. */
function getProgressText(step: CreationStep): string {
  switch (step) {
    case 'creating':
      return 'Creating profile\u2026'
    case 'presigning':
    case 'uploading':
      return 'Uploading photo\u2026'
    case 'updating':
      return 'Finishing up\u2026'
    default:
      return ''
  }
}

interface PhotoUploadStepProps {
  hasPhoto: boolean
  onNext: () => void
}

/** Upload a profile photo step. */
export function PhotoUploadStep({ hasPhoto: initialHasPhoto, onNext }: PhotoUploadStepProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [hasValidFile, setHasValidFile] = useState(false)

  const setPhoto = useRegistrationStore((s) => s.setPhoto)
  const registrationData = useRegistrationStore((s) => ({
    name: s.name,
    surname: s.surname,
    gender: s.gender,
    birthDate: s.birthDate,
    jobTitle: s.jobTitle,
    selectedPhotoFile: s.selectedPhotoFile,
  }))

  const { user, login } = useAuth()
  const { submitRegistration, isSubmitting, error, reset, currentStep } = useProfileCreation()

  const handleCircleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file against PhotoFileSchema
    const result = PhotoFileSchema.safeParse({ type: file.type, size: file.size })

    if (!result.success) {
      const firstIssue = result.error.issues[0]
      setFileError(t(firstIssue.message))
      setPreviewUrl(null)
      setHasValidFile(false)
      setPhoto(null)
      return
    }

    // Validation passed — store file and show preview
    setFileError(null)
    setHasValidFile(true)
    setPhoto(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async () => {
    if (!user) return

    try {
      await submitRegistration({
        userId: user.sub,
        email: user.email,
        profileData: registrationData,
      })
      // Success — trigger phase transition
      onNext()
    } catch {
      // Error is captured in the hook's error state; no additional handling needed
    }
  }

  const handleRetry = () => {
    reset()
    handleSubmit()
  }

  const hasImage = previewUrl || initialHasPhoto
  const progressText = getProgressText(currentStep)

  return (
    <div className="relative flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Loading overlay */}
      {isSubmitting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin mb-3" />
          <p className="text-base font-medium text-gray-700">{progressText}</p>
        </div>
      )}

      {/* Error display */}
      {error && !isSubmitting && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 px-6">
          <RegistrationError
            message={error}
            variant={deriveErrorVariant(error)}
            onRetry={
              deriveErrorVariant(error) === 'auth'
                ? () => login('/onboarding')
                : deriveErrorVariant(error) !== 'validation'
                  ? handleRetry
                  : undefined
            }
          />
        </div>
      )}

      {/* Title */}
      <div
        className="w-full text-left mb-4 text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('upload_photo')}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
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

      {/* Inline validation error */}
      {fileError && (
        <p className="text-red-500 text-sm mt-1" role="alert">
          {fileError}
        </p>
      )}

      {/* Name & email */}
      <div className="text-center mb-2">
        <p className="font-bold text-[24px] text-black">
          {registrationData.name || 'Mario'} {registrationData.surname || 'Rossi'}
        </p>
        <p className="text-[14px] text-[#666]">
          {user?.email || 'mario.rossi@gmail.com'}
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
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!!fileError || isSubmitting}
          type="button"
          onClick={handleSubmit}
        >
          {t('start').toUpperCase()}
        </button>
        <StepIndicator hasNext={false} />
      </div>
    </div>
  )
}
