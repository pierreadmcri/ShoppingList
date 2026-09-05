import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getProductKey, getProductName, identifyProduct, inferCategory,
  matchesProductSearch, normalizeProductName, resolveCategory,
} from '../src/lib/products.ts'

test('confirmed household aliases identify the right product and category', () => {
  const cases = [
    ['Buck buck', 'Starbucks Cappuccino', 'Drinks'],
    ['Buckbuck', 'Starbucks Cappuccino', 'Drinks'],
    ['Buk buk', 'Starbucks Cappuccino', 'Drinks'],
    ['Breakfast', 'DooWap', 'Snacks'],
    ['Snack', 'Nature Valley bars', 'Snacks'],
    ['Nature Valley, Oats & Dark Chocolate', 'Nature Valley bars', 'Snacks'],
    ['Nature Valley Oats & Honey', 'Nature Valley bars', 'Snacks'],
    ['Salad', 'Salad leaves', 'Fruit & Vegetables'],
    ['Smell good', 'Fabric softener', 'Home'],
    ['Cleaning smell good', 'Fabric softener', 'Home'],
    ['Washing perfume', 'Fabric softener', 'Home'],
    ['Cleaning machine', 'Laundry detergent', 'Home'],
    ['scrub', 'Exfoliating cream', 'Personal Care'],
    ['Cream', 'Moisturizer', 'Personal Care'],
    ['Prune', 'Prunes', 'Pantry & Bread'],
    ['1 Sweet chili🫑', 'Bell pepper', 'Fruit & Vegetables'],
  ]
  for (const [input, name, category] of cases) {
    assert.equal(getProductName(input), name, input)
    assert.equal(inferCategory(input), category, input)
  }
})

test('recognizes known spelling, accents, emojis and quantity wrappers', () => {
  for (const variants of [
    ['Cucumber 🥒', 'Cucomber', 'concombre'],
    ['Eggs', 'eggs 🥚', '🥚', 'ŒUFS'],
    ['Grape', 'grape', '🍇🍇🍇🍇'],
    ['Tooth paste', 'Toothpaste', 'dentifrice'],
    ['Mushroom', 'Mushroom 🍄‍🟫  1 box', 'champignons'],
    ['Chicken', '250gr chicken', '250 g chicken', '2 x chicken'],
    ['Olive oil', 'Olive 🫒 oil', 'huile d’olive'],
    ['Onions', 'Onions 🧅 1'],
    ['squid', '300gr squid', 'Frozen squid'],
    ['🥜', 'peanut'],
    ['🍋‍🟩', 'lime'],
  ]) {
    assert.ok(identifyProduct(variants[0]), variants[0])
    for (const variant of variants) {
      assert.equal(getProductKey(variant), getProductKey(variants[0]), variant)
    }
  }
  assert.equal(normalizeProductName('  CrÈme   hydratante '), 'creme hydratante')
})

test('does not confuse household meanings with similarly named products', () => {
  assert.equal(inferCategory('Cream'), 'Personal Care')
  assert.equal(inferCategory('Cream cheese'), 'Dairy & Eggs')
  assert.equal(inferCategory('crème fraîche'), 'Dairy & Eggs')
  assert.equal(inferCategory('Ice cream'), 'Snacks')
  assert.equal(inferCategory('sweet chili sauce'), 'Pantry & Bread')
  assert.equal(inferCategory('Butter Chicken'), 'Meat & Fish')
  assert.notEqual(getProductKey('Butter Chicken'), getProductKey('Butter'))
  assert.notEqual(getProductKey('Milk'), getProductKey('Coconut milk'))
  assert.notEqual(getProductKey('Red onion'), getProductKey('Onions'))
  assert.notEqual(getProductKey('My bread'), getProductKey('Bread'))
  assert.notEqual(getProductKey('🥚'), getProductKey('🥓'))
  assert.notEqual(getProductKey('🦄'), getProductKey('🎁'))
})

test('unrecognized and ambiguous entries remain unclassified', () => {
  for (const input of ['', '1 lunch', '1 diner', 'Something new', '🍇🥚', 'Salad chicken broccoli 🥦', 'Unknown cream 🥚']) {
    assert.equal(identifyProduct(input), undefined, input)
    assert.equal(inferCategory(input), 'To classify', input)
  }
})

test('legacy defaults are classified without overriding saved choices', () => {
  assert.equal(resolveCategory('Buck buck', 'Other'), 'Drinks')
  assert.equal(resolveCategory('Cream', null), 'Personal Care')
  assert.equal(resolveCategory('Eggs', 'retired category'), 'Dairy & Eggs')
  assert.equal(resolveCategory('Milk', 'Drinks'), 'Drinks')
  assert.equal(resolveCategory('Cream', 'Dairy & Eggs'), 'Dairy & Eggs')
  assert.equal(resolveCategory('Buck buck', 'To classify'), 'To classify')
  assert.equal(resolveCategory('1 lunch', 'Other'), 'To classify')
})

test('search finds historical nicknames by their actual product or another alias', () => {
  assert.equal(matchesProductSearch('Buck buck', 'starbucks'), true)
  assert.equal(matchesProductSearch('Buckbuck', 'buk buk'), true)
  assert.equal(matchesProductSearch('Breakfast', 'doowap'), true)
  assert.equal(matchesProductSearch('Snack', 'honey'), true)
  assert.equal(matchesProductSearch('Cream', 'crème hydratante'), true)
  assert.equal(matchesProductSearch('Eggs', '🥚'), true)
  assert.equal(matchesProductSearch('Coca cola', '🦄'), false)
  assert.equal(matchesProductSearch('Milk', 'buck'), false)
})

test('statistics combine aliases without changing source names or quantities', () => {
  const purchases = [
    { name: 'Buck buck', quantity: 2 },
    { name: 'Buckbuck', quantity: 1 },
    { name: 'Buk buk', quantity: 3 },
    { name: 'Coffee', quantity: 1 },
  ]
  const before = structuredClone(purchases)
  const counts = new Map()
  for (const { name } of purchases) {
    const canonicalName = getProductName(name)
    counts.set(canonicalName, (counts.get(canonicalName) ?? 0) + 1)
  }
  assert.equal(counts.get('Starbucks Cappuccino'), 3)
  assert.equal(counts.get('Coffee'), 1)
  assert.deepEqual(purchases, before)
})
