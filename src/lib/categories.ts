import type { ProductCategory } from './products'

export type Category = {
  name: ProductCategory
  emoji: string
  id: string
}

export const CATEGORIES: Category[] = [
  { name: 'Fruit & Vegetables', emoji: '🥦', id: 'fresh' },
  { name: 'Meat & Fish', emoji: '🥩', id: 'meat' },
  { name: 'Dairy & Eggs', emoji: '🥚', id: 'dairy' },
  { name: 'Pantry & Bread', emoji: '🍞', id: 'pantry' },
  { name: 'Snacks', emoji: '🍪', id: 'snacks' },
  { name: 'Drinks', emoji: '🧃', id: 'drinks' },
  { name: 'Home', emoji: '🧻', id: 'home' },
  { name: 'Personal Care', emoji: '🧴', id: 'care' },
  { name: 'To classify', emoji: '📦', id: 'other' },
]

export function getCategoryInfo(name: string) {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]
}
