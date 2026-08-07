// src/env.ts

import { isMockMode } from './mock';

interface AppEnv {
  VITE_API_BASE_URL: string;
  VITE_AUTH_AUTHORITY: string;
  VITE_AUTH_CLIENT_ID: string;
  VITE_AUTH_AUDIENCE: string;
}

function validateEnv(): AppEnv {
  if (isMockMode()) {
    return {
      VITE_API_BASE_URL: 'http://mock.local',
      VITE_AUTH_AUTHORITY: 'http://mock.local/auth',
      VITE_AUTH_CLIENT_ID: 'mock-client-id',
      VITE_AUTH_AUDIENCE: 'http://mock.local/api',
    };
  }

  const required = ['VITE_API_BASE_URL', 'VITE_AUTH_AUTHORITY', 'VITE_AUTH_CLIENT_ID', 'VITE_AUTH_AUDIENCE'] as const;
  const missing = required.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
      `See .env.example for reference.`
    );
  }

  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_AUTH_AUTHORITY: import.meta.env.VITE_AUTH_AUTHORITY,
    VITE_AUTH_CLIENT_ID: import.meta.env.VITE_AUTH_CLIENT_ID,
    VITE_AUTH_AUDIENCE: import.meta.env.VITE_AUTH_AUDIENCE,
  };
}

export const env = validateEnv();
