import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/Button'

export type RegistrationErrorVariant = 'network' | 'validation' | 'auth' | 'server'

export interface RegistrationErrorProps {
  /** User-friendly error message to display */
  message: string
  /** Callback for retry/re-auth action (shown for network, server, and auth variants) */
  onRetry?: () => void
  /** Determines available actions based on error type */
  variant: RegistrationErrorVariant
}

/**
 * Displays a user-friendly registration error with contextual actions.
 *
 * - network/server: "Try again" button
 * - auth: "Sign in again" button (triggers login redirect via onRetry)
 * - validation: message only (user corrects input)
 *
 * Never exposes raw HTTP status codes or technical details.
 */
export function RegistrationError({ message, onRetry, variant }: RegistrationErrorProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-center"
      role="alert"
    >
      <p className="text-sm text-red-700">{message}</p>

      {(variant === 'network' || variant === 'server') && onRetry && (
        <Button
          className="mt-1"
          size="sm"
          variant="primary"
          onClick={onRetry}
        >
          {t('try_again', 'Try again')}
        </Button>
      )}

      {variant === 'auth' && onRetry && (
        <Button
          className="mt-1"
          size="sm"
          variant="primary"
          onClick={onRetry}
        >
          {t('sign_in_again', 'Sign in again')}
        </Button>
      )}
    </div>
  )
}
