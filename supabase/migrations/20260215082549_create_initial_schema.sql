/*
  # Initial Schema for Order Management System

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `price` (numeric) - Product price
      - `description` (text) - Product description
      - `image_url` (text) - Product image URL
      - `available` (boolean) - Whether product is available for ordering
      - `created_at` (timestamptz) - When product was created
      - `updated_at` (timestamptz) - When product was last updated
    
    - `orders`
      - `id` (uuid, primary key)
      - `customer_name` (text) - Customer's name
      - `phone` (text) - Customer's phone number
      - `address` (text) - Delivery address
      - `status` (text) - Order status (pending, completed, cancelled)
      - `total_amount` (numeric) - Total order amount
      - `created_at` (timestamptz) - When order was created
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key) - Reference to orders table
      - `product_id` (uuid, foreign key) - Reference to products table
      - `quantity` (integer) - Quantity of product ordered
      - `price` (numeric) - Price at the time of order
      - `created_at` (timestamptz) - When item was added

  2. Security
    - Enable RLS on all tables
    - Products: Public can read, only authenticated admins can modify
    - Orders: Public can insert, only authenticated admins can read/update
    - Order items: Public can insert, only authenticated admins can read
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0,
  description text DEFAULT '',
  image_url text DEFAULT '',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  status text DEFAULT 'pending',
  total_amount numeric(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Anyone can view available products"
  ON products FOR SELECT
  USING (available = true);

CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  )
  WITH CHECK (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  )
  WITH CHECK (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

-- Order items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    (auth.jwt()->>'role')::text = 'admin' OR
    (auth.jwt()->'app_metadata'->>'role')::text = 'admin'
  );

-- Insert some sample products
INSERT INTO products (name, price, description, available) VALUES
  ('Пицца Маргарита', 450.00, 'Классическая пицца с томатами и моцареллой', true),
  ('Пицца Пепперони', 550.00, 'Пицца с пепперони и сыром', true),
  ('Бургер Классический', 350.00, 'Сочный бургер с говядиной', true),
  ('Бургер Чизбургер', 400.00, 'Бургер с двойным сыром', true),
  ('Картофель фри', 150.00, 'Хрустящий картофель фри', true),
  ('Салат Цезарь', 320.00, 'Классический салат Цезарь с курицей', true)
ON CONFLICT DO NOTHING;