'use client'

import { Check, Trash2, ShoppingCart, ShoppingBag } from 'lucide-react'
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
      <div className="card p-10 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-100 via-purple-100 to-fuchsia-100 rounded-3xl flex items-center justify-center mb-5 shadow-inner">
          <ShoppingCart size={32} className="text-violet-400" />
        </div>
        <p className="text-gray-500 text-base font-semibold">Your list is empty</p>
        <p className="text-violet-300 text-sm mt-1.5">Add your first item above</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-gray-700">
          Shopping List
        </h2>
        {checked.length > 0 && (
          <button
            onClick={onValidatePurchases}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-200/50 touch-press"
          >
            <ShoppingBag size={15} strokeWidth={2.5} />
            Checkout ({checked.length})
          </button>
        )}
      </div>

      {/* Unchecked items */}
      {unchecked.length > 0 && (
        <div className="card overflow-hidden divide-y divide-violet-50/40">
          {unchecked.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* Checked items */}
      {checked.length > 0 && (
        <>
          <div className="flex items-center gap-2 px-1 pt-3">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Check size={10} className="text-emerald-500" strokeWidth={3} />
            </div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">In cart ({checked.length})</span>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-emerald-100/30 overflow-hidden divide-y divide-emerald-50/20">
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
    <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${item.checked ? 'bg-emerald-50/20' : 'active:bg-violet-50/40'}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all touch-press ${
          item.checked
            ? 'bg-gradient-to-br from-emerald-400 to-teal-400 border-emerald-400 text-white shadow-sm shadow-emerald-200/50'
            : 'border-violet-200/60 active:border-violet-400'
        }`}
      >
        {item.checked && <Check size={14} strokeWidth={3} />}
      </button>

      {/* Item info */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        <span className="text-xl flex-shrink-0">{cat.emoji}</span>
        <div className="min-w-0">
          <span className={`block text-[15px] leading-tight font-medium ${item.checked ? 'line-through text-gray-400/80' : 'text-gray-700'}`}>
            {item.name}
          </span>
          {(item.quantity > 1 || !item.checked) && (
            <span className="text-xs text-violet-300">
              {item.quantity > 1 && `x${item.quantity}`}
              {item.quantity > 1 && !item.checked && ' · '}
              {!item.checked && cat.name}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-violet-200 hover:text-red-400 active:text-red-500 active:bg-red-50/50 transition-colors touch-press"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
