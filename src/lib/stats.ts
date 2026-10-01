import { getProductKey, identifyProduct, resolveCategory, type ProductCategory } from './products.ts'

export type Period = 'week' | 'month'

export type PurchaseLike = {
  item_name: string
  quantity: number
  category: string
  purchased_at: string
}

export type PeriodRange = {
  start: Date
  /** Exclusive end of the whole period (next Monday / first day of next month). */
  end: Date
  previousStart: Date
  /** Exclusive end of the comparable elapsed span in the previous period. */
  previousEnd: Date
}

export type PeriodSummary = {
  entries: number
  units: number
  trips: number
  products: number
  categories: { category: ProductCategory; units: number; entries: number }[]
  topProducts: { key: string; name: string; category: ProductCategory; entries: number; units: number }[]
}

export type Bucket = { start: Date; units: number }

// Purchases saved within this gap of each other belong to the same shopping trip.
const TRIP_GAP_MS = 30 * 60 * 1000
export const TREND_WEEKS = 8

export function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day))
  result.setHours(0, 0, 0, 0)
  return result
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getPeriodRange(period: Period, now: Date): PeriodRange {
  const start = period === 'week' ? startOfWeek(now) : startOfMonth(now)
  const end = period === 'week' ? addDays(start, 7) : new Date(start.getFullYear(), start.getMonth() + 1, 1)
  const previousStart = period === 'week' ? addDays(start, -7) : new Date(start.getFullYear(), start.getMonth() - 1, 1)
  // Compare like with like: the same elapsed time into the previous period.
  const previousEnd = new Date(Math.min(previousStart.getTime() + (now.getTime() - start.getTime()), start.getTime()))
  return { start, end, previousStart, previousEnd }
}

/** Earliest date the dashboard needs: the previous month or the trend window, whichever is older. */
export function getHistoryStart(now: Date): Date {
  const trendStart = addDays(startOfWeek(now), -7 * (TREND_WEEKS - 1))
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return trendStart < previousMonth ? trendStart : previousMonth
}

export function filterRange<T extends PurchaseLike>(purchases: T[], start: Date, end: Date): T[] {
  return purchases.filter((purchase) => {
    const time = Date.parse(purchase.purchased_at)
    return time >= start.getTime() && time < end.getTime()
  })
}

export function countTrips(purchases: PurchaseLike[]): number {
  const times = purchases.map((purchase) => Date.parse(purchase.purchased_at)).sort((a, b) => a - b)
  let trips = 0
  let previous = -Infinity
  for (const time of times) {
    if (time - previous > TRIP_GAP_MS) trips += 1
    previous = time
  }
  return trips
}

export function summarize(purchases: PurchaseLike[]): PeriodSummary {
  const categories = new Map<ProductCategory, { units: number; entries: number }>()
  const products = new Map<string, PeriodSummary['topProducts'][number]>()

  for (const purchase of purchases) {
    const category = resolveCategory(purchase.item_name, purchase.category)
    const categoryTotals = categories.get(category) ?? { units: 0, entries: 0 }
    categoryTotals.units += purchase.quantity
    categoryTotals.entries += 1
    categories.set(category, categoryTotals)

    const key = getProductKey(purchase.item_name)
    // Unknown products keep the household's own spelling rather than the normalized key.
    const name = identifyProduct(purchase.item_name)?.name ?? purchase.item_name.trim()
    const product = products.get(key) ?? { key, name, category, entries: 0, units: 0 }
    product.entries += 1
    product.units += purchase.quantity
    products.set(key, product)
  }

  return {
    entries: purchases.length,
    units: purchases.reduce((sum, purchase) => sum + purchase.quantity, 0),
    trips: countTrips(purchases),
    products: products.size,
    categories: [...categories.entries()]
      .map(([category, totals]) => ({ category, ...totals }))
      .sort((a, b) => b.units - a.units || b.entries - a.entries || a.category.localeCompare(b.category)),
    topProducts: [...products.values()]
      .sort((a, b) => b.entries - a.entries || b.units - a.units || a.name.localeCompare(b.name)),
  }
}

/** Units bought on each day of the period. */
export function dailyBuckets(purchases: PurchaseLike[], range: PeriodRange): Bucket[] {
  const buckets: Bucket[] = []
  for (let day = new Date(range.start); day < range.end; day = addDays(day, 1)) {
    buckets.push({ start: day, units: 0 })
  }
  for (const purchase of filterRange(purchases, range.start, range.end)) {
    const date = new Date(purchase.purchased_at)
    const index = buckets.findIndex((bucket, i) => date >= bucket.start && (i === buckets.length - 1 || date < buckets[i + 1].start))
    if (index >= 0) buckets[index].units += purchase.quantity
  }
  return buckets
}

/** Units bought per week over the last TREND_WEEKS weeks, oldest first, current week last. */
export function weeklyBuckets(purchases: PurchaseLike[], now: Date): Bucket[] {
  const currentWeek = startOfWeek(now)
  const buckets = Array.from({ length: TREND_WEEKS }, (_, i) => ({
    start: addDays(currentWeek, -7 * (TREND_WEEKS - 1 - i)),
    units: 0,
  }))
  for (const purchase of purchases) {
    const time = Date.parse(purchase.purchased_at)
    const index = buckets.findIndex((bucket, i) => time >= bucket.start.getTime() &&
      time < (i === buckets.length - 1 ? addDays(bucket.start, 7) : buckets[i + 1].start).getTime())
    if (index >= 0) buckets[index].units += purchase.quantity
  }
  return buckets
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}
