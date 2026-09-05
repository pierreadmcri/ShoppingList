'use client'

import { Clock } from 'lucide-react'
import { PurchaseHistory } from '@/lib/supabase'
import { getCategoryInfo } from '@/lib/categories'
import { resolveCategory } from '@/lib/products'

type Props = {
  purchases: PurchaseHistory[]
}

export default function RecentPurchases({ purchases }: Props) {
  const grouped = groupByDate(purchases)

  return (
    <section className="card p-5" aria-labelledby="recent-purchases-title">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={18} aria-hidden="true" className="text-terracotta shrink-0" />
        <h2 id="recent-purchases-title" className="display-title text-xl text-ink">Recent purchases</h2>
      </div>
      {purchases.length === 0 ? (
        <div className="border-t border-gold/25 pt-4 pb-1">
          <p className="text-sm font-semibold text-ink">No purchases yet</p>
          <p className="mt-1 text-sm leading-relaxed text-olive">
            Tick items off your list and complete your shopping. Your purchases will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-olive mb-1">{date}</h3>
              <ul className="divide-y divide-gold/20">
                {items.map((item) => {
                  const cat = getCategoryInfo(resolveCategory(item.item_name, item.category))
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-3">
                      <span aria-hidden="true" className="text-base leading-6 shrink-0">{cat.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-ink text-sm leading-6 font-medium break-words">{item.item_name}</p>
                        <p className="text-xs leading-5 text-olive">{cat.name}</p>
                      </div>
                      <span className="text-sm leading-6 text-ink shrink-0 font-semibold tabular-nums">
                        <span className="sr-only">Quantity: </span>×{item.quantity}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function groupByDate(purchases: PurchaseHistory[]): Record<string, PurchaseHistory[]> {
  const groups: Record<string, PurchaseHistory[]> = {}
  const sortedPurchases = [...purchases].sort((a, b) =>
    new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
  )
  for (const purchase of sortedPurchases) {
    const date = new Date(purchase.purchased_at).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(purchase)
  }
  return groups
}
