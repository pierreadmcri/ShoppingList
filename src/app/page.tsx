'use client'

import { useState, useEffect, useCallback, useMemo, useRef, type CSSProperties } from 'react'
import { RefreshCw, UsersRound } from 'lucide-react'
import { supabase, appBackgroundUrl, ShoppingItem, PurchaseHistory } from '@/lib/supabase'
import { getProductKey, resolveCategory } from '@/lib/products'
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
  const [isCompleting, setIsCompleting] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [notice, setNotice] = useState<{ message: string; deletedItem?: ShoppingItem } | null>(null)
  const [undoFailed, setUndoFailed] = useState(false)
  const noticeRevision = useRef(0)
  const pendingItems = useRef(new Set<string>())
  const completing = useRef(false)
  const shellRef = useRef<HTMLDivElement>(null)

  const updateDockHeight = useCallback((height: number) => {
    shellRef.current?.style.setProperty('--bottom-dock-height', `${height}px`)
  }, [])

  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('shopping_items')
      .select('*')
      .order('checked', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) setError('Could not load the shopping list. Please refresh to try again.')
    else if (data) setItems(data)
  }, [])

  const fetchRecentPurchases = useCallback(async () => {
    const { data, error } = await supabase
      .from('purchase_history')
      .select('*')
      .order('purchased_at', { ascending: false })
      .limit(40)
    if (error) setError('Could not load recent purchases. Please refresh to try again.')
    else if (data) setRecentPurchases(data)
  }, [])

  const fetchWeeklyPurchases = useCallback(async () => {
    const weekStart = new Date()
    const day = weekStart.getDay()
    const diff = day === 0 ? -6 : 1 - day
    weekStart.setDate(weekStart.getDate() + diff)
    weekStart.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from('purchase_history')
      .select('*')
      .gte('purchased_at', weekStart.toISOString())
      .order('purchased_at', { ascending: false })

    if (error) setError('Could not load weekly purchases. Please refresh to try again.')
    else if (data) setWeeklyPurchases(data)
  }, [])

  const fetchAll = useCallback(async () => {
    setError(null)
    setUndoFailed(false)
    setLoading(true)
    try {
      await Promise.all([fetchItems(), fetchRecentPurchases(), fetchWeeklyPurchases()])
    } catch {
      setError('Could not refresh your data. Please try again.')
    } finally {
      setLoading(false)
    }
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
    setUndoFailed(false)
    try {
      const { error: err } = await supabase
        .from('shopping_items')
        .insert({ name, quantity, category })
      if (err) throw err
      await fetchItems()
    } catch {
      setError('Could not add this item. Your entry is still here — please try again.')
      throw new Error('Could not add item')
    }
  }

  const handleToggle = async (id: string, checked: boolean) => {
    if (completing.current || pendingItems.current.has(id)) return
    pendingItems.current.add(id)
    setPendingCount(pendingItems.current.size)
    setError(null)
    setUndoFailed(false)
    setItems(prev => prev.map(i => i.id === id ? { ...i, checked } : i))
    try {
      const { error: err } = await supabase.from('shopping_items').update({ checked }).eq('id', id)
      if (err) throw err
    } catch {
      setItems(prev => prev.map(i => i.id === id ? { ...i, checked: !checked } : i))
      setError('Could not update this item. Please try again.')
    } finally {
      pendingItems.current.delete(id)
      setPendingCount(pendingItems.current.size)
    }
  }

  const handleDelete = async (id: string) => {
    if (completing.current || pendingItems.current.has(id)) return
    const deletedItem = items.find(item => item.id === id)
    if (!deletedItem) return
    pendingItems.current.add(id)
    setPendingCount(pendingItems.current.size)
    setError(null)
    setUndoFailed(false)
    const revision = ++noticeRevision.current
    setNotice(null)
    setItems(prev => prev.filter(i => i.id !== id))
    try {
      const { error: err } = await supabase.from('shopping_items').delete().eq('id', id)
      if (err) throw err
      if (revision === noticeRevision.current) setNotice({ message: `Removed ${deletedItem.name}`, deletedItem })
    } catch {
      setItems(prev => prev.some(item => item.id === id) ? prev : [...prev, deletedItem])
      setError('Could not remove this item. Please try again.')
    } finally {
      pendingItems.current.delete(id)
      setPendingCount(pendingItems.current.size)
    }
  }

  const handleUndoDelete = async () => {
    const item = notice?.deletedItem
    if (!item || completing.current || pendingItems.current.has(item.id)) return
    const revision = noticeRevision.current
    pendingItems.current.add(item.id)
    setPendingCount(pendingItems.current.size)
    setError(null)
    setUndoFailed(false)
    try {
      const { error: err } = await supabase.from('shopping_items').upsert(item, { onConflict: 'id', ignoreDuplicates: true })
      if (err) throw err
      setItems(prev => prev.some(existing => existing.id === item.id) ? prev : [...prev, item])
      if (revision === noticeRevision.current) setNotice({ message: `Restored ${item.name}` })
    } catch {
      if (revision === noticeRevision.current) {
        setUndoFailed(true)
        setError('Could not restore this item. Please try Undo again.')
      }
    } finally {
      pendingItems.current.delete(item.id)
      setPendingCount(pendingItems.current.size)
    }
  }

  const handleValidatePurchases = async () => {
    const checkedItems = items.filter(i => i.checked)
    if (checkedItems.length === 0 || completing.current || pendingItems.current.size > 0) return
    completing.current = true
    setIsCompleting(true)
    setError(null)
    setUndoFailed(false)
    noticeRevision.current += 1
    setNotice(null)
    let historySaved = false
    try {
      // Reuse each source ID so retrying after a failed delete cannot duplicate history.
      const historyItems = checkedItems.map(i => ({
        id: i.id,
        item_name: i.name,
        quantity: i.quantity,
        category: resolveCategory(i.name, i.category),
      }))
      const { error: saveError } = await supabase.from('purchase_history')
        .upsert(historyItems, { onConflict: 'id', ignoreDuplicates: true })
      if (saveError) throw saveError
      historySaved = true
      const ids = checkedItems.map(i => i.id)
      const { error: deleteError } = await supabase.from('shopping_items').delete().in('id', ids)
      if (deleteError) throw deleteError
      setItems(prev => prev.filter(i => !ids.includes(i.id)))
      setNotice({ message: `Shopping complete · ${ids.length} ${ids.length === 1 ? 'item' : 'items'} saved` })
      await Promise.all([fetchRecentPurchases(), fetchWeeklyPurchases()])
    } catch {
      setError(historySaved
        ? 'Purchases saved, but the list could not be cleared. Try Complete shopping again to finish.'
        : 'Could not save your purchases. Your cart is still here — please try again.')
    } finally {
      completing.current = false
      setIsCompleting(false)
    }
  }

  const autocompleteSuggestions = useMemo(() => {
    const seen = new Set<string>()
    const merged = [...recentPurchases, ...weeklyPurchases]
      .sort((a, b) => Date.parse(b.purchased_at) - Date.parse(a.purchased_at))

    return merged
      .filter((purchase) => {
        const key = getProductKey(purchase.item_name)
        if (!purchase.item_name.trim() || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 25)
      .map((purchase) => ({
        name: purchase.item_name,
        category: resolveCategory(purchase.item_name, purchase.category),
      }))
  }, [recentPurchases, weeklyPurchases])

  const uncheckedCount = items.filter(i => !i.checked).length
  const checkedCount = items.length - uncheckedCount

  return (
    <div
      ref={shellRef}
      className="min-h-screen mediterranean-bg"
      style={{
        '--app-background-image': `url("${appBackgroundUrl}")`,
      } as CSSProperties}
    >
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
              <span>Shared list</span>
            </div>
          </div>

          <div className="flex items-center flex-shrink-0 rounded-full border border-gold/30 bg-cream/75 p-1">
              <button
                onClick={fetchAll}
                disabled={loading || isCompleting || pendingCount > 0}
                className="w-11 h-11 flex items-center justify-center text-olive dark:text-sage active:text-terracotta rounded-full transition-all touch-press disabled:opacity-50"
                aria-label="Refresh"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 bottom-nav-clearance relative z-10">
        {view === 'list' ? (
          <div className="space-y-5 animate-enter">
            <AddItemForm onAdd={handleAddItem} suggestions={autocompleteSuggestions} />
            {loading && items.length === 0 ? (
              <p role="status" className="py-12 text-center text-olive">Loading your list…</p>
            ) : <ShoppingList
              items={items}
              onToggle={handleToggle}
              onDelete={handleDelete}
              disabled={isCompleting}
            />}
          </div>
        ) : (
          <div className="space-y-4 animate-enter">
            <WeeklyStats purchases={weeklyPurchases} />
            <RecentPurchases purchases={recentPurchases} />
          </div>
        )}
      </main>

      <BottomNav
        view={view}
        onChange={(nextView) => {
          setView(nextView)
          window.scrollTo({ top: 0, behavior: 'instant' })
        }}
        listBadge={uncheckedCount}
        checkedCount={checkedCount}
        isCompleting={isCompleting}
        isBusy={pendingCount > 0}
        onComplete={handleValidatePurchases}
        message={error || notice?.message}
        isError={!!error}
        onUndo={notice?.deletedItem && (!error || undoFailed) ? handleUndoDelete : undefined}
        onDismiss={() => { noticeRevision.current += 1; setError(null); setNotice(null); setUndoFailed(false) }}
        onHeightChange={updateDockHeight}
      />
    </div>
  )
}
