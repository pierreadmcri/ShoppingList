'use client'

import { useState, useRef, useEffect, useId } from 'react'
import { Plus, Minus, ChevronDown, LoaderCircle } from 'lucide-react'
import { CATEGORIES, getCategoryInfo } from '@/lib/categories'
import { identifyProduct, inferCategory, matchesProductSearch, resolveCategory, type ProductCategory } from '@/lib/products'

type Suggestion = { name: string; category: string }

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
  suggestions?: Suggestion[]
}

export default function AddItemForm({ onAdd, suggestions = [] }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null)
  const recognizedProduct = identifyProduct(name)
  const category = selectedCategory ?? inferCategory(name)
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const suggestionsId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading) return

    setLoading(true)
    setShowSuggestions(false)
    try {
      await onAdd(name.trim(), quantity, category)
      setName('')
      setQuantity(1)
      setSelectedCategory(null)
      setActiveSuggestion(-1)
    } catch {
      // The parent reports the error; preserve the draft so it can be retried.
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSelectSuggestion = (s: Suggestion) => {
    setName(s.name)
    setSelectedCategory(resolveCategory(s.name, s.category))
    setShowSuggestions(false)
    setActiveSuggestion(-1)
    inputRef.current?.focus()
  }

  const filtered = name.trim().length >= 1
    ? suggestions.filter(s => matchesProductSearch(s.name, name)).slice(0, 8)
    : []
  const suggestionsOpen = showSuggestions && filtered.length > 0 && !loading

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && filtered.length > 0) {
      event.preventDefault()
      setShowSuggestions(true)
      setActiveSuggestion(current => {
        if (!suggestionsOpen || current < 0) return event.key === 'ArrowDown' ? 0 : filtered.length - 1
        return (current + (event.key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length
      })
    } else if (event.key === 'Enter' && suggestionsOpen && activeSuggestion >= 0 && filtered[activeSuggestion]) {
      event.preventDefault()
      handleSelectSuggestion(filtered[activeSuggestion])
    } else if (event.key === 'Escape') {
      setShowSuggestions(false)
      setActiveSuggestion(-1)
    }
  }

  useEffect(() => {
    if (suggestionsOpen && activeSuggestion >= 0) {
      document.getElementById(`${suggestionsId}-${activeSuggestion}`)?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeSuggestion, suggestionsOpen, suggestionsId])

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
      <form onSubmit={handleSubmit} aria-label="Add a shopping item" aria-busy={loading}>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 w-12 flex-shrink-0 bg-terracotta disabled:bg-sand disabled:text-taupe text-white rounded-full flex items-center justify-center transition-all shadow-sm disabled:shadow-none touch-press"
            aria-label={loading ? 'Adding item' : 'Add item'}
          >
            {loading ? <LoaderCircle size={24} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus size={24} strokeWidth={2.25} aria-hidden="true" />}
          </button>
          <div className="min-w-0 flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={name}
              readOnly={loading}
              aria-label="Item name"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
              aria-controls={suggestionsOpen ? suggestionsId : undefined}
              aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 && filtered[activeSuggestion] ? `${suggestionsId}-${activeSuggestion}` : undefined}
              onChange={(e) => {
                setName(e.target.value)
                setSelectedCategory(null)
                setShowSuggestions(true)
                setActiveSuggestion(-1)
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setShowSuggestions(false)
                setActiveSuggestion(-1)
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Add something"
              className="w-full h-12 px-2 bg-transparent border-0 outline-none text-ink dark:text-cream placeholder:text-taupe dark:placeholder:text-sage/60 font-medium text-[16px]"
              autoComplete="off"
              enterKeyHint="done"
            />

            {/* Autocomplete dropdown */}
            {suggestionsOpen && (
              <div id={suggestionsId} role="listbox" aria-label="Previously added items" className="absolute top-full -left-14 right-0 mt-3 bg-cream dark:bg-night rounded-2xl shadow-xl border border-gold/30 z-30 max-h-52 overflow-y-auto scrollbar-hide">
                {filtered.map((s, index) => {
                  const cat = getCategoryInfo(s.category)
                  return (
                    <button
                      key={`${s.name}-${index}`}
                      id={`${suggestionsId}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={activeSuggestion === index}
                      tabIndex={-1}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(s)}
                      className={`w-full min-h-11 flex items-center gap-3 px-4 py-3 text-left hover:bg-sand dark:hover:bg-olive/30 active:bg-sand dark:active:bg-olive/30 transition-colors first:rounded-t-2xl last:rounded-b-2xl ${activeSuggestion === index ? 'bg-sand dark:bg-olive/30' : ''}`}
                    >
                      <span className="text-base" aria-hidden="true">{cat.emoji}</span>
                      <span className="text-sm font-medium text-ink dark:text-cream flex-1 truncate">{s.name}</span>
                      <span className="text-xs text-olive dark:text-sage">{cat.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2 border-t border-gold/20 pt-3">
          <div role="group" aria-label="Quantity" className="flex shrink-0 items-center bg-sand/55 dark:bg-olive/20 rounded-full justify-between">
            <button
              type="button"
              onClick={() => setQuantity(current => Math.max(1, current - 1))}
              disabled={loading || quantity <= 1}
              aria-label="Decrease quantity"
              className="w-11 h-11 flex items-center justify-center text-olive dark:text-sage active:text-terracotta disabled:opacity-40 rounded-full touch-press"
            >
              <Minus size={16} aria-hidden="true" />
            </button>
            <output aria-label="Quantity" aria-live="polite" className="min-w-5 text-center text-sm font-bold tabular-nums text-ink dark:text-cream">{quantity}</output>
            <button
              type="button"
              onClick={() => setQuantity(current => current + 1)}
              disabled={loading}
              aria-label="Increase quantity"
              className="w-11 h-11 flex items-center justify-center text-olive dark:text-sage active:text-terracotta disabled:opacity-40 rounded-full touch-press"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="min-w-0 min-h-11 flex-1 relative rounded-full focus-within:ring-2 focus-within:ring-terracotta focus-within:ring-offset-2">
            <div aria-hidden="true" className="absolute inset-0 w-full h-full bg-sand/55 dark:bg-olive/20 rounded-full flex items-center px-3 gap-2 pointer-events-none">
              <span className="text-lg">{selectedCatInfo.emoji}</span>
              <span className="text-xs font-bold text-olive dark:text-sage flex-1 truncate">
                {selectedCatInfo.name}
              </span>
              <ChevronDown size={14} className="text-taupe" />
            </div>
            <select
              value={category}
              aria-label="Item category"
              disabled={loading}
              onChange={(e) => setSelectedCategory(e.target.value as ProductCategory)}
              className="w-full h-full min-h-11 opacity-0 z-10 absolute inset-0 text-[16px] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {name.trim() && (
          <p role="status" className="mt-2 px-1 text-xs text-olive dark:text-sage">
            {selectedCategory !== null
              ? 'Selected category · you can change it above.'
              : recognizedProduct
                ? `Recognized: ${recognizedProduct.name} · category selected automatically.`
                : 'Choose a category, or add it to classify later.'}
          </p>
        )}
      </form>
    </div>
  )
}
