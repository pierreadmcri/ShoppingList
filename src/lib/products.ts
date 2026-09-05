export type ProductCategory =
  | 'Fruit & Vegetables' | 'Meat & Fish' | 'Dairy & Eggs' | 'Pantry & Bread'
  | 'Snacks' | 'Drinks' | 'Home' | 'Personal Care' | 'To classify'

type Product = {
  id: string
  name: string
  category: ProductCategory
  aliases: string[]
}

function product(id: string, name: string, category: ProductCategory, ...aliases: string[]): Product {
  return { id, name, category, aliases }
}

// Household aliases are explicit: unknown names must not be guessed from substrings.
// Keep distinct products separate even when they belong to the same category.
export const PRODUCTS: readonly Product[] = [
  product('starbucks-cappuccino', 'Starbucks Cappuccino', 'Drinks', 'buck buck', 'buckbuck', 'buk buk', 'starbucks capuccino', 'café starbucks capuccino', 'café starbucks cappuccino'),
  product('doowap', 'DooWap', 'Snacks', 'breakfast', 'doo wap'),
  product('nature-valley', 'Nature Valley bars', 'Snacks', 'snack', 'nature valley', 'nature valley oats & dark chocolate', 'nature valley oats & honey', 'oats & dark chocolate', 'oats & honey'),
  product('salad', 'Salad leaves', 'Fruit & Vegetables', 'salad', 'salade', 'salade à composer', 'salade verte', 'lettuce', 'laitue'),
  product('fabric-softener', 'Fabric softener', 'Home', 'smell good', 'cleaning smell good', 'washing perfume', 'assouplissant', 'adoucissant'),
  product('laundry-detergent', 'Laundry detergent', 'Home', 'cleaning machine', 'washing detergent', 'lessive'),
  product('exfoliating-cream', 'Exfoliating cream', 'Personal Care', 'scrub', 'crème soin gommante', 'crème gommante', 'gommage'),
  product('moisturizer', 'Moisturizer', 'Personal Care', 'cream', 'crème hydratante', 'moisturiser'),
  product('prunes', 'Prunes', 'Pantry & Bread', 'prune', 'pruneau', 'pruneaux'),
  product('bell-pepper', 'Bell pepper', 'Fruit & Vegetables', 'sweet chili', 'poivron', 'poivrons', 'bell peppers'),

  product('avocado', 'Avocado', 'Fruit & Vegetables', 'avocados', 'avocat', 'avocats'),
  product('cucumber', 'Cucumber', 'Fruit & Vegetables', 'cucomber', 'cucumbers', 'concombre', 'concombres'),
  product('banana', 'Banana', 'Fruit & Vegetables', 'bananas', 'banane', 'bananes'),
  product('tomato', 'Tomato', 'Fruit & Vegetables', 'tomatoes', 'tomate', 'tomates'),
  product('mushroom', 'Mushrooms', 'Fruit & Vegetables', 'mushroom', 'champignon', 'champignons'),
  product('grapes', 'Grapes', 'Fruit & Vegetables', 'grape', 'raisin', 'raisins'),
  product('fruit', 'Fruit', 'Fruit & Vegetables', 'fruits'),
  product('lemon', 'Lemon', 'Fruit & Vegetables', 'lemons', 'citron', 'citrons'),
  product('lime', 'Lime', 'Fruit & Vegetables', 'limes', 'citron vert', 'citrons verts'),
  product('mandarin', 'Mandarin', 'Fruit & Vegetables', 'mandarine', 'mandarines'),
  product('cabbage', 'Cabbage', 'Fruit & Vegetables', 'chou', 'choux'),
  product('cauliflower', 'Cauliflower', 'Fruit & Vegetables', 'chou fleur', 'choux fleurs'),
  product('broccoli', 'Broccoli', 'Fruit & Vegetables', 'brocoli', 'brocolis'),
  product('spinach', 'Spinach', 'Fruit & Vegetables', 'épinard', 'épinards'),
  product('potato', 'Potatoes', 'Fruit & Vegetables', 'potato', 'pomme de terre', 'pommes de terre'),
  product('onion', 'Onions', 'Fruit & Vegetables', 'onion', 'oignon', 'oignons'),
  product('red-onion', 'Red onion', 'Fruit & Vegetables', 'red onions', 'oignon rouge', 'oignons rouges'),
  product('garlic', 'Garlic', 'Fruit & Vegetables', 'ail'),
  product('green-apple', 'Green apple', 'Fruit & Vegetables', 'green apples', 'pomme verte', 'pommes vertes'),
  product('apple', 'Apple', 'Fruit & Vegetables', 'apples', 'pomme', 'pommes'),
  product('melon', 'Melon', 'Fruit & Vegetables', 'melons'),
  product('dill', 'Dill', 'Fruit & Vegetables', 'aneth'),
  product('coriander', 'Coriander', 'Fruit & Vegetables', 'corandier', 'coriandre'),
  product('basil', 'Basil', 'Fruit & Vegetables', 'basilic'),
  product('chili', 'Chili pepper', 'Fruit & Vegetables', 'chili', 'piment', 'piments'),

  product('chicken', 'Chicken', 'Meat & Fish', 'poulet'),
  product('salmon', 'Salmon', 'Meat & Fish', 'saumon'),
  product('squid', 'Squid', 'Meat & Fish', 'frozen squid', 'calamar', 'calamars', 'calmar'),
  product('shrimp', 'Shrimp', 'Meat & Fish', 'shrimps', 'prawn', 'prawns', 'crevette', 'crevettes'),
  product('bacon', 'Bacon', 'Meat & Fish', 'lard'),
  product('raclette-ham', 'Raclette ham', 'Meat & Fish', 'jambon à raclette'),
  product('tuna', 'Tuna', 'Meat & Fish', 'thon'),
  product('mackerel', 'Mackerel', 'Meat & Fish', 'maquereau', 'maquereaux'),
  product('sardines-tomato', 'Sardines in tomato sauce', 'Meat & Fish', 'sardines tomato', 'sardines à la tomate'),
  product('pork', 'Pork', 'Meat & Fish', 'porc'),
  product('minced-pork', 'Minced pork', 'Meat & Fish', 'porc haché'),
  product('meat', 'Meat', 'Meat & Fish', 'viande', 'viande en plus'),
  product('sausages', 'Chipolatas / merguez', 'Meat & Fish', 'chipo merguez', 'merguez', 'chipolatas'),
  product('butter-chicken', 'Butter chicken', 'Meat & Fish'),
  product('chicken-masala', 'Chicken masala', 'Meat & Fish'),

  product('milk', 'Milk', 'Dairy & Eggs', 'lait'),
  product('eggs', 'Eggs', 'Dairy & Eggs', 'egg', 'œuf', 'œufs', 'oeuf', 'oeufs'),
  product('butter', 'Butter', 'Dairy & Eggs', 'beurre'),
  product('yogurt', 'Yogurt', 'Dairy & Eggs', 'yoghurt', 'yaourt', 'yaourts'),
  product('strawberry-yogurt', 'Strawberry yogurt', 'Dairy & Eggs', 'yaourt fraise', 'yaourt à la fraise'),
  product('raclette-cheese', 'Raclette cheese', 'Dairy & Eggs', 'fromage à raclette'),
  product('cream-cheese', 'Cream cheese', 'Dairy & Eggs', 'fromage à tartiner'),
  product('cooking-cream', 'Cooking cream', 'Dairy & Eggs', 'crème fraîche', 'crème liquide', 'heavy cream', 'double cream'),
  product('cheese', 'Cheese', 'Dairy & Eggs', 'fromage'),

  product('bread', 'Bread', 'Pantry & Bread', 'pain'),
  product('my-bread', 'My bread', 'Pantry & Bread'),
  product('rice', 'Rice', 'Pantry & Bread', 'riz'),
  product('sticky-rice', 'Sticky rice', 'Pantry & Bread', 'riz gluant'),
  product('spaghetti', 'Spaghetti', 'Pantry & Bread', 'spaghettis'),
  product('pasta', 'Pasta', 'Pantry & Bread', 'pâtes'),
  product('olive-oil', 'Olive oil', 'Pantry & Bread', 'huile d olive'),
  product('vinegar', 'Vinegar', 'Pantry & Bread', 'vinaigre'),
  product('mayonnaise', 'Mayonnaise', 'Pantry & Bread', 'mayo'),
  product('sugar', 'Sugar', 'Pantry & Bread', 'sucre'),
  product('pickles', 'Pickles', 'Pantry & Bread', 'pickle', 'cornichon', 'cornichons'),
  product('dates', 'Dates', 'Pantry & Bread', 'datte', 'dattes'),
  product('sweet-chili-sauce', 'Sweet chili sauce', 'Pantry & Bread', 'sauce sweet chili', 'sauce chili'),

  product('chewing-gum', 'Chewing gum', 'Snacks', 'gum', 'chewing gums'),
  product('peanuts', 'Peanuts', 'Snacks', 'peanut', 'cacahuète', 'cacahuètes'),
  product('unsalted-peanuts', 'Unsalted peanuts', 'Snacks', 'peanut no salt', 'cacahuètes sans sel'),
  product('cashews', 'Cashew nuts', 'Snacks', 'cashews', 'noix de cajou'),
  product('crisps', 'Crisps', 'Snacks', 'chips'),
  product('ice-cream', 'Ice cream', 'Snacks', 'glace', 'glaces'),
  product('cornetto-chocolate', 'Chocolate Cornetto', 'Snacks', 'corneto choco', 'cornetto choco'),
  product('milka-cookies', 'Milka mini cookies', 'Snacks'),
  product('my-cookie', 'My cookie', 'Snacks'),
  product('cookies', 'Cookies', 'Snacks', 'cookie', 'biscuit', 'biscuits'),
  product('bean-cake', 'Bean cake', 'Snacks', 'beans cake'),
  product('fruit-cake', 'Fruit cake', 'Snacks'),
  product('lava-chocolate', 'Chocolate lava cake', 'Snacks', 'lava chocolate'),
  product('chestnut-cookie', 'Japanese chestnut cookie', 'Snacks', 'japan cookie chestnut'),
  product('protein-bar', 'Protein bar', 'Snacks', 'protein bars', 'barre protéinée'),
  product('panna-cotta', 'Panna cotta', 'Snacks', 'pana cota'),

  product('cola', 'Coca-Cola', 'Drinks', 'coca cola', 'coca', 'coke'),
  product('water', 'Water', 'Drinks', 'eau'),
  product('sparkling-water', 'Sparkling water', 'Drinks', 'eau gazeuse'),
  product('san-pellegrino', 'San Pellegrino', 'Drinks', 'sanpellegrino'),
  product('evian', 'Evian', 'Drinks', 'evian princess'),
  product('coffee', 'Coffee', 'Drinks', 'café'),
  product('nescafe', 'Nescafé', 'Drinks'),

  product('cleaner', 'Cleaning product', 'Home', 'cleaning liquid', 'cleaning detergent', 'nettoyant'),
  product('washing-liquid', 'Washing liquid', 'Home'),
  product('dishwashing', 'Dishwashing product', 'Home', 'dish washing', 'dishwashing liquid', 'liquide vaisselle'),
  product('laundry-disinfectant', 'Sanytol laundry disinfectant', 'Home', 'sanytol gym clothes'),
  product('paper-towels', 'Paper towels', 'Home', 'kitchen tissue', 'sopalin', 'essuie tout'),
  product('toilet-paper', 'Toilet paper', 'Home', 'papier toilette', 'papier wc'),
  product('tissues', 'Tissues', 'Home', 'tissue', 'mouchoir', 'mouchoirs'),
  product('garbage-bags', 'Garbage bags', 'Home', 'sacs poubelle', 'sac poubelle'),
  product('sponge', 'Sponge', 'Home', 'éponge', 'éponges'),
  product('battery', 'Batteries', 'Home', 'battery', 'pile', 'piles'),
  product('bag', 'Bag', 'Home', 'sac'),
  product('shower-curtain', 'Shower curtain', 'Home', 'rideau de douche'),
  product('shower-head', 'Shower head', 'Home', 'pommeau de douche'),

  product('deodorant', 'Deodorant', 'Personal Care', 'deo', 'déodorant'),
  product('toothpaste', 'Toothpaste', 'Personal Care', 'tooth paste', 'dentifrice'),
  product('toothbrush', 'Toothbrush', 'Personal Care', 'tooth brush', 'brosse à dents'),
  product('shower-gel', 'Shower gel', 'Personal Care', 'gel douche'),
  product('soap', 'Soap', 'Personal Care', 'savon'),
  product('sunscreen', 'Sunscreen', 'Personal Care', 'sunscreen 50', 'crème solaire'),
  product('sleeping-pill', 'Sleeping pills', 'Personal Care', 'sleeping pill', 'somnifère', 'somnifères'),
]

