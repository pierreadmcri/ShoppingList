'use client'

import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Minus, ShoppingBag, Sparkles, Tags, Trophy } from 'lucide-react'
import { PurchaseHistory } from '@/lib/supabase'
import { getCategoryInfo } from '@/lib/categories'
import {
  dailyBuckets, filterRange, getPeriodRange, isSameDay, summarize, weeklyBuckets,
  type Bucket, type Period,
} from '@/lib/stats'

type Props = {
  purchases: PurchaseHistory[]
  loading: boolean
}

const numberFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const rangeFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'narrow' })

const PERIODS: { id: Period; label: string; previous: string; short: string }[] = [
  { id: 'week', label: 'This week', previous: 'last week', short: 'last wk' },
  { id: 'month', label: 'This month', previous: 'last month', short: 'last mo' },
]

export default function StatsDashboard({ purchases, loading }: Props) {
  const [period, setPeriod] = useState<Period>('week')
  const periodInfo = PERIODS.find((p) => p.id === period)!

  const data = useMemo(() => {
    const now = new Date()
    const range = getPeriodRange(period, now)
    const current = summarize(filterRange(purchases, range.start, range.end))
    const previous = summarize(filterRange(purchases, range.previousStart, range.previousEnd))
    return {
      now,
      range,
      current,
      previous,
      days: dailyBuckets(purchases, range),
      weeks: weeklyBuckets(purchases, now),
    }
  }, [purchases, period])

  const { current, previous, range, now } = data
  const lastDay = new Date(range.end)
  lastDay.setDate(lastDay.getDate() - 1)
  const avgPerTrip = current.trips > 0 ? current.units / current.trips : 0
  const previousAvg = previous.trips > 0 ? previous.units / previous.trips : 0
  const isEmpty = current.entries === 0

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Period" className="grid grid-cols-2 gap-1 rounded-full border border-gold/30 bg-cream/80 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={period === p.id}
            onClick={() => setPeriod(p.id)}
            className={`h-10 rounded-full text-sm font-semibold transition-colors touch-press ${
              period === p.id ? 'bg-ink text-cream shadow-sm' : 'text-olive'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="card p-5" aria-labelledby="hero-title">
        <div className="flex items-center justify-between gap-3">
          <h2 id="hero-title" className="text-sm font-semibold text-olive">Items bought</h2>
          <p className="flex items-center gap-1.5 text-xs text-olive">
            <CalendarDays size={14} aria-hidden="true" />
            {rangeFormatter.formatRange(range.start, lastDay)}
          </p>
        </div>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-[56px] font-extrabold leading-none tracking-tight text-ink tabular-nums">
            {loading && purchases.length === 0 ? '–' : numberFormatter.format(current.units)}
          </p>
          <Delta current={current.units} previous={previous.units} label={periodInfo.previous} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-olive">
          {isEmpty
            ? 'Nothing bought yet. Complete a shopping trip to fill your dashboard.'
            : `${current.entries} ${plural(current.entries, 'purchase')} across ${current.trips} ${plural(current.trips, 'trip')}.`}
        </p>

        <dl className="mt-5 grid grid-cols-3 border-t border-gold/25 pt-4">
          <Kpi label="Trips" value={current.trips} previous={previous.trips} compare={periodInfo.short} />
          <Kpi label="Products" value={current.products} previous={previous.products} compare={periodInfo.short} bordered />
          <Kpi label="Avg / trip" value={avgPerTrip} previous={previousAvg} compare={periodInfo.short} bordered />
        </dl>
      </section>

      {/* Daily activity */}
      <section className="card p-5" aria-labelledby="activity-title">
        <CardTitle id="activity-title" icon={<ShoppingBag size={17} />} title="Daily activity" subtitle="Items bought per day" />
        <ColumnChart
          key={period}
          buckets={data.days}
          isCurrent={(b) => isSameDay(b.start, now)}
          isFuture={(b) => b.start > now}
          axisLabel={(b, i) => period === 'week'
            ? weekdayFormatter.format(b.start)
            : (i === 0 || (i + 1) % 7 === 0 ? String(b.start.getDate()) : '')}
          describe={(b) => dayFormatter.format(b.start)}
          dense={period === 'month'}
        />
      </section>

      {/* Categories */}
      <section className="card p-5" aria-labelledby="categories-title">
        <CardTitle id="categories-title" icon={<Tags size={17} />} title="Categories" subtitle="Share of items bought" />
        {current.categories.length === 0 ? (
          <EmptyHint />
        ) : (
          <ul className="mt-4 space-y-3.5">
            {current.categories.map((c) => {
              const info = getCategoryInfo(c.category)
              const share = current.units > 0 ? c.units / current.units : 0
              return (
                <li key={c.category}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-ink">
                      <span aria-hidden="true" className="mr-1.5">{info.emoji}</span>{info.name}
                    </span>
                    <span className="shrink-0 tabular-nums text-olive">
                      <span className="font-semibold text-ink">{c.units}</span> · {Math.round(share * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-sand/70" aria-hidden="true">
                    <div className="h-full rounded-full bg-olive" style={{ width: `${Math.max(share * 100, 3)}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Top products */}
      <section className="card p-5" aria-labelledby="top-title">
        <CardTitle id="top-title" icon={<Trophy size={17} />} title="Top products" subtitle="Most often on your receipts" />
        {current.topProducts.length === 0 ? (
          <EmptyHint />
        ) : (
          <ol className="mt-3 divide-y divide-gold/20">
            {current.topProducts.slice(0, 5).map((p, i) => {
              const info = getCategoryInfo(p.category)
              return (
                <li key={p.key} className="flex items-center gap-3 py-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                    i === 0 ? 'bg-terracotta text-white' : 'bg-sand text-ink'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                    <p className="text-xs text-olive"><span aria-hidden="true">{info.emoji} </span>{info.name}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-ink tabular-nums">{p.entries}×</p>
                    <p className="text-xs text-olive tabular-nums">{p.units} {plural(p.units, 'unit')}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {/* 8-week trend */}
      <section className="card p-5" aria-labelledby="trend-title">
        <CardTitle id="trend-title" icon={<Sparkles size={17} />} title="Last 8 weeks" subtitle="Items bought per week" />
        <ColumnChart
          buckets={data.weeks}
          isCurrent={(b) => isSameDay(b.start, data.weeks[data.weeks.length - 1].start)}
          isFuture={() => false}
          axisLabel={(b) => rangeFormatter.format(b.start).replace(' ', ' ')}
          describe={(b) => `Week of ${rangeFormatter.format(b.start)}`}
          rotateLabels
        />
      </section>
    </div>
  )
}

function CardTitle({ id, icon, title, subtitle }: { id: string; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span aria-hidden="true" className="mt-0.5 text-terracotta">{icon}</span>
      <div>
        <h2 id={id} className="display-title text-xl leading-tight text-ink">{title}</h2>
        <p className="text-xs text-olive">{subtitle}</p>
      </div>
    </div>
  )
}

function EmptyHint() {
  return <p className="mt-4 border-t border-gold/25 pt-4 text-sm text-olive">No purchases in this period yet.</p>
}

function Kpi({ label, value, previous, compare, bordered }: {
  label: string; value: number; previous: number; compare: string; bordered?: boolean
}) {
  const diff = value - previous
  return (
    <div className={bordered ? 'border-l border-gold/25 pl-3' : 'pr-3'}>
      <dt className="text-xs text-olive">{label}</dt>
      <dd className="mt-0.5 text-2xl font-bold tracking-tight text-ink tabular-nums">{numberFormatter.format(value)}</dd>
      <dd className="text-[11px] text-taupe tabular-nums">
        {diff === 0 ? `= ${compare}` : `${diff > 0 ? '+' : '−'}${numberFormatter.format(Math.abs(diff))} vs ${compare}`}
      </dd>
    </div>
  )
}

function Delta({ current, previous, label }: { current: number; previous: number; label: string }) {
  const diff = current - previous
  const Icon = diff > 0 ? ArrowUpRight : diff < 0 ? ArrowDownRight : Minus
  const text = previous === 0
    ? (current === 0 ? `Same as ${label}` : `${current} more than ${label}`)
    : `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${Math.round(Math.abs(diff / previous) * 100)}% vs ${label}`
  return (
    <p className="mb-1 flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-ink">
      <Icon size={14} aria-hidden="true" className={diff > 0 ? 'text-terracotta' : 'text-olive'} />
      {text}
    </p>
  )
}

type ColumnChartProps = {
  buckets: Bucket[]
  isCurrent: (bucket: Bucket) => boolean
  isFuture: (bucket: Bucket) => boolean
  axisLabel: (bucket: Bucket, index: number) => string
  describe: (bucket: Bucket) => string
  dense?: boolean
  rotateLabels?: boolean
}

function ColumnChart({ buckets, isCurrent, isFuture, axisLabel, describe, dense, rotateLabels }: ColumnChartProps) {
  const currentIndex = buckets.findIndex(isCurrent)
  const [selected, setSelected] = useState(currentIndex >= 0 ? currentIndex : buckets.length - 1)
  const max = Math.max(1, ...buckets.map((b) => b.units))
  const active = buckets[selected]
  const pastBuckets = buckets.filter((b) => !isFuture(b))
  const average = pastBuckets.length ? pastBuckets.reduce((s, b) => s + b.units, 0) / pastBuckets.length : 0

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3" aria-live="polite">
        <p className="min-w-0 truncate text-xs font-medium text-olive">{active ? describe(active) : ''}</p>
        <p className="shrink-0 text-sm text-ink">
          <span className="text-lg font-bold tabular-nums">{active?.units ?? 0}</span> {plural(active?.units ?? 0, 'item')}
        </p>
      </div>

      <div className="relative mt-3 h-32">
        {/* Recessive guides: top of scale and period average */}
        <div className="absolute inset-x-0 top-0 border-t border-gold/20" aria-hidden="true">
          <span className="absolute -top-2 right-0 bg-[rgba(255,252,245,0.9)] pl-1 text-[10px] leading-none text-taupe tabular-nums">{max}</span>
        </div>
        {average > 0 && (
          <div className="absolute inset-x-0 border-t border-dashed border-olive/30" style={{ bottom: `${(average / max) * 100}%` }} aria-hidden="true" />
        )}
        <div className="absolute inset-x-0 bottom-0 border-t border-gold/40" aria-hidden="true" />

        <div className={`relative flex h-full items-end ${dense ? 'gap-[2px]' : 'gap-1.5'}`}>
          {buckets.map((bucket, i) => {
            const future = isFuture(bucket)
            const current = i === currentIndex
            const isSelected = i === selected
            const height = bucket.units > 0 ? Math.max((bucket.units / max) * 100, 4) : 0
            return (
              <button
                key={bucket.start.toISOString()}
                type="button"
                onClick={() => setSelected(i)}
                disabled={future}
                aria-pressed={isSelected}
                aria-label={`${describe(bucket)}: ${bucket.units} ${plural(bucket.units, 'item')}`}
                className="group relative flex h-full flex-1 items-end justify-center rounded-md"
              >
                {isSelected && <span className="absolute inset-0 -mx-px rounded-md bg-sand/60" aria-hidden="true" />}
                <span
                  aria-hidden="true"
                  className={`relative w-full max-w-6 rounded-t-[4px] transition-[height] duration-300 ${
                    current ? 'bg-terracotta' : future ? 'bg-transparent' : 'bg-gold/55'
                  }`}
                  style={{ height: height > 0 ? `${height}%` : '3px', opacity: bucket.units === 0 && !future ? 0.35 : 1 }}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div className={`mt-1.5 flex ${dense ? 'gap-[2px]' : 'gap-1.5'}`} aria-hidden="true">
        {buckets.map((bucket, i) => (
          <span
            key={bucket.start.toISOString()}
            className={`flex-1 text-center text-[10px] leading-tight tabular-nums ${
              i === currentIndex ? 'font-bold text-terracotta' : 'text-taupe'
            } ${rotateLabels ? 'whitespace-pre-line' : 'overflow-visible whitespace-nowrap'}`}
          >
            {rotateLabels ? axisLabel(bucket, i).replace(' ', '\n') : axisLabel(bucket, i)}
          </span>
        ))}
      </div>
      {average > 0 && (
        <p className="mt-3 flex items-center gap-2 text-[11px] text-taupe">
          <span className="inline-block w-4 border-t border-dashed border-olive/50" aria-hidden="true" />
          Average {numberFormatter.format(average)} {plural(Math.round(average), 'item')}
        </p>
      )}
    </div>
  )
}

function plural(count: number, word: string) {
  return count === 1 ? word : `${word}s`
}
