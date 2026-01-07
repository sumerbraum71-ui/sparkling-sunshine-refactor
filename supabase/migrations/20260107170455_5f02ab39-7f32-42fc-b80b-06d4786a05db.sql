-- Allow first admin to register (when no admins exist)
DROP POLICY IF EXISTS "Super admins can manage admin_auth" ON public.admin_auth;

-- Allow insert for authenticated users when no admins exist OR by super admins
CREATE POLICY "First admin or super admin can insert admin_auth"
ON public.admin_auth
FOR INSERT
WITH CHECK (
  -- Allow if no admins exist yet (first registration)
  NOT EXISTS (SELECT 1 FROM public.admin_auth)
  OR
  -- Or if current user is super admin
  is_super_admin(auth.uid())
);

-- Allow updates by super admins only
CREATE POLICY "Super admins can update admin_auth"
ON public.admin_auth
FOR UPDATE
USING (is_super_admin(auth.uid()));

-- Allow delete by super admins only
CREATE POLICY "Super admins can delete admin_auth"
ON public.admin_auth
FOR DELETE
USING (is_super_admin(auth.uid()));