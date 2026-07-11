'use client'

import type { ReactNode } from 'react'
import { PurchaseHistory } from '@/lib/supabase'
import { CalendarDays, Package, Sparkles, Tags } from 'lucide-react'
import { getCategoryInfo } from '@/lib/categories'

type Props = {
  purchases: PurchaseHistory[]
}

const numberFormatter = new Intl.NumberFormat('en-US')

export default function WeeklyStats({ purchases }: Props) {
  const weekStart = getWeekStart(new Date())
  const weeklyPurchases = purchases.filter((purchase) => new Date(purchase.purchased_at) >= weekStart)

  const totalUnits = weeklyPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0)
  const topCategory = getTopKey(weeklyPurchases.map((purchase) => purchase.category))
  const topItem = getTopKey(weeklyPurchases.map((purchase) => purchase.item_name))
  const topCategoryInfo = topCategory ? getCategoryInfo(topCategory) : null

  return (
    <div className="card overflow-hidden">
      {/* Hero block */}
      <div className="relative p-5 bg-terracotta text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
            This week
          </span>
          <span className="text-[10px] px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm font-semibold flex items-center gap-1">
            <CalendarDays size={11} />
            Since Monday
          </span>
        </div>

        <div className="flex items-end gap-2 mb-1">
          <span className="text-5xl font-extrabold tracking-tight leading-none">
            {numberFormatter.format(weeklyPurchases.length)}
          </span>
          <span className="text-sm font-medium opacity-90 mb-1.5">
            {weeklyPurchases.length === 1 ? 'item purchased' : 'items purchased'}
          </span>
        </div>
        <p className="text-xs opacity-80">
          {totalUnits > 0
            ? `${numberFormatter.format(totalUnits)} total units`
            : 'No purchases yet this week'}
        </p>
      </div>

      {/* Stats tiles */}
      <div className="grid grid-cols-2 gap-2 p-3">
        <StatTile
          icon={<Package size={14} />}
          label="Items"
          value={numberFormatter.format(weeklyPurchases.length)}
        />
        <StatTile
          icon={<Sparkles size={14} />}
          label="Units"
          value={numberFormatter.format(totalUnits)}
        />
        <StatTile
          icon={<Tags size={14} />}
          label="Top category"
          value={topCategoryInfo ? `${topCategoryInfo.emoji} ${topCategoryInfo.name}` : '—'}
        />
        <StatTile
          icon={<Package size={14} />}
          label="Top product"
          value={topItem || '—'}
        />
      </div>
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gold/25 bg-sand/30 p-3">
      <div className="text-terracotta mb-1.5">{icon}</div>
      <p className="text-[10px] text-taupe uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-ink truncate mt-0.5">{value}</p>
    </div>
  )
}

function getWeekStart(referenceDate: Date) {
  const result = new Date(referenceDate)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function getTopKey(values: string[]) {
  if (values.length === 0) return ''

  const counts = values.reduce<Record<string, number>>((acc, key) => {
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
}
