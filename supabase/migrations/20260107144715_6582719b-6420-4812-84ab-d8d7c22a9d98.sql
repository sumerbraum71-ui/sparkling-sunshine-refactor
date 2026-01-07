-- Add missing columns to tokens table
ALTER TABLE public.tokens
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Add missing columns to orders table
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS order_number text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS password text,
ADD COLUMN IF NOT EXISTS verification_link text,
ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS amount numeric;

-- Update order_number with a trigger
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || LPAD(CAST(FLOOR(RANDOM() * 1000000) AS TEXT), 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Add missing columns to product_options table
ALTER TABLE public.product_options
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS available integer,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS estimated_time text;

-- Rename option_id to product_option_id reference in stock_items if needed
ALTER TABLE public.stock_items
ADD COLUMN IF NOT EXISTS option_id uuid REFERENCES product_options(id),
ADD COLUMN IF NOT EXISTS sold_to_order_id uuid REFERENCES orders(id);

-- Copy data from product_option_id to option_id if exists
UPDATE public.stock_items SET option_id = product_option_id WHERE option_id IS NULL;

-- Add missing columns to coupons table
ALTER TABLE public.coupons
ADD COLUMN IF NOT EXISTS used_count integer DEFAULT 0;

-- Add missing columns to recharge_requests table
ALTER TABLE public.recharge_requests
ADD COLUMN IF NOT EXISTS payment_method text;

-- Add missing columns to payment_methods table
ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS account_name text,
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add missing columns to products table  
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image text,
ADD COLUMN IF NOT EXISTS price numeric,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS available integer;