import { describe, it, expect } from 'vitest';

/**
 * Tests the return path validation logic used in AuthCallback.
 * The callback validates that the OIDC state is a relative path starting with '/'
 * to prevent open redirect attacks.
 */

function resolveReturnPath(state: unknown): string {
  const isValidReturnPath =
    typeof state === 'string' &&
    state.length > 0 &&
    state.startsWith('/') &&
    !state.startsWith('//');
  return isValidReturnPath ? state : '/dashboard';
}

describe('Auth callback return path validation', () => {
  it('returns the state when it is a valid relative path', () => {
    expect(resolveReturnPath('/dashboard')).toBe('/dashboard');
    expect(resolveReturnPath('/settings/profile')).toBe('/settings/profile');
    expect(resolveReturnPath('/projects?tab=active')).toBe('/projects?tab=active');
    expect(resolveReturnPath('/onboarding#step2')).toBe('/onboarding#step2');
  });

  it('defaults to /dashboard when state is undefined', () => {
    expect(resolveReturnPath(undefined)).toBe('/dashboard');
  });

  it('defaults to /dashboard when state is null', () => {
    expect(resolveReturnPath(null)).toBe('/dashboard');
  });

  it('defaults to /dashboard when state is an empty string', () => {
    expect(resolveReturnPath('')).toBe('/dashboard');
  });

  it('defaults to /dashboard when state does not start with /', () => {
    expect(resolveReturnPath('https://evil.com')).toBe('/dashboard');
    expect(resolveReturnPath('http://attacker.io/steal')).toBe('/dashboard');
    expect(resolveReturnPath('//evil.com')).toBe('/dashboard');
    expect(resolveReturnPath('dashboard')).toBe('/dashboard');
  });

  it('defaults to /dashboard when state is a non-string type', () => {
    expect(resolveReturnPath(123)).toBe('/dashboard');
    expect(resolveReturnPath({})).toBe('/dashboard');
    expect(resolveReturnPath([])).toBe('/dashboard');
    expect(resolveReturnPath(true)).toBe('/dashboard');
  });

  it('accepts paths with query strings and fragments', () => {
    expect(resolveReturnPath('/page?foo=bar&baz=1')).toBe('/page?foo=bar&baz=1');
    expect(resolveReturnPath('/page#section')).toBe('/page#section');
    expect(resolveReturnPath('/page?q=1#top')).toBe('/page?q=1#top');
  });
});
