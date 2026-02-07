'use client'

import { useState, useRef } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { CATEGORIES, getCategoryInfo } from '@/lib/categories'

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
}

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].name) // Default: Other
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onAdd(name.trim(), quantity, category)
    setName('')
    setQuantity(1)
    // On peut remettre la catégorie par défaut 'Other' ou garder la dernière utilisée
    setCategory(CATEGORIES[CATEGORIES.length - 1].name)
    setLoading(false)
    inputRef.current?.focus()
  }

  const selectedCatInfo = getCategoryInfo(category)

  return (
    <div className="card p-3">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add item..."
            className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/30 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium text-[16px]" 
            autoComplete="off"
            enterKeyHint="done"
          />

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 w-12 flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-violet-200 disabled:shadow-none touch-press"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-3 h-11">
          <div className="flex items-center bg-slate-50 rounded-xl ring-1 ring-slate-200 p-1 w-24 justify-between">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-full flex items-center justify-center text-slate-400 active:text-violet-600 rounded-lg touch-press"
            >
              -
            </button>
            <span className="text-sm font-bold text-slate-700">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-full flex items-center justify-center text-slate-400 active:text-violet-600 rounded-lg touch-press"
            >
              +
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 w-full h-full bg-slate-50 rounded-xl ring-1 ring-slate-200 flex items-center px-3 gap-2 pointer-events-none">
                <span className="text-lg">{selectedCatInfo.emoji}</span>
                <span className="text-xs font-bold text-slate-600 flex-1 truncate">
                    {selectedCatInfo.name}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
            </div>

            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-full opacity-0 z-10 absolute inset-0 text-[16px]"
            >
                {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                        {cat.emoji} {cat.name}
                    </option>
                ))}
            </select>
          </div>
        </div>
      </form>
    </div>
  )
}