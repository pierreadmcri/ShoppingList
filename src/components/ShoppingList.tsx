'use client'

import { useRef, useState } from 'react'
import { Check, Trash2, ShoppingBasket, ArrowRight } from 'lucide-react'
import { ShoppingItem } from '@/lib/supabase'
import { getCategoryInfo } from '@/lib/categories'

type Props = {
  items: ShoppingItem[]
  onToggle: (id: string, checked: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onValidatePurchases: () => Promise<void>
}

export default function ShoppingList({ items, onToggle, onDelete, onValidatePurchases }: Props) {
  const unchecked = items.filter(i => !i.checked)
  const checked = items.filter(i => i.checked)
  const total = items.length
  const progress = total === 0 ? 0 : Math.round((checked.length / total) * 100)

  if (total === 0) {
    return (
      <div className="empty-state">
        <div className="w-16 h-16 bg-sand dark:bg-olive/20 rounded-full flex items-center justify-center mb-4">
          <ShoppingBasket size={27} className="text-terracotta" />
        </div>
        <p className="display-title text-xl text-ink dark:text-cream">Your list is empty</p>
        <p className="mt-1 text-sm text-taupe dark:text-sage">Add anything your household needs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-4">
      {total > 0 && (
        <div className="flex items-center gap-3 px-1">
          <ShoppingBasket size={20} className="text-terracotta" />
          <h2 className="display-title text-[22px] text-ink dark:text-cream">{unchecked.length} to pick up</h2>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Shopping progress: ${checked.length} of ${total} items checked`}
            className="ml-auto h-1.5 bg-sand dark:bg-olive/30 rounded-full overflow-hidden w-20"
          >
            <div
              className="h-full bg-terracotta transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="list-shell overflow-hidden">
        {unchecked.map((item, i) => (
          <div key={item.id} className="animate-enter" style={{ animationDelay: `${i * 0.03}s` }}>
            <SwipeableItemRow item={item} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ))}
      </div>

      {checked.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-olive dark:text-sage uppercase tracking-widest">
              In cart ({checked.length})
            </h3>
            <button
              onClick={onValidatePurchases}
              className="hidden"
            >
              <Check size={14} strokeWidth={3} />
              Complete
            </button>
          </div>
          <div className="list-shell overflow-hidden opacity-70">
            {checked.map((item) => (
              <SwipeableItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
          <button
            onClick={onValidatePurchases}
            className="mt-4 w-full h-14 rounded-2xl bg-terracotta text-white font-bold flex items-center justify-between px-5 shadow-[0_10px_24px_-12px_rgba(201,75,38,0.8)] touch-press"
          >
            <ShoppingBasket size={21} />
            <span>Complete shopping</span>
            <ArrowRight size={21} />
          </button>
        </div>
      )}
    </div>
  )
}

function SwipeableItemRow({ item, onToggle, onDelete }: {
  item: ShoppingItem
  onToggle: (id: string, checked: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const locked = useRef(false)
  const rowRef = useRef<HTMLDivElement>(null)

  const THRESHOLD_CHECK = 80
  const THRESHOLD_DELETE = -80

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
    locked.current = false
    setSwiping(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return
    const dx = e.touches[0].clientX - startX.current
    const dy = e.touches[0].clientY - startY.current

    // Lock direction after 10px movement
    if (!locked.current && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
      setSwiping(false)
      setOffsetX(0)
      return
    }
    if (Math.abs(dx) > 10) locked.current = true

    // Clamp to [-120, 120]
    setOffsetX(Math.max(-120, Math.min(120, dx)))
  }

  const handleTouchEnd = () => {
    if (offsetX > THRESHOLD_CHECK) {
      onToggle(item.id, !item.checked)
    } else if (offsetX < THRESHOLD_DELETE) {
      onDelete(item.id)
    }
    setOffsetX(0)
    setSwiping(false)
    locked.current = false
  }

  const cat = getCategoryInfo(item.category)
  const isChecked = item.checked

  // Background indicators
  const showCheckBg = offsetX > 30
  const showDeleteBg = offsetX < -30

  return (
    <div className="relative overflow-hidden border-b border-gold/20 last:border-b-0">
      {/* Swipe backgrounds */}
      <div className={`absolute inset-0 flex items-center px-5 transition-opacity ${showCheckBg ? 'opacity-100' : 'opacity-0'} ${isChecked ? 'bg-sand dark:bg-olive/30' : 'bg-sage/30 dark:bg-olive/40'}`}>
        <Check size={20} className={isChecked ? 'text-amber-500' : 'text-emerald-500'} strokeWidth={3} />
        <span className={`ml-2 text-xs font-bold ${isChecked ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isChecked ? 'Uncheck' : 'Check'}
        </span>
      </div>
      <div className={`absolute inset-0 flex items-center justify-end px-5 transition-opacity ${showDeleteBg ? 'opacity-100' : 'opacity-0'} bg-red-100 dark:bg-red-900/30`}>
        <span className="mr-2 text-xs font-bold text-red-600 dark:text-red-400">Delete</span>
        <Trash2 size={20} className="text-red-500" />
      </div>

      {/* Foreground row */}
      <div
        ref={rowRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className={`flex items-center gap-3 min-h-[72px] px-4 py-3 transition-colors duration-200 ${
          isChecked
            ? 'bg-sand/40 dark:bg-olive/15'
            : 'bg-cream/85 dark:bg-night/80'
        }`}
      >
        <button
          onClick={() => onToggle(item.id, !isChecked)}
          className={`w-7 h-7 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all touch-press ${
            isChecked
              ? 'bg-olive border-olive scale-95'
              : 'border-gold/60 dark:border-sage/50 bg-transparent'
          }`}
        >
          {isChecked && <Check size={14} className="text-white" strokeWidth={4} />}
        </button>

        <div
          className="flex-1 flex items-center gap-3 overflow-hidden min-w-0 py-1 cursor-pointer"
          onClick={() => onToggle(item.id, !isChecked)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand/60 dark:bg-olive/25 text-xl flex-shrink-0">{cat.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-[15px] truncate transition-all ${
              isChecked ? 'text-taupe line-through' : 'text-ink dark:text-cream'
            }`}>
              {item.name}
            </p>
            <p className="text-[11px] text-taupe dark:text-sage">
              {cat.name} <span className="text-olive dark:text-sage font-bold ml-1">×{item.quantity}</span>
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="w-10 h-10 flex items-center justify-center text-gold/60 dark:text-sage/40 active:text-red-500 rounded-xl transition-colors touch-press"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
