export const CATEGORIES = [
  { name: 'Fruits & Vegetables', emoji: '🥬', color: 'bg-green-100 text-green-800' },
  { name: 'Meat & Fish', emoji: '🥩', color: 'bg-red-100 text-red-800' },
  { name: 'Dairy', emoji: '🧀', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Bakery', emoji: '🥖', color: 'bg-amber-100 text-amber-800' },
  { name: 'Beverages', emoji: '🥤', color: 'bg-blue-100 text-blue-800' },
  { name: 'Pantry', emoji: '🫙', color: 'bg-orange-100 text-orange-800' },
  { name: 'Frozen', emoji: '🧊', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Personal Care', emoji: '🧴', color: 'bg-purple-100 text-purple-800' },
  { name: 'Household', emoji: '🏠', color: 'bg-pink-100 text-pink-800' },
  { name: 'Other', emoji: '📦', color: 'bg-gray-100 text-gray-800' },
] as const

export function getCategoryInfo(name: string) {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]
}
