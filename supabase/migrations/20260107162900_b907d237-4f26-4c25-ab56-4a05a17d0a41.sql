-- جدول المستخدمين المحليين للأدمن
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  can_manage_orders boolean NOT NULL DEFAULT false,
  can_manage_products boolean NOT NULL DEFAULT false,
  can_manage_tokens boolean NOT NULL DEFAULT false,
  can_manage_refunds boolean NOT NULL DEFAULT false,
  can_manage_stock boolean NOT NULL DEFAULT false,
  can_manage_coupons boolean NOT NULL DEFAULT false,
  can_manage_recharges boolean NOT NULL DEFAULT false,
  can_manage_payment_methods boolean NOT NULL DEFAULT false,
  can_manage_users boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- السماح للجميع بقراءة المستخدمين (للتحقق من تسجيل الدخول)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin users for login" 
ON public.admin_users 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert admin users" 
ON public.admin_users 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update admin users" 
ON public.admin_users 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete admin users" 
ON public.admin_users 
FOR DELETE 
USING (true);