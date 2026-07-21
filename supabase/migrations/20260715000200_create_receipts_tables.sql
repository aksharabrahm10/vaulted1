/*
# Create receipts and receipt_items tables (multi-user, owner-scoped)

1. New Tables
- `receipts`: Stores scanned receipt metadata (store, date, total, category, etc.)
  - id (uuid, primary key)
  - user_id (uuid, owner, defaults to auth.uid())
  - store_name (text, not null)
  - store_category (text, e.g. Grocery, Electronics)
  - receipt_date (date, when the purchase was made)
  - total_amount (numeric, total on the receipt)
  - subtotal_amount (numeric, optional subtotal)
  - tax_amount (numeric, optional tax)
  - item_count (int, number of items)
  - receipt_image_url (text, optional URL to stored image)
  - notes (text, optional user notes)
  - is_favorite (boolean, default false)
  - created_at (timestamptz)
- `receipt_items`: Individual line items on a receipt
  - id (uuid, primary key)
  - receipt_id (uuid, foreign key to receipts, cascade delete)
  - name (text, product name)
  - quantity (numeric, default 1)
  - price (numeric, item price)
  - created_at (timestamptz)

2. Indexes
- receipts(user_id) for owner-scoped queries
- receipts(receipt_date) for date-based search
- receipts(store_name) for store search
- receipt_items(receipt_id) for joining

3. Security
- Enable RLS on both tables.
- Owner-scoped CRUD: authenticated users can only access their own receipts and items.
- receipt_items scoped through parent receipts ownership check.
*/

CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  store_category text DEFAULT 'Other',
  receipt_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  subtotal_amount numeric(10,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  item_count int NOT NULL DEFAULT 0,
  receipt_image_url text,
  notes text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  price numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_receipts_store_name ON receipts(store_name);
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_receipts" ON receipts;
CREATE POLICY "select_own_receipts" ON receipts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_receipts" ON receipts;
CREATE POLICY "insert_own_receipts" ON receipts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_receipts" ON receipts;
CREATE POLICY "update_own_receipts" ON receipts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_receipts" ON receipts;
CREATE POLICY "delete_own_receipts" ON receipts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_receipt_items" ON receipt_items;
CREATE POLICY "select_own_receipt_items" ON receipt_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_receipt_items" ON receipt_items;
CREATE POLICY "insert_own_receipt_items" ON receipt_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_receipt_items" ON receipt_items;
CREATE POLICY "update_own_receipt_items" ON receipt_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_receipt_items" ON receipt_items;
CREATE POLICY "delete_own_receipt_items" ON receipt_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid())
  );
