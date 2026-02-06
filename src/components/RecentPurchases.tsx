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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-gray-400" />
          Derniers achats
        </h2>
        <p className="text-gray-400 text-sm text-center py-4">Aucun achat récent</p>
      </div>
    )
  }

  const grouped = groupByDate(purchases)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-indigo-400" />
        Derniers achats
      </h2>
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, items]) => (
          <div key={date}>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{date}</p>
            <div className="space-y-1.5">
              {items.map((item) => {
                const cat = getCategoryInfo(item.category)
                return (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span>{cat.emoji}</span>
                    <span className="text-gray-600">{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-gray-400">x{item.quantity}</span>
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
    const date = new Date(p.purchased_at).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(p)
  }
  return groups
}
