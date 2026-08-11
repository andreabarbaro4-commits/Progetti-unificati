import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock isMockMode before importing the module under test
vi.mock('../../mock', () => ({ isMockMode: vi.fn(() => false) }));

// Mock env so we don't hit validateEnv() which reads import.meta.env
vi.mock('../../env', () => ({
  env: {
    VITE_AUTH_AUTHORITY: 'https://test.auth0.com',
    VITE_AUTH_CLIENT_ID: 'test-client-id',
  },
}));

import { signupWithAuth0 } from './auth0-signup';
import { isMockMode } from '../../mock';

const mockedIsMockMode = vi.mocked(isMockMode);

describe('signupWithAuth0', () => {
  const validRequest = { email: 'user@example.com', password: 'SecureP@ss1' };

  beforeEach(() => {
    mockedIsMockMode.mockReturnValue(false);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('resolves with user object on HTTP 200', async () => {
    const successBody = {
      _id: '64abc123',
      email: 'user@example.com',
      email_verified: false,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(successBody), { status: 200 }),
    );

    const result = await signupWithAuth0(validRequest);

    expect(result).toEqual(successBody);
    expect(fetch).toHaveBeenCalledWith(
      'https://test.auth0.com/dbconnections/signup',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: 'test-client-id',
          email: validRequest.email,
          password: validRequest.password,
          connection: 'Username-Password-Authentication',
        }),
      }),
    );
  });

  it('throws Auth0SignupError with parsed body on HTTP 400 (user_exists)', async () => {
    const errorBody = {
      code: 'user_exists',
      description: 'The user already exists.',
      statusCode: 400,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual(errorBody);
  });

  it('throws Auth0SignupError for password_strength_error', async () => {
    const errorBody = {
      code: 'password_strength_error',
      description: 'Password is too weak',
      statusCode: 400,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual(errorBody);
  });

  it('throws Auth0SignupError for password_dictionary_error', async () => {
    const errorBody = {
      code: 'password_dictionary_error',
      description: 'Password is too common',
      statusCode: 400,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual(errorBody);
  });

  it('throws Auth0SignupError for invalid_password', async () => {
    const errorBody = {
      code: 'invalid_password',
      description: 'The password provided is invalid.',
      statusCode: 400,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual(errorBody);
  });

  it('throws Auth0SignupError for invalid_signup', async () => {
    const errorBody = {
      code: 'invalid_signup',
      description: 'Signup is disabled.',
      statusCode: 400,
    };

    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(errorBody), { status: 400 }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual(errorBody);
  });

  it('falls back to defaults when error response body cannot be parsed', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('not json', { status: 500, headers: { 'Content-Type': 'text/plain' } }),
    );

    await expect(signupWithAuth0(validRequest)).rejects.toEqual({
      code: 'unknown_error',
      description: 'An unexpected error occurred.',
      statusCode: 500,
    });
  });

  it('throws network_error when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(signupWithAuth0(validRequest)).rejects.toEqual({
      code: 'network_error',
      description: 'A network error occurred. Please check your connection and try again.',
      statusCode: 0,
    });
  });

  it('resolves with mock data when mock mode is enabled', async () => {
    mockedIsMockMode.mockReturnValue(true);

    const result = await signupWithAuth0(validRequest);

    expect(result).toEqual({
      _id: 'mock-user-id',
      email: 'user@example.com',
      email_verified: false,
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
