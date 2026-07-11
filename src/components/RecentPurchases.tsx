'use client'

import { Clock } from 'lucide-react'
import { PurchaseHistory } from '@/lib/supabase'
import { getCategoryInfo } from '@/lib/categories'

type Props = {
  purchases: PurchaseHistory[]
}

export default function RecentPurchases({ purchases }: Props) {
  if (purchases.length === 0) return null

  const grouped = groupByDate(purchases)

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Clock size={16} className="text-cobalt" />
        <h2 className="display-title text-xl text-ink">Recent purchases</h2>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[10px] font-bold text-terracotta uppercase tracking-wider mb-2 px-1">{date}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sand/25 border border-gold/20">
                    <span className="text-sm">{cat.emoji}</span>
                    <span className="text-ink text-sm flex-1 font-medium truncate">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-olive bg-sand px-1.5 py-0.5 rounded font-bold">×{item.quantity}</span>
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(p)
  }
  return groups
}
