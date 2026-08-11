import { env } from '../../env';
import { isMockMode } from '../../mock';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SendCodeRequest {
  email: string;
}

export interface SendCodeResponse {
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeSuccessResponse {
  verified: true;
}

export interface VerifyCodeErrorResponse {
  error: 'invalid_code' | 'expired_code' | 'max_attempts' | 'unknown_error';
}

// ─── Main functions ──────────────────────────────────────────────────────────

/**
 * Sends a verification code to the given email.
 *
 * - Always resolves (never throws) to avoid leaking whether the email exists.
 * - On network or server failure: logs a warning and resolves with a success response.
 * - In mock mode: resolves immediately without making an HTTP call.
 */
export async function sendVerificationCode(
  request: SendCodeRequest,
): Promise<SendCodeResponse> {
  if (isMockMode()) {
    return { message: 'Code sent' };
  }

  const url = `${env.VITE_API_BASE_URL}/api/auth/verification-code/send`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: request.email }),
    });
  } catch (error) {
    console.warn('[verification-code] Failed to send code:', error);
  }

  return { message: 'Code sent' };
}

/**
 * Verifies a code against the backend.
 *
 * - On HTTP 200: resolves with `{ verified: true }`.
 * - On HTTP 400: throws a typed `VerifyCodeErrorResponse` parsed from the response body.
 * - On network failure: throws with `error: 'unknown_error'`.
 * - In mock mode: resolves if code is "123456", throws `invalid_code` otherwise.
 */
export async function verifyCode(
  request: VerifyCodeRequest,
): Promise<VerifyCodeSuccessResponse> {
  if (isMockMode()) {
    if (request.code === '123456') {
      return { verified: true };
    }
    const error: VerifyCodeErrorResponse = { error: 'invalid_code' };
    throw error;
  }

  const url = `${env.VITE_API_BASE_URL}/api/auth/verification-code/verify`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: request.email, code: request.code }),
    });
  } catch {
    const networkError: VerifyCodeErrorResponse = { error: 'unknown_error' };
    throw networkError;
  }

  if (response.ok) {
    return { verified: true };
  }

  // HTTP 400 — parse error body
  let errorBody: Partial<VerifyCodeErrorResponse>;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = {};
  }

  const verifyError: VerifyCodeErrorResponse = {
    error: errorBody.error ?? 'unknown_error',
  };
  throw verifyError;
}
