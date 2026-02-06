'use client'

import { useState } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
}

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('Other')
  const [loading, setLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onAdd(name.trim(), quantity, category)
    setName('')
    setQuantity(1)
    setCategory('Other')
    setLoading(false)
  }

  const selectedCat = CATEGORIES.find(c => c.name === category) || CATEGORIES[CATEGORIES.length - 1]

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-violet-100/50 p-4">
      {/* Main input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add an item..."
          className="flex-1 px-4 py-3.5 rounded-2xl bg-violet-50/50 border border-violet-100 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-700 placeholder-gray-400 text-base"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all flex items-center justify-center shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 disabled:shadow-none touch-press"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Options toggle */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1.5 mt-2.5 ml-1 text-xs text-violet-400 hover:text-violet-600 transition-colors"
      >
        <span>{selectedCat.emoji} {selectedCat.name}</span>
        {quantity > 1 && <span className="text-gray-400">x{quantity}</span>}
        <ChevronDown size={14} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable options */}
      {showOptions && (
        <div className="mt-3 flex gap-2 animate-in slide-in-from-top-1">
          <div className="flex items-center gap-2 bg-violet-50/50 rounded-2xl border border-violet-100 px-3 py-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-white border border-violet-100 text-violet-500 flex items-center justify-center text-lg font-medium touch-press"
            >
              -
            </button>
            <span className="w-8 text-center font-semibold text-gray-700">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white border border-violet-100 text-violet-500 flex items-center justify-center text-lg font-medium touch-press"
            >
              +
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-3 py-2 rounded-2xl bg-violet-50/50 border border-violet-100 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-700 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  )
}
