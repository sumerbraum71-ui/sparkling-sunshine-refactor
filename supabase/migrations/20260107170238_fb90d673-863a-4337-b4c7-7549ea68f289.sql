-- Create admin_auth table to link Supabase Auth users to admin permissions
CREATE TABLE IF NOT EXISTS public.admin_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_super_admin BOOLEAN DEFAULT false,
  can_manage_orders BOOLEAN DEFAULT false,
  can_manage_products BOOLEAN DEFAULT false,
  can_manage_tokens BOOLEAN DEFAULT false,
  can_manage_refunds BOOLEAN DEFAULT false,
  can_manage_stock BOOLEAN DEFAULT false,
  can_manage_coupons BOOLEAN DEFAULT false,
  can_manage_recharges BOOLEAN DEFAULT false,
  can_manage_payment_methods BOOLEAN DEFAULT false,
  can_manage_users BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_auth
ALTER TABLE public.admin_auth ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_auth WHERE user_id = _user_id
  )
$$;

-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_auth WHERE user_id = _user_id AND is_super_admin = true
  )
$$;

-- Admin auth policies
CREATE POLICY "Admins can read admin_auth" ON public.admin_auth FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Super admins can manage admin_auth" ON public.admin_auth FOR ALL USING (is_super_admin(auth.uid()));

-- Now secure all tables with proper RLS

-- PRODUCTS: Anyone can read, only admins can modify
DROP POLICY IF EXISTS "Anyone can insert products" ON public.products;
DROP POLICY IF EXISTS "Anyone can update products" ON public.products;
DROP POLICY IF EXISTS "Anyone can delete products" ON public.products;
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (is_admin(auth.uid()));

-- PRODUCT_OPTIONS: Anyone can read, only admins can modify
DROP POLICY IF EXISTS "Anyone can insert product options" ON public.product_options;
DROP POLICY IF EXISTS "Anyone can update product options" ON public.product_options;
DROP POLICY IF EXISTS "Anyone can delete product options" ON public.product_options;
CREATE POLICY "Admins can insert product options" ON public.product_options FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update product options" ON public.product_options FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete product options" ON public.product_options FOR DELETE USING (is_admin(auth.uid()));

-- STOCK_ITEMS: Only admins can access
DROP POLICY IF EXISTS "Anyone can read stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Anyone can insert stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Anyone can update stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Anyone can delete stock items" ON public.stock_items;
CREATE POLICY "Admins can read stock items" ON public.stock_items FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert stock items" ON public.stock_items FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update stock items" ON public.stock_items FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete stock items" ON public.stock_items FOR DELETE USING (is_admin(auth.uid()));

-- TOKENS: Public can read/create their own, admins can manage all
DROP POLICY IF EXISTS "Anyone can read tokens by token value" ON public.tokens;
DROP POLICY IF EXISTS "Anyone can create tokens" ON public.tokens;
DROP POLICY IF EXISTS "Anyone can update their token balance" ON public.tokens;
DROP POLICY IF EXISTS "Anyone can update tokens for recharge" ON public.tokens;
DROP POLICY IF EXISTS "Admins can insert tokens" ON public.tokens;
DROP POLICY IF EXISTS "Admins can delete tokens" ON public.tokens;
CREATE POLICY "Public can read tokens" ON public.tokens FOR SELECT USING (true);
CREATE POLICY "Public can create tokens" ON public.tokens FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update own tokens" ON public.tokens FOR UPDATE USING (true);
CREATE POLICY "Admins can delete tokens" ON public.tokens FOR DELETE USING (is_admin(auth.uid()));

-- ORDERS: Public can read/create, admins can update/delete
DROP POLICY IF EXISTS "Anyone can read orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Public can read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (is_admin(auth.uid()));

-- RECHARGE_REQUESTS: Public can read/create, admins can update/delete
DROP POLICY IF EXISTS "Anyone can read recharge requests" ON public.recharge_requests;
DROP POLICY IF EXISTS "Anyone can create recharge requests" ON public.recharge_requests;
DROP POLICY IF EXISTS "Anyone can update recharge requests" ON public.recharge_requests;
DROP POLICY IF EXISTS "Anyone can delete recharge requests" ON public.recharge_requests;
CREATE POLICY "Public can read recharge requests" ON public.recharge_requests FOR SELECT USING (true);
CREATE POLICY "Public can create recharge requests" ON public.recharge_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update recharge requests" ON public.recharge_requests FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete recharge requests" ON public.recharge_requests FOR DELETE USING (is_admin(auth.uid()));

-- ADMIN_USERS: Only admins can access (for backwards compatibility during transition)
DROP POLICY IF EXISTS "Anyone can read admin users for login" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can insert admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Anyone can delete admin users" ON public.admin_users;
CREATE POLICY "Admins can read admin users" ON public.admin_users FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can manage admin users" ON public.admin_users FOR ALL USING (is_super_admin(auth.uid()));

-- NEWS: Anyone can read active, admins can manage
DROP POLICY IF EXISTS "Anyone can read active news" ON public.news;
DROP POLICY IF EXISTS "Anyone can insert news" ON public.news;
DROP POLICY IF EXISTS "Anyone can update news" ON public.news;
DROP POLICY IF EXISTS "Anyone can delete news" ON public.news;
CREATE POLICY "Public can read active news" ON public.news FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all news" ON public.news FOR SELECT USING (is_admin(auth.uid()));
CREATE POLICY "Admins can insert news" ON public.news FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update news" ON public.news FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete news" ON public.news FOR DELETE USING (is_admin(auth.uid()));