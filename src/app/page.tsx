'use client'

import { useState, useEffect, useCallback } from 'react'
import { ShoppingCart, RefreshCw } from 'lucide-react'
import { supabase, ShoppingItem, PurchaseHistory } from '@/lib/supabase'
import AddItemForm from '@/components/AddItemForm'
import ShoppingList from '@/components/ShoppingList'
import RecentPurchases from '@/components/RecentPurchases'
import TopItems from '@/components/TopItems'

type TopItem = { item_name: string; count: number }

export default function Home() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [recentPurchases, setRecentPurchases] = useState<PurchaseHistory[]>([])
  const [topItems, setTopItems] = useState<TopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      .limit(30)
    if (data) setRecentPurchases(data)
  }, [])

  const fetchTopItems = useCallback(async () => {
    const { data } = await supabase
      .rpc('get_top_items', { limit_count: 20 })
    if (data) setTopItems(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchItems(), fetchRecentPurchases(), fetchTopItems()])
    setLoading(false)
  }, [fetchItems, fetchRecentPurchases, fetchTopItems])

  useEffect(() => {
    let ignore = false
    async function load() {
      const [itemsRes, purchasesRes, topRes] = await Promise.all([
        supabase.from('shopping_items').select('*').order('checked', { ascending: true }).order('created_at', { ascending: false }),
        supabase.from('purchase_history').select('*').order('purchased_at', { ascending: false }).limit(30),
        supabase.rpc('get_top_items', { limit_count: 20 }),
      ])
      if (!ignore) {
        if (itemsRes.error) {
          console.error('Fetch items error:', itemsRes.error)
          setError(itemsRes.error.message)
        }
        if (itemsRes.data) setItems(itemsRes.data)
        if (purchasesRes.data) setRecentPurchases(purchasesRes.data)
        if (topRes.data) setTopItems(topRes.data)
        setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('shopping-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, () => {
        fetchItems()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_history' }, () => {
        fetchRecentPurchases()
        fetchTopItems()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchItems, fetchRecentPurchases, fetchTopItems])

  const handleAddItem = async (name: string, quantity: number, category: string) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('shopping_items')
      .insert({ name, quantity, category })
      .select()
      .single()
    if (err) {
      console.error('Supabase insert error:', err)
      setError(err.message)
      return
    }
    if (data) {
      fetchItems()
    }
  }

  const handleToggle = async (id: string, checked: boolean) => {
    await supabase
      .from('shopping_items')
      .update({ checked })
      .eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked } : i))
  }

  const handleDelete = async (id: string) => {
    await supabase
      .from('shopping_items')
      .delete()
      .eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleValidatePurchases = async () => {
    const checkedItems = items.filter(i => i.checked)
    if (checkedItems.length === 0) return

    // Add to purchase history
    const historyItems = checkedItems.map(i => ({
      item_name: i.name,
      quantity: i.quantity,
      category: i.category,
    }))
    await supabase.from('purchase_history').insert(historyItems)

    // Remove checked items from shopping list
    const ids = checkedItems.map(i => i.id)
    await supabase.from('shopping_items').delete().in('id', ids)

    setItems(prev => prev.filter(i => !i.checked))
    fetchRecentPurchases()
    fetchTopItems()
  }

  const handleQuickAdd = async (name: string) => {
    await handleAddItem(name, 1, 'Other')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-indigo-50/30 to-rose-50/20">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md border-b border-violet-100/30 sticky top-0 z-10 safe-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-md shadow-violet-200">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">MyShopList</h1>
              <p className="text-[11px] text-violet-300">Smart grocery list</p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="w-10 h-10 flex items-center justify-center text-violet-300 hover:text-violet-500 active:text-violet-600 transition-colors rounded-xl hover:bg-violet-50 active:bg-violet-100 touch-press"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs font-medium ml-3">Dismiss</button>
          </div>
        )}

        {/* Add Item Form */}
        <div className="mb-5">
          <AddItemForm onAdd={handleAddItem} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Shopping List - takes 2 columns on desktop */}
          <div className="lg:col-span-2">
            <ShoppingList
              items={items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onValidatePurchases={handleValidatePurchases}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-5 sm:space-y-6">
            <TopItems topItems={topItems} onQuickAdd={handleQuickAdd} />
            <RecentPurchases purchases={recentPurchases} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-violet-100/30 mt-8 safe-bottom">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-violet-300">
          MyShopList
        </div>
      </footer>
    </div>
  )
}
