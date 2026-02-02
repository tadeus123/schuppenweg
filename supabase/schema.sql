-- Schuppenweg Database Schema
-- Run this in the Supabase SQL editor if automatic migration fails

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  diagnosis TEXT CHECK (diagnosis IN ('oily', 'dry', NULL)),
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'diagnosed', 'shipped', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create order_images table
CREATE TABLE IF NOT EXISTS order_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('front', 'back', 'left', 'right', 'top')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON order_images(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;

-- Policies for orders table
CREATE POLICY "Service role can do everything on orders"
  ON orders FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT TO anon WITH CHECK (true);

-- Policies for order_images table
CREATE POLICY "Service role can do everything on order_images"
  ON order_images FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can read order_images"
  ON order_images FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anyone can insert order_images"
  ON order_images FOR INSERT TO anon WITH CHECK (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for head images
-- Note: Create this manually in Supabase Storage dashboard:
-- Bucket name: head-images
-- Public: false (private)
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Test table for connection verification
CREATE TABLE IF NOT EXISTS test_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
