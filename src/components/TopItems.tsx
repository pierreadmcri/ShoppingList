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

export default function TopItems({ topItems, onQuickAdd }: Props) {
  if (topItems.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-violet-100/50 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Trophy size={16} className="text-amber-500" />
          </div>
          Top 20
        </h2>
        <p className="text-gray-400 text-sm text-center py-3">No data yet</p>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-violet-100/50 p-4">
      <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
          <Trophy size={16} className="text-amber-500" />
        </div>
        Top 20 Items
      </h2>
      <div className="space-y-1">
        {topItems.map((item, index) => (
          <button
            key={item.item_name}
            onClick={() => onQuickAdd(item.item_name)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-2xl hover:bg-violet-50/80 active:bg-violet-100/60 transition-colors text-left touch-press"
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              index === 0 ? 'bg-gradient-to-br from-amber-200 to-amber-300 text-amber-700' :
              index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600' :
              index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {index + 1}
            </span>
            <span className="flex-1 text-sm text-gray-700 truncate">
              {item.item_name}
            </span>
            <span className="text-[11px] text-gray-400">{item.count}x</span>
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <Plus size={12} className="text-violet-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
