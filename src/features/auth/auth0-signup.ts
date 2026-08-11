import { env } from '../../env';
import { isMockMode } from '../../mock';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Auth0SignupRequest {
  email: string;
  password: string;
}

export interface Auth0SignupSuccess {
  _id: string;
  email: string;
  email_verified: boolean;
}

export interface Auth0SignupError {
  code: string;
  description: string;
  statusCode: number;
}

// ─── Main function ───────────────────────────────────────────────────────────

/**
 * Calls Auth0's `/dbconnections/signup` endpoint to create a new user account.
 *
 * - On HTTP 200: resolves with the created user object.
 * - On HTTP 400+: throws a typed `Auth0SignupError` parsed from the response body.
 * - On network failure: throws with `code: "network_error"`.
 * - In mock mode: resolves immediately with a fake success response.
 */
export async function signupWithAuth0(
  request: Auth0SignupRequest,
): Promise<Auth0SignupSuccess> {
  if (isMockMode()) {
    return {
      _id: 'mock-user-id',
      email: request.email,
      email_verified: false,
    };
  }

  const url = `${env.VITE_AUTH_AUTHORITY}/dbconnections/signup`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: env.VITE_AUTH_CLIENT_ID,
        email: request.email,
        password: request.password,
        connection: 'Username-Password-Authentication',
      }),
    });
  } catch {
    const networkError: Auth0SignupError = {
      code: 'network_error',
      description: 'A network error occurred. Please check your connection and try again.',
      statusCode: 0,
    };
    throw networkError;
  }

  if (response.ok) {
    const data: Auth0SignupSuccess = await response.json();
    return data;
  }

  // HTTP 400+ — parse error body
  let errorBody: Partial<Auth0SignupError>;
  try {
    errorBody = await response.json();
  } catch {
    errorBody = {};
  }

  const signupError: Auth0SignupError = {
    code: errorBody.code ?? 'unknown_error',
    description: errorBody.description ?? 'An unexpected error occurred.',
    statusCode: errorBody.statusCode ?? response.status,
  };
  throw signupError;
}
