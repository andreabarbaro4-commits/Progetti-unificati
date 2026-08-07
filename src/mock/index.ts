/**
 * Mock mode detection — single source of truth.
 * Returns true only when VITE_MOCK is explicitly set to "true".
 */
export function isMockMode(): boolean {
  return import.meta.env.VITE_MOCK === 'true';
}
