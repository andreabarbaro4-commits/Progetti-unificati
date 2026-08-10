import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose Tailwind classes with conditional logic and conflict resolution.
 * Accepts any combination of strings, arrays, objects, undefined, null, false.
 * Passes through clsx for normalization, then tailwind-merge for deduplication.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
