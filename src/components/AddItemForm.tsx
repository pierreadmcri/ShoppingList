'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [justAdded, setJustAdded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    await onAdd(name.trim(), quantity, category)
    setName('')
    setQuantity(1)
    setCategory('Other')
    setLoading(false)
    setJustAdded(true)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (justAdded) {
      const t = setTimeout(() => setJustAdded(false), 1500)
      return () => clearTimeout(t)
    }
  }, [justAdded])

  const selectedCat = CATEGORIES.find(c => c.name === category) || CATEGORIES[CATEGORIES.length - 1]

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      {/* Main input row */}
      <div className="flex gap-2.5">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add an item..."
            className="w-full px-4 py-3.5 rounded-2xl bg-violet-50/40 border border-violet-100/60 focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-700 placeholder-violet-300 text-base"
            autoComplete="off"
          />
          {justAdded && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-medium animate-pulse">
              Added!
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600 disabled:from-gray-200 disabled:via-gray-200 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all flex items-center justify-center shadow-lg shadow-violet-300/30 hover:shadow-xl hover:shadow-violet-400/30 disabled:shadow-none touch-press"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* Options toggle */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="flex items-center gap-1.5 mt-3 ml-1 text-xs text-violet-400/70 hover:text-violet-600 transition-colors"
      >
        <span className="bg-violet-50/60 px-2 py-0.5 rounded-lg">{selectedCat.emoji} {selectedCat.name}</span>
        {quantity > 1 && <span className="bg-violet-50/60 px-2 py-0.5 rounded-lg">x{quantity}</span>}
        <ChevronDown size={14} className={`transition-transform duration-200 ${showOptions ? 'rotate-180' : ''}`} />
      </button>

      {/* Expandable options */}
      {showOptions && (
        <div className="mt-3 flex gap-2.5">
          <div className="flex items-center gap-1.5 bg-violet-50/40 rounded-2xl border border-violet-100/40 px-2.5 py-2">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-xl bg-white border border-violet-100/60 text-violet-500 flex items-center justify-center text-lg font-medium touch-press shadow-sm"
            >
              -
            </button>
            <span className="w-8 text-center font-bold text-violet-600">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-xl bg-white border border-violet-100/60 text-violet-500 flex items-center justify-center text-lg font-medium touch-press shadow-sm"
            >
              +
            </button>
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-3 py-2 rounded-2xl bg-violet-50/40 border border-violet-100/40 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all text-gray-600 text-sm"
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
