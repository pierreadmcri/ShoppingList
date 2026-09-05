'use client'

import { PurchaseHistory } from '@/lib/supabase'
import { CalendarDays } from 'lucide-react'
import { getCategoryInfo } from '@/lib/categories'

type Props = {
  purchases: PurchaseHistory[]
}

const numberFormatter = new Intl.NumberFormat('en-US')
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export default function WeeklyStats({ purchases }: Props) {
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const weeklyPurchases = purchases.filter((purchase) => {
    const purchasedAt = new Date(purchase.purchased_at)
    return purchasedAt >= weekStart && purchasedAt <= now
  })

  const totalUnits = weeklyPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0)
  const topCategory = getTopEntry(weeklyPurchases.map((purchase) => purchase.category))
  const topItem = getTopEntry(weeklyPurchases.map((purchase) => purchase.item_name))
  const topCategoryInfo = topCategory ? getCategoryInfo(topCategory[0]) : null

  return (
    <section className="card overflow-hidden" aria-labelledby="weekly-stats-title">
      <div className="p-5">
        <h2 id="weekly-stats-title" className="display-title text-2xl text-ink">This week</h2>
        <p className="mt-2 flex items-center gap-2 text-xs leading-relaxed text-olive">
          <CalendarDays size={14} aria-hidden="true" className="shrink-0" />
          {dateFormatter.formatRange(weekStart, weekEnd)}
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs font-medium text-olive">Purchase entries</dt>
            <dd className="mt-1 text-4xl font-extrabold tracking-tight text-terracotta tabular-nums">
              {numberFormatter.format(weeklyPurchases.length)}
            </dd>
          </div>
          <div className="border-l border-gold/25 pl-4">
            <dt className="text-xs font-medium text-olive">Total units</dt>
            <dd className="mt-1 text-4xl font-extrabold tracking-tight text-ink tabular-nums">
              {numberFormatter.format(totalUnits)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-olive">
          {weeklyPurchases.length > 0
            ? 'An item bought again counts as another entry.'
            : 'Complete a shopping trip to start your weekly summary.'}
        </p>
      </div>

      {topCategory && topCategoryInfo && topItem && (
        <div className="border-t border-gold/25 px-5 pb-1">
          <p className="pt-4 text-xs font-semibold text-olive">Most frequent by purchase entry</p>
          <dl className="divide-y divide-gold/20">
            <div className="py-4">
              <dt className="text-xs text-olive">Category</dt>
              <dd className="mt-1 flex items-start justify-between gap-3">
                <span className="min-w-0 break-words text-sm font-semibold text-ink">
                  <span aria-hidden="true">{topCategoryInfo.emoji} </span>{topCategoryInfo.name}
                </span>
                <span className="shrink-0 text-xs leading-5 text-olive">{formatEntries(topCategory[1])}</span>
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-xs text-olive">Product</dt>
              <dd className="mt-1 flex items-start justify-between gap-3">
                <span className="min-w-0 break-words text-sm font-semibold text-ink">{topItem[0]}</span>
                <span className="shrink-0 text-xs leading-5 text-olive">{formatEntries(topItem[1])}</span>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  )
}

function formatEntries(count: number) {
  return `${numberFormatter.format(count)} ${count === 1 ? 'entry' : 'entries'}`
}

function getWeekStart(referenceDate: Date) {
  const result = new Date(referenceDate)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function getTopEntry(values: string[]): [string, number] | undefined {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
}
