/*
  # Create products table for MTG deck selling

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, deck name)
      - `description` (text, deck description)
      - `price` (numeric, deck price)
      - `deck_cards` (jsonb, card data structure)
      - `main_image_url` (text, main deck image)
      - `colors` (text array, MTG colors)
      - `format` (text, MTG format like Commander)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for authenticated admin write access
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 60.00,
  deck_cards jsonb DEFAULT '{}',
  main_image_url text NOT NULL,
  colors text[] DEFAULT '{}',
  format text DEFAULT 'Commander',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update products (for admin functionality)
CREATE POLICY "Authenticated users can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();