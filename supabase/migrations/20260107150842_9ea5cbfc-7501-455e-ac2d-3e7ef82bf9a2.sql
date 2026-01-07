-- Add missing columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS option_id uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS response_message text;

-- Add instant_delivery to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS instant_delivery boolean DEFAULT false;

-- Add product_id to stock_items
ALTER TABLE public.stock_items ADD COLUMN IF NOT EXISTS product_id uuid;

-- Add order_number to refund_requests if not exists
ALTER TABLE public.refund_requests ADD COLUMN IF NOT EXISTS order_number text;
ALTER TABLE public.refund_requests ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;

-- Add payment_method column to recharge_requests if not already exists (besides payment_method_id)
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS admin_note text;

-- Add option_id alias (copy from product_option_id if null)
UPDATE public.orders SET option_id = product_option_id WHERE option_id IS NULL AND product_option_id IS NOT NULL;