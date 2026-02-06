export const CATEGORIES = [
  { name: 'Fruits & Légumes', emoji: '🥬', color: 'bg-green-100 text-green-800' },
  { name: 'Viandes & Poissons', emoji: '🥩', color: 'bg-red-100 text-red-800' },
  { name: 'Produits laitiers', emoji: '🧀', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Boulangerie', emoji: '🥖', color: 'bg-amber-100 text-amber-800' },
  { name: 'Boissons', emoji: '🥤', color: 'bg-blue-100 text-blue-800' },
  { name: 'Épicerie', emoji: '🫙', color: 'bg-orange-100 text-orange-800' },
  { name: 'Surgelés', emoji: '🧊', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Hygiène', emoji: '🧴', color: 'bg-purple-100 text-purple-800' },
  { name: 'Maison', emoji: '🏠', color: 'bg-pink-100 text-pink-800' },
  { name: 'Autre', emoji: '📦', color: 'bg-gray-100 text-gray-800' },
] as const

export function getCategoryInfo(name: string) {
  return CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1]
}