export function normalizeProductName(name: string): string {
  return name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/œ/g, 'oe').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().replace(/\s+/g, ' ')
}

const productsByAlias = new Map<string, Product>()
for (const entry of PRODUCTS) {
  for (const alias of [entry.name, ...entry.aliases]) {
    const key = normalizeProductName(alias)
    const existing = productsByAlias.get(key)
    if (existing && existing.id !== entry.id) throw new Error(`Duplicate product alias: ${alias}`)
    productsByAlias.set(key, entry)
  }
}

const emojiProducts: Record<string, string> = {
  '🥚': 'eggs', '🥓': 'bacon', '🍤': 'shrimp', '🥜': 'peanuts', '🍇': 'grapes',
  '🥒': 'cucumber', '🍌': 'banana', '🍅': 'tomato', '🫑': 'bell-pepper', '🌶': 'chili',
  '🥔': 'potato', '🧅': 'onion', '🥑': 'avocado', '🥦': 'broccoli', '🍋': 'lemon',
  '🍋‍🟩': 'lime', '🍄‍🟫': 'mushroom', '🍞': 'bread', '🧻': 'toilet-paper',
}

function withoutQuantity(name: string): string {
  // Only explicit quantity wrappers; never remove product numbers such as SPF 50.
  return name.replace(/^\d+(?:[.,]\d+)?\s*(?:(?:kg|gr|g|ml|cl|l)\s+|x\s*)?/i, '')
    .replace(/\s+\d+(?:\s*(?:boxes|box|packs|pack|kg|gr|g|ml|cl|l))?$/i, '').trim()
}

