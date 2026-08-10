import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, UseFormProps } from 'react-hook-form';
import { z, type ZodSchema, ZodIssueCode } from 'zod';
import { isMockMode } from '../mock';

// Custom error map that produces i18n translation keys
export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === 'undefined') return { message: 'validation.required' };
      return { message: 'validation.invalid_type' };
    case ZodIssueCode.too_small:
      return { message: 'validation.field_too_short' };
    case ZodIssueCode.too_big:
      return { message: 'validation.field_too_long' };
    case ZodIssueCode.invalid_string:
      if (issue.validation === 'email') return { message: 'validation.email_invalid' };
      return { message: 'validation.invalid_format' };
    default:
      return { message: ctx.defaultError };
  }
};

// Set globally
z.setErrorMap(zodErrorMap);

/**
 * Creates form config with zod resolver and standard options.
 * In mock mode (VITE_MOCK=true), validation is completely bypassed
 * so all forms are progressible without filling mandatory fields.
 *
 * Generic over the schema's inferred type `T`, so the returned
 * `UseFormProps<T>` lines up with `useForm<T>(...)` at every call site
 * instead of widening to the default `FieldValues` bag (which is what
 * happened when this returned an untyped `UseFormProps`).
 */
export function createFormConfig<T extends FieldValues>(
  schema: ZodSchema<T>,
  options?: Partial<UseFormProps<T>>,
): UseFormProps<T> {
  // In mock mode, skip the resolver entirely — forms submit without validation
  if (isMockMode()) {
    return {
      mode: 'onBlur',
      reValidateMode: 'onChange',
      ...options,
    };
  }

  return {
    resolver: zodResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    ...options,
  };
}
