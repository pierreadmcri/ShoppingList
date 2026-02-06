'use client'

import { useState, useRef } from 'react'
import { Plus, Minus } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
}

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('Other')
  const [loading, setLoading] = useState(false)
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
    inputRef.current?.focus()
  }

  return (
    <div className="card p-1">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative group">
            {/* TEXT-[16px] est vital pour empêcher le zoom sur iPhone */}
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Produit..."
              className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-violet-500/30 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400 font-medium text-[16px]" 
              autoComplete="off"
              enterKeyHint="done"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="h-12 w-12 flex-shrink-0 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-violet-200 disabled:shadow-none touch-press"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Ligne contrôles tactiles */}
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Compteur tactile large */}
          <div className="flex items-center bg-slate-50 rounded-xl ring-1 ring-slate-200 p-1 flex-shrink-0 h-10">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center text-slate-400 active:text-violet-600 active:bg-white rounded-lg transition-all touch-press"
            >
              <Minus size={16} strokeWidth={3} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-slate-700">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-full flex items-center justify-center text-slate-400 active:text-violet-600 active:bg-white rounded-lg transition-all touch-press"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 flex-shrink-0 mx-1"></div>

          {/* Liste horizontale avec inertie iOS */}
          <div className="flex-1 overflow-x-auto scrollbar-hide ios-momentum-scroll flex items-center gap-2 pr-4">
            {CATEGORIES.map((cat) => {
              const isActive = cat.name === category
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border touch-press ${
                    isActive
                      ? 'bg-violet-100 border-violet-200 text-violet-700'
                      : 'bg-white border-slate-100 text-slate-500'
                  }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  {cat.name}
                </button>
              )
            })}
          </div>
        </div>
      </form>
    </div>
  )
}