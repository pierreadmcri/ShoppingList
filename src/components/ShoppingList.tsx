'use client'

import { useState, type TouchEvent } from 'react'
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
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <ShoppingBag size={28} className="text-slate-400" />
        </div>
        <p className="text-slate-500 font-medium">Liste vide</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-4">
      {total > 0 && (
        <div className="px-2 sticky top-[72px] z-10 bg-gradient-to-b from-[#f8fafc] via-[#f8fafc] to-transparent pb-4 pt-2">
          <div className="h-1.5 bg-slate-200/60 rounded-full overflow-hidden w-full">
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
            <ItemRow item={item} onToggle={onToggle} onDelete={onDelete} />
          </div>
        ))}
      </div>

      {checked.length > 0 && (
        <div className="pt-6 border-t border-slate-200/50">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Panier ({checked.length})
            </h3>

            <button
              onClick={onValidatePurchases}
              className="pl-3 pr-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-200/40 active:bg-emerald-600 transition-all flex items-center gap-2 touch-press"
            >
              <Check size={14} strokeWidth={3} />
              Valider
            </button>
          </div>

          <div className="space-y-2 opacity-70">
            {checked.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, onToggle, onDelete }: {
  item: ShoppingItem
  onToggle: (id: string, checked: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const cat = getCategoryInfo(item.category)
  const isChecked = item.checked
  const [dragX, setDragX] = useState(0)
  const [startX, setStartX] = useState<number | null>(null)

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setStartX(event.touches[0].clientX)
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (startX === null) return

    const delta = event.touches[0].clientX - startX
    setDragX(Math.max(-96, Math.min(96, delta)))
  }

  const handleTouchEnd = () => {
    if (dragX > 70) {
      onToggle(item.id, !isChecked)
    } else if (dragX < -70) {
      onDelete(item.id)
    }

    setDragX(0)
    setStartX(null)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 flex items-center justify-between px-4 text-xs font-bold uppercase tracking-wider pointer-events-none">
        <span className="text-emerald-600">Glisser → cocher</span>
        <span className="text-red-500">Supprimer ←</span>
      </div>

      <div
        className={`relative flex items-center gap-3 p-3 pl-4 rounded-2xl border transition-all duration-200 ${
          isChecked
            ? 'bg-slate-50 border-transparent'
            : 'bg-white border-white shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]'
        }`}
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={() => onToggle(item.id, !isChecked)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all touch-press ${
            isChecked
              ? 'bg-emerald-500 border-emerald-500 scale-95'
              : 'border-slate-300 bg-white'
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
              isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'
            }`}>
              {item.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {cat.name} {item.quantity > 1 && <span className="text-violet-500 font-bold ml-1">x{item.quantity}</span>}
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(item.id)
          }}
          className="w-10 h-10 flex items-center justify-center text-slate-300 active:text-red-500 active:bg-red-50 rounded-xl transition-colors touch-press"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  )
}
