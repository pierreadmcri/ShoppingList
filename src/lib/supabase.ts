import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export type ShoppingItem = {
  id: string
  name: string
  quantity: number
  category: string
  checked: boolean
  purchased_at: string | null
  created_at: string
}

export type PurchaseHistory = {
  id: string
  item_name: string
  quantity: number
  category: string
  purchased_at: string
}
