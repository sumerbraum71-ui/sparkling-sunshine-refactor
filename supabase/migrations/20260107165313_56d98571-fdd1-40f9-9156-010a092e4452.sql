-- Drop existing restrictive RLS policies on products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Create permissive policies for products
CREATE POLICY "Anyone can insert products"
ON public.products
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update products"
ON public.products
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete products"
ON public.products
FOR DELETE
USING (true);

-- Also fix product_options table
DROP POLICY IF EXISTS "Admins can insert product options" ON public.product_options;
DROP POLICY IF EXISTS "Admins can update product options" ON public.product_options;
DROP POLICY IF EXISTS "Admins can delete product options" ON public.product_options;

CREATE POLICY "Anyone can insert product options"
ON public.product_options
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update product options"
ON public.product_options
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete product options"
ON public.product_options
FOR DELETE
USING (true);