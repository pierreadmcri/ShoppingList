'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, UsersRound } from 'lucide-react'
import { supabase, ShoppingItem, PurchaseHistory } from '@/lib/supabase'
import AddItemForm from '@/components/AddItemForm'
import ShoppingList from '@/components/ShoppingList'
import RecentPurchases from '@/components/RecentPurchases'
import WeeklyStats from '@/components/WeeklyStats'
import BottomNav, { View } from '@/components/BottomNav'

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [recentPurchases, setRecentPurchases] = useState<PurchaseHistory[]>([])
  const [weeklyPurchases, setWeeklyPurchases] = useState<PurchaseHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('list')

  const fetchItems = useCallback(async () => {
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false })
    if (data) setItems(data)
  }, [])

  const fetchRecentPurchases = useCallback(async () => {
    const { data } = await supabase
      .from('purchase_history')
      .select('*')
      .order('purchased_at', { ascending: false })
      .limit(40)
    if (data) setRecentPurchases(data)
  }, [])

  const fetchWeeklyPurchases = useCallback(async () => {
    const weekStart = new Date()
    const day = weekStart.getDay()
    const diff = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('purchase_history')
      .select('*')
      .gte('purchased_at', weekStart.toISOString())
      .order('purchased_at', { ascending: false })

    if (data) setWeeklyPurchases(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchItems(), fetchRecentPurchases(), fetchWeeklyPurchases()])
    setLoading(false)
  }, [fetchItems, fetchRecentPurchases, fetchWeeklyPurchases])

  useEffect(() => {
    async function load() {
      await fetchAll()
    }
    load()
  }, [fetchAll])

  useEffect(() => {
    const channel = supabase
      .channel('shopping-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_history' }, () => {
        fetchRecentPurchases()
        fetchWeeklyPurchases()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchItems, fetchRecentPurchases, fetchWeeklyPurchases])

  const handleAddItem = async (name: string, quantity: number, category: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('shopping_items')
      .insert({ name, quantity, category })
    if (err) setError(err.message)
    else fetchItems()
  }

  const handleToggle = async (id: string, checked: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked } : i))
    await supabase.from('shopping_items').update({ checked }).eq('id', id)
  }

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    await supabase.from('shopping_items').delete().eq('id', id)
  }

  const handleValidatePurchases = async () => {
    const checkedItems = items.filter(i => i.checked)
    if (checkedItems.length === 0) return

    const historyItems = checkedItems.map(i => ({
      item_name: i.name,
      quantity: i.quantity,
      category: i.category,
    }))

    await supabase.from('purchase_history').insert(historyItems)
    const ids = checkedItems.map(i => i.id)
    await supabase.from('shopping_items').delete().in('id', ids)

    setItems(prev => prev.filter(i => !i.checked))
    fetchRecentPurchases()
    fetchWeeklyPurchases()
  }

  const autocompleteSuggestions = useMemo(() => {
    const seen = new Set<string>()
    const merged = [...recentPurchases, ...weeklyPurchases]

    return merged
      .filter((purchase) => {
        const key = purchase.item_name.trim().toLowerCase()
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 25)
      .map((purchase) => ({
        name: purchase.item_name,
        category: purchase.category,
      }))
  }, [recentPurchases, weeklyPurchases])

  const uncheckedCount = items.filter(i => !i.checked).length

  return (
    <div className="min-h-screen mediterranean-bg">
      <header className="relative z-20 safe-top px-5 pt-3">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div className="min-w-0">
            <p className="eyebrow mb-1">{view === 'list' ? 'Our household list' : 'Our household journal'}</p>
            <h1 className="display-title text-[27px] leading-tight text-ink tracking-[-0.025em]">
              {view === 'list' ? 'Alisa & Pierre' : 'Stats'}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-olive">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-white">A</span>
              <span className="-ml-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-cream bg-cobalt text-white dark:border-night">P</span>
              <UsersRound size={15} />
              <span>{view === 'list' ? `${uncheckedCount} to pick up` : 'Shared list'}</span>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 rounded-full border border-gold/30 bg-cream/75 p-1">
              <button
                onClick={fetchAll}
                className="w-9 h-9 flex items-center justify-center text-olive dark:text-sage active:text-terracotta rounded-full transition-all touch-press"
                aria-label="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 pb-32 safe-bottom relative z-10">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/30">
            {error}
          </div>
        )}

        {view === 'list' ? (
          <div className="space-y-5 animate-enter">
            <AddItemForm onAdd={handleAddItem} suggestions={autocompleteSuggestions} />
            <ShoppingList
              items={items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onValidatePurchases={handleValidatePurchases}
            />
          </div>
        ) : (
          <div className="space-y-4 animate-enter">
            <WeeklyStats purchases={weeklyPurchases} />
            <RecentPurchases purchases={recentPurchases} />
          </div>
        )}
      </main>

      <BottomNav view={view} onChange={setView} listBadge={uncheckedCount} />
    </div>
  )
}
