import { zodResolver } from '@hookform/resolvers/zod';
import type { UseFormProps } from 'react-hook-form';
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
 */
export function createFormConfig<T extends ZodSchema>(
  schema: T,
  options?: Partial<UseFormProps>,
): UseFormProps {
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
