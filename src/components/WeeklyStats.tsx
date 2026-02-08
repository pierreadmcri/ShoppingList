'use client'

import type { ReactNode } from 'react'
import { PurchaseHistory } from '@/lib/supabase'
import { CalendarDays, Package, Sparkles, Tags } from 'lucide-react'

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

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Weekly stats</h2>
        <span className="text-[11px] px-2 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-semibold flex items-center gap-1">
          <CalendarDays size={12} />
          Since Monday
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Package size={14} />} label="Items purchased" value={numberFormatter.format(weeklyPurchases.length)} />
        <StatTile icon={<Sparkles size={14} />} label="Total units" value={numberFormatter.format(totalUnits)} />
        <StatTile icon={<Tags size={14} />} label="Top category" value={topCategory || '—'} />
        <StatTile icon={<Package size={14} />} label="Top product" value={topItem || '—'} />
      </div>
    </div>
  )
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-3">
      <div className="text-slate-400 dark:text-slate-500 mb-2">{icon}</div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate mt-1">{value}</p>
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
