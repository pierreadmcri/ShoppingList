'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ShoppingCart, RefreshCw, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { supabase, ShoppingItem, PurchaseHistory } from '@/lib/supabase'
import AddItemForm from '@/components/AddItemForm'
import ShoppingList from '@/components/ShoppingList'
import RecentPurchases from '@/components/RecentPurchases'
import TopItems from '@/components/TopItems'
import WeeklyStats from '@/components/WeeklyStats'

type TopItem = { item_name: string; count: number }

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [recentPurchases, setRecentPurchases] = useState<PurchaseHistory[]>([])
  const [weeklyPurchases, setWeeklyPurchases] = useState<PurchaseHistory[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, toggle: toggleTheme } = useTheme()

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

  const fetchTopItems = useCallback(async () => {
    const { data } = await supabase.rpc('get_top_items', { limit_count: 10 })
    if (data) setTopItems(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchItems(), fetchRecentPurchases(), fetchWeeklyPurchases(), fetchTopItems()])
    setLoading(false)
  }, [fetchItems, fetchRecentPurchases, fetchWeeklyPurchases, fetchTopItems])

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
        fetchTopItems()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchItems, fetchRecentPurchases, fetchWeeklyPurchases, fetchTopItems])

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
    fetchTopItems()
  }

  const handleQuickAdd = async (name: string) => {
    await handleAddItem(name, 1, 'Other')
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

  return (
    <div className="min-h-screen pastel-bg">
      <header className="sticky top-0 z-20 safe-top transition-all duration-200">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/30 pb-2 pt-2 px-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-none">
                        <ShoppingCart size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 tracking-tight">❤️ Alisa & Pierre ShopList</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 active:text-violet-600 dark:active:text-violet-400 active:bg-violet-50 dark:active:bg-violet-900/20 rounded-xl transition-all touch-press"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={fetchAll}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 active:text-violet-600 dark:active:text-violet-400 active:bg-violet-50 dark:active:bg-violet-900/20 rounded-xl transition-all touch-press"
                        aria-label="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 safe-bottom">
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-800/30">{error}</div>
        )}

        <div className="space-y-6">
            <AddItemForm onAdd={handleAddItem} suggestions={autocompleteSuggestions} />

            <ShoppingList
              items={items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onValidatePurchases={handleValidatePurchases}
            />

            <div className="grid grid-cols-1 gap-4 pt-8 border-t border-slate-200/50 dark:border-slate-700/50">
                <WeeklyStats purchases={weeklyPurchases} />
                <TopItems topItems={topItems} onQuickAdd={handleQuickAdd} />
                <RecentPurchases purchases={recentPurchases} />
            </div>
        </div>
      </main>
    </div>
  )
}
