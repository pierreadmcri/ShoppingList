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
      <div className="card p-5">
        <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-inner">
            <Clock size={16} className="text-sky-400" />
          </div>
          Recent Purchases
        </h2>
        <p className="text-violet-300 text-sm text-center py-4">No recent purchases yet</p>
      </div>
    )
  }

  const grouped = groupByDate(purchases)

  return (
    <div className="card p-4">
      <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2.5 px-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center shadow-inner">
          <Clock size={16} className="text-sky-400" />
        </div>
        Recent Purchases
      </h2>
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[11px] font-bold text-violet-300/70 uppercase tracking-wider mb-2 px-1">{date}</p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.id} className="flex items-center gap-2.5 text-sm px-2 py-2 rounded-xl hover:bg-violet-50/30 transition-colors">
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-gray-600 flex-1 font-medium">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-violet-400 bg-violet-50/60 px-2 py-0.5 rounded-lg font-semibold">x{item.quantity}</span>
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
