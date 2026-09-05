'use client'

import { useLayoutEffect, useRef } from 'react'
import { ShoppingBasket, ChartNoAxesColumnIncreasing, ArrowRight, LoaderCircle, X } from 'lucide-react'

export type View = 'list' | 'stats'

type Props = {
  view: View
  onChange: (v: View) => void
  listBadge?: number
  checkedCount: number
  isCompleting: boolean
  isBusy: boolean
  onComplete: () => Promise<void>
  message?: string
  isError: boolean
  onUndo?: () => Promise<void>
  onDismiss: () => void
  onHeightChange: (height: number) => void
}

export default function BottomNav({
  view, onChange, listBadge = 0, checkedCount, isCompleting, isBusy,
  onComplete, message, isError, onUndo, onDismiss, onHeightChange,
}: Props) {
  const dockRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const dock = dockRef.current
    if (!dock) return
    const measure = () => onHeightChange(dock.getBoundingClientRect().height)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(dock)
    return () => observer.disconnect()
  }, [onHeightChange])

  return (
    <div
      ref={dockRef}
      className="fixed bottom-0 inset-x-0 z-30 safe-bottom pt-2 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto px-3">
        <div className="bottom-bar p-1.5 pointer-events-auto">
          {message && (
            <div className="flex items-center gap-2 border-b border-gold/25 px-2 pb-2 mb-1.5">
              <p role={isError ? 'alert' : 'status'} className={`min-w-0 flex-1 break-words text-sm ${isError ? 'text-red-700' : 'text-olive'}`}>
                {message}
              </p>
              {onUndo && (
                <button type="button" onClick={onUndo} disabled={isBusy || isCompleting}
                  className="min-h-11 px-3 rounded-xl text-sm font-bold text-olive underline underline-offset-4 touch-press disabled:opacity-50">
                  Undo
                </button>
              )}
              <button type="button" onClick={onDismiss} aria-label="Dismiss message"
                className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl text-taupe touch-press">
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}
          {view === 'list' && checkedCount > 0 && (
            <button type="button" onClick={onComplete} disabled={isCompleting || isBusy}
              aria-label={isCompleting ? 'Saving purchases' : `Complete shopping, ${checkedCount} items in cart`}
              aria-busy={isCompleting}
              className="w-full min-h-14 rounded-2xl bg-terracotta text-white flex items-center gap-3 px-4 py-2 mb-1.5 touch-press disabled:opacity-60 disabled:cursor-wait">
              {isCompleting ? <LoaderCircle size={22} className="animate-spin shrink-0" aria-hidden="true" /> : <ShoppingBasket size={22} className="shrink-0" aria-hidden="true" />}
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold">{isCompleting ? 'Saving purchases…' : 'Complete shopping'}</span>
                <span className="block text-xs text-white/90">{checkedCount} {checkedCount === 1 ? 'item' : 'items'} in cart</span>
              </span>
              {!isCompleting && <ArrowRight size={20} className="shrink-0" aria-hidden="true" />}
            </button>
          )}
          <nav aria-label="Primary" className="flex gap-1">
          <TabButton
            active={view === 'list'}
            onClick={() => onChange('list')}
            icon={<ShoppingBasket size={20} strokeWidth={2.2} />}
            label="List"
            badge={listBadge}
          />
          <TabButton
            active={view === 'stats'}
            onClick={() => onChange('stats')}
            icon={<ChartNoAxesColumnIncreasing size={20} strokeWidth={2.2} />}
            label="Stats"
          />
          </nav>
        </div>
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  badge = 0,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`relative flex-1 flex items-center justify-center gap-2 h-12 rounded-full font-semibold text-sm transition-all touch-press ${
        active
          ? 'bg-sand text-ink'
          : 'text-olive dark:text-sage active:bg-sand dark:active:bg-olive/30'
      }`}
    >
      <span aria-hidden="true" className="relative flex items-center justify-center">
        {icon}
        {badge > 0 && !active && (
          <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-cobalt text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </button>
  )
}
