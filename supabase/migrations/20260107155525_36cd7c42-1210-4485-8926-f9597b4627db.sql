-- Add missing columns to recharge_requests
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS sender_name text;
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS sender_phone text;
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS transaction_reference text;
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone;

-- Add is_visible and updated_at to payment_methods
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;
ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();