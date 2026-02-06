'use client'

import { Trophy, Plus } from 'lucide-react'

type TopItem = {
  item_name: string
  count: number
}

type Props = {
  topItems: TopItem[]
  onQuickAdd: (name: string) => Promise<void>
}

const MEDAL_STYLES = [
  'bg-gradient-to-br from-amber-300 to-yellow-400 text-amber-800 shadow-sm shadow-amber-200/50',
  'bg-gradient-to-br from-gray-300 to-slate-400 text-gray-700 shadow-sm shadow-gray-200/50',
  'bg-gradient-to-br from-orange-300 to-amber-400 text-orange-800 shadow-sm shadow-orange-200/50',
]

export default function TopItems({ topItems, onQuickAdd }: Props) {
  if (topItems.length === 0) {
    return (
      <div className="card p-5">
        <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
            <Trophy size={16} className="text-amber-500" />
          </div>
          Top 20
        </h2>
        <p className="text-violet-300 text-sm text-center py-4">No data yet</p>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-inner">
          <Trophy size={16} className="text-amber-500" />
        </div>
        Top 20 Items
      </h2>
      <div className="space-y-0.5">
        {topItems.map((item, index) => (
          <button
            key={item.item_name}
            onClick={() => onQuickAdd(item.item_name)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl hover:bg-violet-50/50 active:bg-violet-100/40 transition-colors text-left touch-press group"
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-extrabold ${
              index < 3 ? MEDAL_STYLES[index] : 'bg-violet-50/60 text-violet-400'
            }`}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-gray-700 truncate font-medium group-hover:text-violet-600 transition-colors">
              {item.item_name}
            </span>
            <span className="text-[11px] text-violet-300 font-semibold">{item.count}x</span>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
              <Plus size={13} className="text-violet-500" strokeWidth={2.5} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
