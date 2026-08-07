/**
 * Typed fetch wrapper for the Flowlee API.
 *
 * - Reads base URL from VITE_API_BASE_URL
 * - Attaches Bearer token when available via setTokenProvider
 * - Handles 401 with silent refresh + retry via setRefreshHandler
 * - Throws structured ApiError for all failure cases
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Structured error thrown by the API client */
export interface ApiError {
  status: number | null; // null for network errors
  message: string;
  url: string;
  method: string;
}

/** Options passed to convenience methods */
interface MethodOptions {
  requireAuth?: boolean; // default: true
  headers?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Configuration hooks (set by auth module in Phase 4)
// ---------------------------------------------------------------------------

type TokenProvider = () => string | null;
type RefreshHandler = () => Promise<boolean>;
type LoginRedirect = () => void;

let tokenProvider: TokenProvider = () => null;
let refreshHandler: RefreshHandler | null = null;
let loginRedirect: LoginRedirect = () => {
  window.location.href = '/auth/callback';
};

/** Register a function that returns the current access token (or null). */
export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

/** Register a function that attempts a silent token refresh. Returns true on success. */
export function setRefreshHandler(handler: RefreshHandler): void {
  refreshHandler = handler;
}

/** Register a function that redirects the user to the login page. */
export function setLoginRedirect(redirect: LoginRedirect): void {
  loginRedirect = redirect;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) {
    throw createApiError(
      null,
      'VITE_API_BASE_URL is not defined. Set it in your .env file.',
      '',
      '',
    );
  }
  return base.endsWith('/') ? base.slice(0, -1) : base;
}

function createApiError(
  status: number | null,
  message: string,
  url: string,
  method: string,
): ApiError {
  return { status, message, url, method };
}

async function request<TResponse>(
  method: string,
  path: string,
  body?: unknown,
  options: MethodOptions = {},
): Promise<TResponse> {
  const { requireAuth = true, headers: extraHeaders } = options;
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // Attach token if available
  const token = tokenProvider();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (requireAuth) {
    // No token and auth is required — still send the request; backend will 401
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  let response: Response;

  try {
    response = await fetch(url, fetchOptions);
  } catch (error: unknown) {
    // Network error — no response received
    const message =
      error instanceof Error ? error.message : 'Network request failed';
    throw createApiError(null, message, url, method);
  }

  // Handle 401: attempt refresh + retry once
  if (response.status === 401) {
    let refreshed = false;

    if (refreshHandler) {
      try {
        refreshed = await refreshHandler();
      } catch {
        refreshed = false;
      }
    }

    if (refreshed) {
      // Retry with new token
      const newToken = tokenProvider();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      }

      try {
        response = await fetch(url, { ...fetchOptions, headers });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Network request failed';
        throw createApiError(null, message, url, method);
      }

      // If retry also returns 401, redirect to login
      if (response.status === 401) {
        loginRedirect();
        throw createApiError(401, 'Unauthorized', url, method);
      }
    } else {
      // Refresh not available or failed — redirect to login
      loginRedirect();
      throw createApiError(401, 'Unauthorized', url, method);
    }
  }

  // Handle non-2xx responses
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody && typeof errorBody.message === 'string') {
        message = errorBody.message;
      }
    } catch {
      // Ignore JSON parse failures — use default message
    }
    throw createApiError(response.status, message, url, method);
  }

  // Parse successful response
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as unknown as TResponse;
  }

  const data = (await response.json()) as TResponse;
  return data;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const apiClient = {
  get<TResponse>(path: string, options?: MethodOptions): Promise<TResponse> {
    return request<TResponse>('GET', path, undefined, options);
  },

  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: MethodOptions,
  ): Promise<TResponse> {
    return request<TResponse>('POST', path, body, options);
  },

  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: MethodOptions,
  ): Promise<TResponse> {
    return request<TResponse>('PUT', path, body, options);
  },

  patch<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: MethodOptions,
  ): Promise<TResponse> {
    return request<TResponse>('PATCH', path, body, options);
  },

  delete<TResponse>(path: string, options?: MethodOptions): Promise<TResponse> {
    return request<TResponse>('DELETE', path, undefined, options);
  },
};
