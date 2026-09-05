'use client'

import { useId, useRef, useState, type TouchEvent } from 'react'
import { Check, ChevronDown, Trash2, ShoppingBasket } from 'lucide-react'
import { ShoppingItem } from '@/lib/supabase'
import { CATEGORIES, getCategoryInfo } from '@/lib/categories'
import { resolveCategory } from '@/lib/products'

type Props = {
  items: ShoppingItem[]
  onToggle: (id: string, checked: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled?: boolean
}

export default function ShoppingList({ items, onToggle, onDelete, disabled = false }: Props) {
  const [cartExpanded, setCartExpanded] = useState(false)
  const cartId = useId()
  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)
  const total = items.length
  const progress = total === 0 ? 0 : Math.round((checked.length / total) * 100)
  const groups = CATEGORIES.map(category => ({
    ...category,
    items: unchecked.filter(item => getCategoryInfo(resolveCategory(item.name, item.category)).id === category.id),
  })).filter(group => group.items.length > 0)

  if (total === 0) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-sand dark:bg-olive/20 rounded-full flex items-center justify-center mb-4">
          <ShoppingBasket size={27} className="text-terracotta" aria-hidden="true" />
        </div>
        <p className="display-title text-xl text-ink dark:text-cream">Your list is empty</p>
        <p className="mt-1 text-sm text-taupe dark:text-sage">Add anything your household needs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-4">
      <div className="flex items-center gap-3 px-1">
        <ShoppingBasket size={20} className="shrink-0 text-terracotta" aria-hidden="true" />
        <h2 className="display-title text-[22px] text-ink dark:text-cream">
          {unchecked.length === 0 ? 'Everything is in your cart' : `${unchecked.length} to pick up`}
        </h2>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Shopping progress: ${checked.length} of ${total} items checked`}
          className="ml-auto h-1.5 bg-sand dark:bg-olive/30 rounded-full overflow-hidden w-16 shrink-0"
        >
          <div
            className="h-full bg-terracotta transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {groups.map(group => (
        <section key={group.id} aria-label={group.name}>
          <h3 className="mb-2 flex items-center gap-2 px-1 text-sm font-semibold text-olive dark:text-sage">
            <span aria-hidden="true">{group.emoji}</span>
            {group.name}
            <span className="ml-auto tabular-nums" aria-label={`${group.items.length} items`}>{group.items.length}</span>
          </h3>
          <div className="list-shell overflow-hidden">
            {group.items.map(item => (
              <SwipeableItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} disabled={disabled} />
            ))}
          </div>
        </section>
      ))}

      {checked.length > 0 && (
        <section aria-label="In cart" className="border-t border-gold/25 pt-1">
          <button
            type="button"
            aria-expanded={cartExpanded}
            aria-controls={cartId}
            onClick={() => setCartExpanded(expanded => !expanded)}
            className="flex min-h-12 w-full items-center gap-2 rounded-lg px-1 text-sm font-semibold text-olive dark:text-sage touch-press"
          >
            <Check size={18} aria-hidden="true" />
            <span>In cart</span>
            <span className="tabular-nums">({checked.length})</span>
            <ChevronDown size={18} aria-hidden="true" className={`ml-auto transition-transform motion-reduce:transition-none ${cartExpanded ? 'rotate-180' : ''}`} />
          </button>
          <div id={cartId} hidden={!cartExpanded} className="list-shell overflow-hidden">
            {cartExpanded && checked.map(item => (
              <SwipeableItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} disabled={disabled} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SwipeableItemRow({ item, onToggle, onDelete, disabled }: {
  item: ShoppingItem
  onToggle: (id: string, checked: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled: boolean
}) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const start = useRef({ x: 0, y: 0 })
  const direction = useRef<'pending' | 'horizontal' | 'vertical' | null>(null)
  const distance = useRef(0)
  const suppressClickUntil = useRef(0)

  const resetSwipe = () => {
    distance.current = 0
    direction.current = null
    setOffsetX(0)
    setSwiping(false)
  }

  const handleTouchStart = (event: TouchEvent) => {
    resetSwipe()
    if (disabled || event.touches.length !== 1) return
    start.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
    direction.current = 'pending'
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (disabled || event.touches.length !== 1) {
      resetSwipe()
      return
    }
    if (direction.current === null || direction.current === 'vertical') return
    const dx = event.touches[0].clientX - start.current.x
    const dy = event.touches[0].clientY - start.current.y

    if (direction.current === 'pending') {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 12) return
      // A diagonal or vertical gesture belongs to page scrolling.
      direction.current = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'horizontal' : 'vertical'
      if (direction.current === 'vertical') return
      setSwiping(true)
    }
    suppressClickUntil.current = Date.now() + 500
    distance.current = Math.max(-120, Math.min(120, dx))
    setOffsetX(distance.current)
  }

  const handleTouchEnd = () => {
    const completedDistance = direction.current === 'horizontal' ? distance.current : 0
    if (direction.current === 'horizontal') suppressClickUntil.current = Date.now() + 500
    resetSwipe()
    if (disabled) return
    if (completedDistance > 80) {
      void onToggle(item.id, !item.checked)
    } else if (completedDistance < -80) {
      void onDelete(item.id)
    }
  }

  return (
    <div className="relative overflow-hidden border-b border-gold/20 last:border-b-0">
      <div aria-hidden="true" className={`absolute inset-0 flex items-center px-5 ${offsetX > 30 ? 'opacity-100' : 'opacity-0'} bg-sand dark:bg-olive/40`}>
        <Check size={20} className="text-olive dark:text-sage" strokeWidth={3} />
        <span className="ml-2 text-sm font-semibold text-olive dark:text-sage">{item.checked ? 'Uncheck' : 'Check'}</span>
      </div>
      <div aria-hidden="true" className={`absolute inset-0 flex items-center justify-end px-5 ${offsetX < -30 ? 'opacity-100' : 'opacity-0'} bg-red-100 dark:bg-red-900/30`}>
        <span className="mr-2 text-sm font-semibold text-red-700 dark:text-red-300">Delete</span>
        <Trash2 size={20} className="text-red-700 dark:text-red-300" />
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetSwipe}
        onClickCapture={event => {
          if (Date.now() < suppressClickUntil.current && event.detail !== 0) {
            event.preventDefault()
            event.stopPropagation()
          }
        }}
        style={{ transform: `translateX(${offsetX}px)`, touchAction: 'pan-y pinch-zoom' }}
        className={`flex min-h-[76px] items-center gap-1 px-2 ${swiping ? '' : 'transition-transform duration-200 motion-reduce:transition-none'} ${
          item.checked ? 'bg-sand dark:bg-night' : 'bg-cream dark:bg-night'
        }`}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={item.checked}
          aria-label={`${item.name}, quantity ${item.quantity}`}
          disabled={disabled}
          onClick={() => void onToggle(item.id, !item.checked)}
          className="flex min-h-[76px] min-w-0 flex-1 items-center gap-1 rounded-xl py-3 text-left touch-press disabled:opacity-60"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center" aria-hidden="true">
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 ${
              item.checked ? 'border-olive bg-olive' : 'border-gold dark:border-sage/70'
            }`}>
              {item.checked && <Check size={15} className="text-white" strokeWidth={3} />}
            </span>
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block break-words text-[15px] font-semibold leading-snug ${
              item.checked ? 'text-olive dark:text-sage line-through' : 'text-ink dark:text-cream'
            }`}>
              {item.name}
            </span>
            <span className="mt-1 block text-sm font-semibold tabular-nums text-olive dark:text-sage">×{item.quantity}</span>
          </span>
        </button>
        <button
          type="button"
          aria-label={`Delete ${item.name}`}
          disabled={disabled}
          onClick={() => void onDelete(item.id)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-olive dark:text-sage hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-300 transition-colors touch-press disabled:opacity-60"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
