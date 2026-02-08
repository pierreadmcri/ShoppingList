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
        <Clock size={16} className="text-sky-500" />
        <h2 className="text-sm font-bold text-slate-600 dark:text-slate-300">Recent Purchases</h2>
      </div>
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">{date}</p>
            <div className="space-y-1">
              {items.map((item) => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-100/50 dark:border-slate-700/50">
                    <span className="text-sm">{cat.emoji}</span>
                    <span className="text-slate-600 dark:text-slate-300 text-sm flex-1 font-medium truncate">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded font-bold">x{item.quantity}</span>
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