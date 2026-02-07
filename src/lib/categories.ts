export type Category = {
  name: string
  emoji: string
  id: string
}

export const CATEGORIES = [
  { name: 'Fruit & Vegetables', emoji: '🥦', id: 'fresh' },
  { name: 'Meat & Fish', emoji: '🥩', id: 'meat' },
  { name: 'Drinks', emoji: '🧃', id: 'drinks' },
  { name: 'Home', emoji: '🧻', id: 'home' },
  { name: 'Snacks', emoji: '🍪', id: 'snacks' },
  { name: 'Other', emoji: '📦', id: 'other' },
]

export function getCategoryInfo(name: string) {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]
}