export function identifyProduct(name: string): Product | undefined {
  const normalized = normalizeProductName(name)
  const exact = productsByAlias.get(normalized)
  if (exact) return exact
  const unwrapped = normalizeProductName(withoutQuantity(name.trim()))
  const withoutAmount = productsByAlias.get(unwrapped)
  if (withoutAmount) return withoutAmount

  // Text takes precedence over decorative emojis ("Salmon 🍣", "Olive 🫒 oil").
  // Only a single repeated, known emoji is safe to interpret without text.
  if (/[\p{L}\p{N}]/u.test(withoutQuantity(name.trim()))) return undefined
  const emojis = name.replace(/[\s\uFE0F\d]/g, '')
  for (const [emoji, id] of Object.entries(emojiProducts)) {
    if (emojis && emojis.split(emoji).join('') === '') {
      return PRODUCTS.find(entry => entry.id === id)
    }
  }
  return undefined
}

export function inferCategory(name: string): ProductCategory {
  return identifyProduct(name)?.category ?? 'To classify'
}

export function resolveCategory(name: string, savedCategory?: string | null): ProductCategory {
  // "Other" is the legacy default. New explicit "To classify" selections stay put.
  // Already assigned categories remain authoritative, including manual corrections.
  const validCategories: readonly string[] = [
    'Fruit & Vegetables', 'Meat & Fish', 'Dairy & Eggs', 'Pantry & Bread',
    'Snacks', 'Drinks', 'Home', 'Personal Care', 'To classify',
  ]
  if (savedCategory && validCategories.includes(savedCategory)) return savedCategory as ProductCategory
  return inferCategory(name)
}

export function getProductKey(name: string): string {
  return identifyProduct(name)?.id ?? `unknown:${normalizeProductName(name) || name.trim()}`
}

export function getProductName(name: string): string {
  return identifyProduct(name)?.name ?? (normalizeProductName(name) || name.trim())
}

export function matchesProductSearch(name: string, query: string): boolean {
  const normalized = normalizeProductName(query)
  if (!normalized) return !!query.trim() && getProductKey(name) === getProductKey(query)
  const entry = identifyProduct(name)
  return [name, ...(entry ? [entry.name, ...entry.aliases] : [])]
    .some(alias => normalizeProductName(alias).includes(normalized))
}
