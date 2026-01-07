DO $$
DECLARE
  target_user_id UUID;
BEGIN
  FOR target_user_id IN SELECT user_id FROM public.admin_auth
  LOOP
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_auth
    SET 
      is_super_admin = true,
      can_manage_orders = true,
      can_manage_products = true,
      can_manage_tokens = true,
      can_manage_refunds = true,
      can_manage_stock = true,
      can_manage_coupons = true,
      can_manage_users = true,
      can_manage_payment_methods = true,
      can_manage_recharges = true
    WHERE user_id = target_user_id;
  END LOOP;
END $$;
