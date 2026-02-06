'use client'

import { Clock } from 'lucide-react'
import { PurchaseHistory } from '@/lib/supabase'
import { getCategoryInfo } from '@/lib/categories'

type Props = {
  purchases: PurchaseHistory[]
}

export default function RecentPurchases({ purchases }: Props) {
  if (purchases.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-violet-100/50 p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
            <Clock size={16} className="text-violet-400" />
          </div>
          Recent Purchases
        </h2>
        <p className="text-gray-400 text-sm text-center py-3">No recent purchases</p>
      </div>
    )
  }

  const grouped = groupByDate(purchases)

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-violet-100/50 p-4">
      <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2 px-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
          <Clock size={16} className="text-violet-400" />
        </div>
        Recent Purchases
      </h2>
      <div className="space-y-3">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[11px] font-semibold text-violet-300 uppercase tracking-wider mb-1.5 px-1">{date}</p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.id} className="flex items-center gap-2.5 text-sm px-2 py-1.5 rounded-xl">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-gray-600 flex-1">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">x{item.quantity}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function groupByDate(purchases: PurchaseHistory[]): Record<string, PurchaseHistory[]> {
  const groups: Record<string, PurchaseHistory[]> = {}
  for (const p of purchases) {
    const date = new Date(p.purchased_at).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(p)
  }
  return groups
}
