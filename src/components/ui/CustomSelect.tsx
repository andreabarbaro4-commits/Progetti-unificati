import { useState, useRef, useEffect, useCallback } from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  id?: string
  options: SelectOption[]
  value?: string
  placeholder?: string
  onChange: (value: string) => void
  onBlur?: () => void
  name?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

/**
 * A custom dropdown that renders options as regular DOM elements,
 * ensuring the app's web font (Open Runde) is applied to the option list.
 */
export function CustomSelect({
  id,
  options,
  value,
  placeholder = '—',
  onChange,
  onBlur,
  name,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selectedOption = options.find((o) => o.value === value)

  const close = useCallback(() => {
    setIsOpen(false)
    onBlur?.()
  }, [onBlur])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, close])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, close])

  function handleSelect(option: SelectOption) {
    onChange(option.value)
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen((prev) => !prev)
    } else if (e.key === 'ArrowDown' && !isOpen) {
      e.preventDefault()
      setIsOpen(true)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Hidden input for react-hook-form */}
      <input id={id} name={name} type="hidden" value={value ?? ''} />

      {/* Trigger button */}
      <button
        ref={triggerRef}
        aria-describedby={ariaDescribedby}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none text-left cursor-pointer font-[inherit]"
        role="combobox"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedOption ? 'text-black' : 'text-black/50'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <ul
          className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 max-h-60 overflow-auto list-none m-0 p-0"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              aria-selected={option.value === value}
              className="px-4 py-2 text-[16px] text-black cursor-pointer hover:bg-[#f1f1f9] transition-colors list-none"
              role="option"
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
