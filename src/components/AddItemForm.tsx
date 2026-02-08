'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown } from 'lucide-react'
import { CATEGORIES, getCategoryInfo } from '@/lib/categories'

type Suggestion = { name: string; category: string }

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
  suggestions?: Suggestion[]
}

export default function AddItemForm({ onAdd, suggestions = [] }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1].name)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setShowSuggestions(false)
    await onAdd(name.trim(), quantity, category)
    setName('')
    setQuantity(1)
    setCategory(CATEGORIES[CATEGORIES.length - 1].name)
    setLoading(false)
    inputRef.current?.focus()
  }

  const handleSelectSuggestion = (s: Suggestion) => {
    setName(s.name)
    setCategory(s.category || CATEGORIES[CATEGORIES.length - 1].name)
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const filtered = name.trim().length >= 1
    ? suggestions.filter(s => s.name.toLowerCase().includes(name.trim().toLowerCase()))
    : []

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedCatInfo = getCategoryInfo(category)

  return (
    <div className="card p-3" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Add item..."
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-violet-500/30 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-[16px]"
              autoComplete="off"
              enterKeyHint="done"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-30 max-h-52 overflow-y-auto scrollbar-hide">
                {filtered.slice(0, 8).map((s) => {
                  const cat = getCategoryInfo(s.category)
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-50 dark:hover:bg-slate-700 active:bg-violet-100 dark:active:bg-slate-600 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1 truncate">{s.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 w-12 flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-violet-200 dark:shadow-none disabled:shadow-none touch-press"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex gap-3 h-11">
          <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 p-1 w-24 justify-between">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-full flex items-center justify-center text-slate-400 active:text-violet-600 rounded-lg touch-press"
            >
              -
            </button>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-full flex items-center justify-center text-slate-400 active:text-violet-600 rounded-lg touch-press"
            >
              +
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 flex items-center px-3 gap-2 pointer-events-none">
              <span className="text-lg">{selectedCatInfo.emoji}</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex-1 truncate">
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
