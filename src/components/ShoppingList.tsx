'use client'

import { Check, Trash2, ShoppingCart, Undo2 } from 'lucide-react'
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-400 text-lg">Your list is empty</p>
        <p className="text-gray-300 text-sm mt-1">Add items to get started</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          My List <span className="text-sm font-normal text-gray-400">({items.length} item{items.length > 1 ? 's' : ''})</span>
        </h2>
        {checked.length > 0 && (
          <button
            onClick={onValidatePurchases}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Check size={16} />
            Confirm purchases ({checked.length})
          </button>
        )}
      </div>

      {unchecked.length > 0 && (
        <div className="divide-y divide-gray-50">
          {unchecked.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}

      {checked.length > 0 && (
        <>
          <div className="px-4 sm:px-6 py-2 bg-gray-50">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">In cart</span>
          </div>
          <div className="divide-y divide-gray-50 opacity-60">
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
    <div className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-gray-50/50 transition-colors group">
      <button
        onClick={() => onToggle(item.id, !item.checked)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.checked
            ? 'bg-emerald-500 border-emerald-500 text-white'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {item.checked && <Check size={14} />}
      </button>

      <div className="flex-1 min-w-0">
        <span className={`text-gray-700 ${item.checked ? 'line-through text-gray-400' : ''}`}>
          {item.name}
        </span>
        {item.quantity > 1 && (
          <span className="ml-2 text-sm text-gray-400">x{item.quantity}</span>
        )}
      </div>

      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cat.color} hidden sm:inline-block`}>
        {cat.emoji} {cat.name}
      </span>
      <span className="sm:hidden text-sm">{cat.emoji}</span>

      {item.checked ? (
        <button
          onClick={() => onToggle(item.id, false)}
          className="p-1.5 text-gray-300 hover:text-amber-500 transition-colors opacity-0 group-hover:opacity-100"
          title="Put back on list"
        >
          <Undo2 size={16} />
        </button>
      ) : null}

      <button
        onClick={() => onDelete(item.id)}
        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
