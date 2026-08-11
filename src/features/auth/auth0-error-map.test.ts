import { describe, it, expect } from 'vitest';
import { mapAuth0Error } from './auth0-error-map';

describe('mapAuth0Error', () => {
  it('maps user_exists to email_already_registered key', () => {
    expect(mapAuth0Error('user_exists')).toBe('auth.errors.email_already_registered');
  });

  it('maps password_strength_error to password_too_weak key', () => {
    expect(mapAuth0Error('password_strength_error')).toBe('auth.errors.password_too_weak');
  });

  it('appends Auth0 description for password_strength_error when provided', () => {
    expect(mapAuth0Error('password_strength_error', 'Password is too weak')).toBe(
      'auth.errors.password_too_weak: Password is too weak',
    );
  });

  it('maps password_no_user_info_error to password_contains_user_info key', () => {
    expect(mapAuth0Error('password_no_user_info_error')).toBe(
      'auth.errors.password_contains_user_info',
    );
  });

  it('maps password_dictionary_error to password_too_common key', () => {
    expect(mapAuth0Error('password_dictionary_error')).toBe('auth.errors.password_too_common');
  });

  it('maps invalid_password to invalid_password key', () => {
    expect(mapAuth0Error('invalid_password')).toBe('auth.errors.invalid_password');
  });

  it('maps invalid_signup to invalid_signup key', () => {
    expect(mapAuth0Error('invalid_signup')).toBe('auth.errors.invalid_signup');
  });

  it('maps network_error to network_error key', () => {
    expect(mapAuth0Error('network_error')).toBe('auth.errors.network_error');
  });

  it('returns generic fallback for unknown error codes', () => {
    expect(mapAuth0Error('some_unknown_code')).toBe('auth.errors.generic');
    expect(mapAuth0Error('')).toBe('auth.errors.generic');
  });

  it('does not append description for non-password_strength_error codes', () => {
    expect(mapAuth0Error('user_exists', 'The user already exists.')).toBe(
      'auth.errors.email_already_registered',
    );
  });
});
