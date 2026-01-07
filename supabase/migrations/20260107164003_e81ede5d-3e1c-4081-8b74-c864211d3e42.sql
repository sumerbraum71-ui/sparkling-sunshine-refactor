-- Drop existing restrictive policies on recharge_requests
DROP POLICY IF EXISTS "Admins can update recharge requests" ON public.recharge_requests;
DROP POLICY IF EXISTS "Admins can delete recharge requests" ON public.recharge_requests;

-- Create permissive policies for recharge_requests
CREATE POLICY "Anyone can update recharge requests" 
ON public.recharge_requests 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete recharge requests" 
ON public.recharge_requests 
FOR DELETE 
USING (true);

-- Also fix tokens table update policy to allow balance updates
DROP POLICY IF EXISTS "Admins can update tokens" ON public.tokens;

CREATE POLICY "Anyone can update tokens for recharge" 
ON public.tokens 
FOR UPDATE 
USING (true);