-- Drop existing restrictive RLS policies on stock_items
DROP POLICY IF EXISTS "Admins can read stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Admins can insert stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Admins can update stock items" ON public.stock_items;
DROP POLICY IF EXISTS "Admins can delete stock items" ON public.stock_items;

-- Create permissive policies for stock_items
CREATE POLICY "Anyone can read stock items"
ON public.stock_items
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert stock items"
ON public.stock_items
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update stock items"
ON public.stock_items
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete stock items"
ON public.stock_items
FOR DELETE
USING (true);