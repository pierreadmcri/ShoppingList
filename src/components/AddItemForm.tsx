'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

type Props = {
  onAdd: (name: string, quantity: number, category: string) => Promise<void>
}

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('Other')
  const [loading, setLoading] = useState(false)

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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Add an item</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 placeholder-gray-400"
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          className="w-20 px-3 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-center text-gray-700"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-700 bg-white"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.name} value={cat.name}>
              {cat.emoji} {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          <Plus size={20} />
          <span className="sm:inline">Add</span>
        </button>
      </div>
    </form>
  )
}
