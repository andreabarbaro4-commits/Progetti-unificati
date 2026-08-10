// src/env.ts

import { isMockMode } from './mock';

type AppEnvironment = 'local' | 'dev' | 'test' | 'preprod' | 'prod';

interface AppEnv {
  VITE_API_BASE_URL: string;
  VITE_AUTH_AUTHORITY: string;
  VITE_AUTH_CLIENT_ID: string;
  VITE_AUTH_AUDIENCE: string;
  APP_ENV: AppEnvironment;
}

function resolveAppEnv(): AppEnvironment {
  const envVar = import.meta.env.VITE_APP_ENV as string | undefined;
  if (envVar && ['local', 'dev', 'test', 'preprod', 'prod'].includes(envVar)) {
    return envVar as AppEnvironment;
  }
  // Fallback: local in development mode, prod otherwise
  return import.meta.env.DEV ? 'local' : 'prod';
}

function validateEnv(): AppEnv {
  const APP_ENV = resolveAppEnv();

  if (isMockMode()) {
    return {
      VITE_API_BASE_URL: 'http://mock.local',
      VITE_AUTH_AUTHORITY: 'http://mock.local/auth',
      VITE_AUTH_CLIENT_ID: 'mock-client-id',
      VITE_AUTH_AUDIENCE: 'http://mock.local/api',
      APP_ENV,
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
    APP_ENV,
  };
}

export const env = validateEnv();
