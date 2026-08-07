import { useTranslation } from 'react-i18next';
import { useAuth } from './auth-provider';

/**
 * Renders a fixed-position toast notification when the user's session has expired.
 * The notification auto-dismisses when the redirect to login navigates away
 * (component unmounts on navigation).
 */
export function SessionExpiredNotification() {
  const { isSessionExpired } = useAuth();
  const { t } = useTranslation();

  if (!isSessionExpired) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full px-4"
    >
      <div className="rounded-lg bg-amber-50 border border-amber-300 px-4 py-3 shadow-lg flex items-center gap-3">
        <svg
          className="h-5 w-5 text-amber-600 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-amber-800">
          {t('auth.session_expired', 'Your session has expired. Redirecting to login...')}
        </p>
      </div>
    </div>
  );
}
