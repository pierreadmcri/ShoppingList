'use client'

import { Trophy, Plus } from 'lucide-react'

type TopItem = { item_name: string; count: number }
type Props = { topItems: TopItem[]; onQuickAdd: (name: string) => Promise<void> }

const MEDAL_STYLES = [
  'bg-amber-100 text-amber-700',
  'bg-slate-100 text-slate-600',
  'bg-orange-100 text-orange-700',
]

export default function TopItems({ topItems, onQuickAdd }: Props) {
  if (topItems.length === 0) return null

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Trophy size={16} className="text-amber-500" />
        <h2 className="text-sm font-bold text-slate-600">Top Produits</h2>
      </div>
      <div className="space-y-1">
        {topItems.map((item, index) => (
          <button
            key={item.item_name}
            onClick={() => onQuickAdd(item.item_name)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-violet-50 transition-colors text-left touch-press group"
          >
            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
              index < 3 ? MEDAL_STYLES[index] : 'bg-slate-50 text-slate-400'
            }`}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-slate-700 font-medium truncate">
              {item.item_name}
            </span>
            
            {/* Le bouton + est toujours visible mais discret */}
            <div className="w-6 h-6 rounded-full bg-violet-50 text-violet-600 flex items-center justify-center opacity-100">
              <Plus size={12} strokeWidth={3} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}