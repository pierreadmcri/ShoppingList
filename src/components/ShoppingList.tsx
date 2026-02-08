'use client'

import { useRef, useState } from 'react'
import { Check, Trash2, ShoppingBag } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-16 text-center opacity-60">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">List is empty</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-4">
      {total > 0 && (
        <div className="px-2 sticky top-[72px] z-10 bg-gradient-to-b from-[var(--bg-main)] via-[var(--bg-main)] to-transparent pb-4 pt-2">
          <div className="h-1.5 bg-slate-200/60 dark:bg-slate-700/60 rounded-full overflow-hidden w-full">
            <div
              className="h-full bg-violet-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {unchecked.map((item, i) => (
          <div key={item.id} className="animate-enter" style={{ animationDelay: `${i * 0.03}s` }}>
            <SwipeableItemRow item={item} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ))}
      </div>

      {checked.length > 0 && (
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              In Cart ({checked.length})
            </h3>
            <button
              onClick={onValidatePurchases}
              className="pl-3 pr-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-200/40 dark:shadow-none active:bg-emerald-600 transition-all flex items-center gap-2 touch-press"
            >
              <Check size={14} strokeWidth={3} />
              Checkout
            </button>
          </div>
          <div className="space-y-2 opacity-70">
            {checked.map((item) => (
              <SwipeableItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
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
    <div className="relative overflow-hidden rounded-2xl">
      {/* Swipe backgrounds */}
      <div className={`absolute inset-0 flex items-center px-5 rounded-2xl transition-opacity ${showCheckBg ? 'opacity-100' : 'opacity-0'} ${isChecked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
        <Check size={20} className={isChecked ? 'text-amber-500' : 'text-emerald-500'} strokeWidth={3} />
        <span className={`ml-2 text-xs font-bold ${isChecked ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {isChecked ? 'Uncheck' : 'Check'}
        </span>
      </div>
      <div className={`absolute inset-0 flex items-center justify-end px-5 rounded-2xl transition-opacity ${showDeleteBg ? 'opacity-100' : 'opacity-0'} bg-red-100 dark:bg-red-900/30`}>
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
        className={`flex items-center gap-3 p-3 pl-4 rounded-2xl border transition-colors duration-200 ${
          isChecked
            ? 'bg-slate-50 dark:bg-slate-800/50 border-transparent'
            : 'bg-white dark:bg-slate-800 border-white dark:border-slate-700 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] dark:shadow-none'
        }`}
      >
        <button
          onClick={() => onToggle(item.id, !isChecked)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all touch-press ${
            isChecked
              ? 'bg-emerald-500 border-emerald-500 scale-95'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
          }`}
        >
          {isChecked && <Check size={14} className="text-white" strokeWidth={4} />}
        </button>

        <div
          className="flex-1 flex items-center gap-3 overflow-hidden min-w-0 py-1 cursor-pointer"
          onClick={() => onToggle(item.id, !isChecked)}
        >
          <span className="text-lg flex-shrink-0">{cat.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className={`font-semibold text-[15px] truncate transition-all ${
              isChecked ? 'text-slate-400 dark:text-slate-500 line-through decoration-slate-300 dark:decoration-slate-600' : 'text-slate-700 dark:text-slate-200'
            }`}>
              {item.name}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {cat.name} {item.quantity > 1 && <span className="text-violet-500 font-bold ml-1">x{item.quantity}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="w-10 h-10 flex items-center justify-center text-slate-300 dark:text-slate-600 active:text-red-500 active:bg-red-50 dark:active:bg-red-900/20 rounded-xl transition-colors touch-press"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
