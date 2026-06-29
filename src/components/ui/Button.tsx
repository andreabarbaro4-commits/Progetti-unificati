import type { ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'dark' | 'light'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant
}

const baseClasses =
  'cursor-pointer rounded-full border-none px-[28px] py-[11px] text-[13px] font-semibold text-white [transition:all_0.2s_ease]'

const variantClasses: Record<ButtonVariant, string> = {
  dark: 'mr-[30px] bg-black hover:bg-[#232129]',
  light: 'border border-solid border-[#e5e7eb] bg-black hover:bg-[#f9fafb]',
}

/**
 * Pill-shaped button used throughout the onboarding flow.
 *
 * Both variants render on a black background by design; they differ only in
 * border and hover treatment. The `dark` variant keeps a trailing margin so it
 * sits away from the right edge when laid out in a flex row.
 */
export function Button({ variant, className, ...props }: ButtonProps) {
  const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ')

  return <button className={classes} {...props} />
}
