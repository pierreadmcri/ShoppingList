'use client'

import { Check, Trash2, ShoppingCart } from 'lucide-react'
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

  if (items.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-violet-100/50 p-10 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
          <ShoppingCart size={28} className="text-violet-400" />
        </div>
        <p className="text-gray-500 text-base font-medium">Your list is empty</p>
        <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header with count + confirm button */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-gray-700">
          My List <span className="text-sm font-normal text-gray-400">({items.length})</span>
        </h2>
        {checked.length > 0 && (
          <button
            onClick={onValidatePurchases}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-2xl text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-emerald-200 touch-press"
          >
            <Check size={16} strokeWidth={2.5} />
            Done ({checked.length})
          </button>
        )}
      </div>

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-violet-100/50 overflow-hidden divide-y divide-violet-50/50">
          {unchecked.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <>
          <div className="px-1 pt-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">In cart</span>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-emerald-100/50 overflow-hidden divide-y divide-emerald-50/30">
            {checked.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </>
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

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 active:bg-violet-50/50 transition-colors">
      {/* Checkbox - large touch target */}
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all touch-press ${
          item.checked
            ? 'bg-gradient-to-br from-emerald-400 to-teal-400 border-emerald-400 text-white shadow-sm shadow-emerald-200'
            : 'border-violet-200 hover:border-violet-400 active:border-violet-400'
        }`}
      >
        {item.checked && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Item info */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-lg">{cat.emoji}</span>
        <div className="min-w-0">
          <span className={`block text-[15px] leading-tight ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
            {item.name}
          </span>
          {(item.quantity > 1 || !item.checked) && (
            <span className="text-xs text-gray-400">
              {item.quantity > 1 && `x${item.quantity}`}
              {item.quantity > 1 && !item.checked && ' · '}
              {!item.checked && cat.name}
            </span>
          )}
        </div>
      </div>

      {/* Delete button - always visible on mobile */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 active:text-red-500 active:bg-red-50 transition-colors touch-press"
      >
        <Trash2 size={17} />
      </button>
    </div>
  )
}
