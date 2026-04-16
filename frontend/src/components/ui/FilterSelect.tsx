import { ChevronDown } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils/cn'

export type FilterSelectOption = { value: string; label: string }

export type FilterSelectProps = {
  id?: string
  'aria-labelledby'?: string
  'aria-label'?: string
  options: FilterSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  /** `sm` for dense table / toolbar controls */
  size?: 'md' | 'sm'
}

export function FilterSelect({
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled,
  className,
  buttonClassName,
  size = 'md',
}: FilterSelectProps) {
  const uid = useId()
  const listboxId = `${uid}-listbox`
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedOpt = options.find((o) => o.value === value)
  const displayLabel = selectedOpt?.label ?? (value ? value : placeholder)

  const updateCoords = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.max(r.width, 168)
    setCoords({ top: r.bottom + 6, left: r.left, width })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
    const onScroll = () => updateCoords()
    const onResize = () => updateCoords()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, updateCoords])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const n = e.target as Node
      if (triggerRef.current?.contains(n)) return
      if (menuRef.current?.contains(n)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const padY = size === 'sm' ? 'py-1.5' : 'py-2.5'
  const textSz = size === 'sm' ? 'text-xs' : 'text-sm'
  const chevronSz = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  const menu =
    open && coords && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={ariaLabelledBy}
            aria-label={ariaLabelledBy ? undefined : ariaLabel ?? 'Options'}
            className={cn(
              'fixed z-[1000] max-h-64 overflow-y-auto overflow-x-hidden rounded-xl border border-surface-border',
              'bg-premium-card-light py-1 shadow-xl ring-1 ring-black/[0.06] dark:bg-premium-card-dark dark:ring-white/[0.08]',
              textSz,
            )}
            style={{
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxWidth: 'min(100vw - 16px, 420px)',
            }}
          >
            {options.map((o) => {
              const isSelected = o.value === value
              return (
                <button
                  key={o.value === '' ? '__all__' : o.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex w-full items-center px-3 py-2.5 text-left transition-colors',
                    'text-ink outline-none',
                    'hover:bg-amber-500/14 focus:bg-amber-500/14 dark:hover:bg-amber-400/12 dark:focus:bg-amber-400/12',
                    isSelected &&
                      'bg-amber-500/20 font-semibold text-ink dark:bg-amber-400/16 dark:text-ink',
                    size === 'sm' && 'py-2',
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(o.value)
                    setOpen(false)
                  }}
                >
                  {o.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )
      : null

  return (
    <div className={cn('relative', className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        onClick={() => {
          if (disabled) return
          setOpen((v) => !v)
        }}
        className={cn(
          'flex w-full min-w-0 items-center gap-2 rounded-xl border border-surface-border bg-field px-3 text-left text-ink outline-none transition',
          'hover:border-amber-500/35 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25',
          'dark:focus:border-amber-400/45 dark:focus:ring-amber-400/20',
          disabled && 'cursor-not-allowed opacity-50',
          padY,
          textSz,
          buttonClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(chevronSz, 'shrink-0 text-ink-subtle transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  )
}
