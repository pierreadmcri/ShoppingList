'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, ScanLine } from 'lucide-react'
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
    <div className="add-panel" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 w-12 flex-shrink-0 bg-terracotta disabled:bg-sand disabled:text-taupe text-white rounded-full flex items-center justify-center transition-all shadow-sm disabled:shadow-none touch-press"
            aria-label="Add item"
          >
            <Plus size={24} strokeWidth={2.25} />
          </button>
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
              placeholder="Add something"
              className="w-full h-12 px-2 bg-transparent border-0 outline-none text-ink dark:text-cream placeholder:text-taupe dark:placeholder:text-sage/60 font-medium text-[16px]"
              autoComplete="off"
              enterKeyHint="done"
            />

            {/* Autocomplete dropdown */}
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-full -left-14 right-0 mt-3 bg-cream dark:bg-night rounded-2xl shadow-xl border border-gold/30 z-30 max-h-52 overflow-y-auto scrollbar-hide">
                {filtered.slice(0, 8).map((s) => {
                  const cat = getCategoryInfo(s.category)
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-sand dark:active:bg-olive/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <span className="text-base">{cat.emoji}</span>
                      <span className="text-sm font-medium text-ink dark:text-cream flex-1 truncate">{s.name}</span>
                      <span className="text-[10px] text-taupe dark:text-sage">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <ScanLine size={21} className="mr-2 flex-shrink-0 text-olive dark:text-sage" />
        </div>

        <div className="mt-3 flex gap-2 border-t border-gold/20 pt-3 h-10">
          <div className="flex items-center bg-sand/55 dark:bg-olive/20 rounded-full p-1 w-24 justify-between">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-full flex items-center justify-center text-olive dark:text-sage active:text-terracotta rounded-full touch-press"
            >
              -
            </button>
            <span className="text-sm font-bold text-ink dark:text-cream">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-full flex items-center justify-center text-olive dark:text-sage active:text-terracotta rounded-full touch-press"
            >
              +
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="absolute inset-0 w-full h-full bg-sand/55 dark:bg-olive/20 rounded-full flex items-center px-3 gap-2 pointer-events-none">
              <span className="text-lg">{selectedCatInfo.emoji}</span>
              <span className="text-xs font-bold text-olive dark:text-sage flex-1 truncate">
                {selectedCatInfo.name}
              </span>
              <ChevronDown size={14} className="text-taupe" />
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
