'use client'

import { Trophy } from 'lucide-react'

type TopItem = {
  item_name: string
  count: number
}

type Props = {
  topItems: TopItem[]
  onQuickAdd: (name: string) => Promise<void>
}

export default function TopItems({ topItems, onQuickAdd }: Props) {
  if (topItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-gray-400" />
          Top 20
        </h2>
        <p className="text-gray-400 text-sm text-center py-4">Pas encore de données</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Trophy size={20} className="text-amber-400" />
        Top 20 articles
      </h2>
      <div className="space-y-2">
        {topItems.map((item, index) => (
          <button
            key={item.item_name}
            onClick={() => onQuickAdd(item.item_name)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-indigo-50 transition-colors text-left group"
          >
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
              {item.item_name}
            </span>
            <span className="text-xs text-gray-400">{item.count}x</span>
            <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
              + ajouter
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
