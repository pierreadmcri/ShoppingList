import assert from 'node:assert/strict'
import test from 'node:test'
import {
  countTrips, dailyBuckets, getHistoryStart, getPeriodRange, summarize, weeklyBuckets, TREND_WEEKS,
} from '../src/lib/stats.ts'

const at = (y, m, d, h = 12, min = 0) => new Date(y, m - 1, d, h, min).toISOString()
const purchase = (item_name, purchased_at, quantity = 1, category = 'Other') => ({ item_name, quantity, category, purchased_at })

test('week range starts on Monday and compares the same elapsed span', () => {
  const now = new Date(2026, 9, 1, 15) // Thursday 1 Oct 2026
  const range = getPeriodRange('week', now)
  assert.deepEqual(range.start, new Date(2026, 8, 28))
  assert.deepEqual(range.end, new Date(2026, 9, 5))
  assert.deepEqual(range.previousStart, new Date(2026, 8, 21))
  assert.deepEqual(range.previousEnd, new Date(2026, 8, 24, 15))
})

test('month range compares with the previous month, capped at its end', () => {
  const range = getPeriodRange('month', new Date(2026, 2, 31, 10)) // 31 March
  assert.deepEqual(range.start, new Date(2026, 2, 1))
  assert.deepEqual(range.previousStart, new Date(2026, 1, 1))
  assert.deepEqual(range.previousEnd, new Date(2026, 2, 1))
})

test('history covers both the trend window and the previous month', () => {
  const now = new Date(2026, 9, 1)
  const start = getHistoryStart(now)
  assert.ok(start <= new Date(2026, 8, 1))
  assert.ok(start <= new Date(2026, 7, 10)) // Monday 7 weeks before 28 Sep
})

test('purchases saved close together count as one trip', () => {
  assert.equal(countTrips([
    purchase('Milk', at(2026, 9, 28, 10, 0)),
    purchase('Eggs', at(2026, 9, 28, 10, 0)),
    purchase('Bread', at(2026, 9, 28, 10, 20)),
    purchase('Apples', at(2026, 9, 29, 18, 0)),
  ]), 2)
  assert.equal(countTrips([]), 0)
})

test('summary combines aliases and ranks categories by units', () => {
  const summary = summarize([
    purchase('Buck buck', at(2026, 9, 28), 2),
    purchase('Starbucks Cappuccino', at(2026, 9, 29), 1),
    purchase('Mystery thing', at(2026, 9, 29), 5, 'Home'),
  ])
  assert.equal(summary.units, 8)
  assert.equal(summary.entries, 3)
  assert.equal(summary.products, 2)
  assert.equal(summary.topProducts[0].name, 'Starbucks Cappuccino')
  assert.equal(summary.topProducts[0].entries, 2)
  assert.deepEqual(summary.categories.map((c) => c.category), ['Home', 'Drinks'])
})

test('daily and weekly buckets place units on the right day/week', () => {
  const now = new Date(2026, 9, 1, 15)
  const purchases = [
    purchase('Milk', at(2026, 9, 28, 9), 2),
    purchase('Eggs', at(2026, 10, 1, 8), 3),
    purchase('Old', at(2026, 9, 22, 9), 4),
  ]
  const days = dailyBuckets(purchases, getPeriodRange('week', now))
  assert.equal(days.length, 7)
  assert.deepEqual(days.map((d) => d.units), [2, 0, 0, 3, 0, 0, 0])

  const weeks = weeklyBuckets(purchases, now)
  assert.equal(weeks.length, TREND_WEEKS)
  assert.equal(weeks.at(-1).units, 5)
  assert.equal(weeks.at(-2).units, 4)
})
