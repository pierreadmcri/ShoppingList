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

  // --- Chargement des données ---
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
      .limit(20)
    if (data) setRecentPurchases(data)
  }, [])

  const fetchTopItems = useCallback(async () => {
    const { data } = await supabase.rpc('get_top_items', { limit_count: 10 })
    if (data) setTopItems(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchItems(), fetchRecentPurchases(), fetchTopItems()])
    setLoading(false)
  }, [fetchItems, fetchRecentPurchases, fetchTopItems])

  // --- Initialisation et Temps réel ---
  useEffect(() => {
    let ignore = false
    async function load() {
      await fetchAll()
    }
    load()
    return () => { ignore = true }
  }, []) // On lance fetchAll au montage uniquement

  useEffect(() => {
    const channel = supabase
      .channel('shopping-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, fetchItems)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_history' }, () => {
        fetchRecentPurchases()
        fetchTopItems()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchItems, fetchRecentPurchases, fetchTopItems])

  // --- Handlers (Actions) ---
  const handleAddItem = async (name: string, quantity: number, category: string) => {
    setError(null)
    const { error: err } = await supabase
      .from('shopping_items')
      .insert({ name, quantity, category })
    if (err) setError(err.message)
    else fetchItems()
  }

  const handleToggle = async (id: string, checked: boolean) => {
    // Optimistic UI update (mise à jour immédiate avant la réponse serveur)
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
    
    // Séquence : Ajouter historique -> Supprimer items -> Rafraîchir UI
    await supabase.from('purchase_history').insert(historyItems)
    const ids = checkedItems.map(i => i.id)
    await supabase.from('shopping_items').delete().in('id', ids)

    setItems(prev => prev.filter(i => !i.checked))
    fetchRecentPurchases()
    fetchTopItems()
  }

  const handleQuickAdd = async (name: string) => {
    await handleAddItem(name, 1, 'Other')
  }

  // --- Rendu ---
  return (
    <div className="min-h-screen pastel-bg">
      {/* Header Sticky adapté iPhone (flou + safe-area) */}
      <header className="sticky top-0 z-20 safe-top transition-all duration-200">
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 pb-2 pt-2 px-4">
            <div className="max-w-2xl mx-auto flex items-center justify-between h-14">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-200">
                        <ShoppingCart size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 tracking-tight">MyShopList</span>
                </div>

                <button
                    onClick={fetchAll}
                    className="w-10 h-10 flex items-center justify-center text-slate-400 active:text-violet-600 active:bg-violet-50 rounded-xl transition-all touch-press"
                    aria-label="Refresh"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 safe-bottom">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</div>
        )}

        <div className="space-y-6">
            {/* Formulaire d'ajout */}
            <AddItemForm onAdd={handleAddItem} />

            {/* Liste principale */}
            <ShoppingList
              items={items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onValidatePurchases={handleValidatePurchases}
            />
            
            {/* Widgets (Top & Récent) - Empilés en bas pour mobile */}
            <div className="grid grid-cols-1 gap-4 pt-8 border-t border-slate-200/50">
                <TopItems topItems={topItems} onQuickAdd={handleQuickAdd} />
                <RecentPurchases purchases={recentPurchases} />
            </div>
        </div>
      </main>
    </div>
  )
}