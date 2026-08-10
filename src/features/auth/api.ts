import { apiClient } from '../../lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUserProfile {
  id: string;
  email: string;
  name: string;
}

export interface LoginSuccessResponse {
  accessToken: string;
  user: LoginUserProfile;
}

/**
 * POST /auth/login (Login_Contract).
 * Success: 200 with { accessToken, user: { id, email, name } }.
 * Failure: 401 with a JSON body `{ message: string }` — api-client.ts already
 * extracts `errorBody.message` into the thrown ApiError, so callers only need
 * to catch and read `error.message`.
 */
export function login(request: LoginRequest): Promise<LoginSuccessResponse> {
  return apiClient.post<LoginSuccessResponse, LoginRequest>(
    '/auth/login',
    request,
    { requireAuth: false },
  );
}
