-- Shopping List Items (current list)
CREATE TABLE shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT DEFAULT 'Autre',
  checked BOOLEAN DEFAULT false,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Purchase History (completed purchases)
CREATE TABLE purchase_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  category TEXT DEFAULT 'Autre',
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Index for top items query
CREATE INDEX idx_purchase_history_item_name ON purchase_history(item_name);
CREATE INDEX idx_purchase_history_purchased_at ON purchase_history(purchased_at DESC);

-- RPC function: get top purchased items
CREATE OR REPLACE FUNCTION get_top_items(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(item_name TEXT, count BIGINT) AS $$
  SELECT item_name, COUNT(*) as count
  FROM purchase_history
  GROUP BY item_name
  ORDER BY count DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Enable Row Level Security (open for now, can add auth later)
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth for now)
CREATE POLICY "Allow all on shopping_items" ON shopping_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on purchase_history" ON purchase_history FOR ALL USING (true) WITH CHECK (true);
