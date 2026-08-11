/**
 * Maps Auth0 `/dbconnections/signup` error codes to i18n translation keys.
 */

const AUTH0_ERROR_MAP: Record<string, string> = {
  user_exists: 'auth.errors.email_already_registered',
  password_strength_error: 'auth.errors.password_too_weak',
  password_no_user_info_error: 'auth.errors.password_contains_user_info',
  password_dictionary_error: 'auth.errors.password_too_common',
  invalid_password: 'auth.errors.invalid_password',
  invalid_signup: 'auth.errors.invalid_signup',
  network_error: 'auth.errors.network_error',
};

/**
 * Resolves an Auth0 error code to a user-facing i18n translation key.
 *
 * For `password_strength_error`, the Auth0 response `description` contains the
 * specific policy detail (e.g. "Password is too weak"). When provided, the
 * description is appended after the base key separated by `: ` so the UI can
 * display additional context.
 *
 * Returns `auth.errors.generic` for any unrecognised error code.
 */
export function mapAuth0Error(code: string, description?: string): string {
  const key = AUTH0_ERROR_MAP[code];

  if (!key) {
    return 'auth.errors.generic';
  }

  if (code === 'password_strength_error' && description) {
    return `${key}: ${description}`;
  }

  return key;
}
