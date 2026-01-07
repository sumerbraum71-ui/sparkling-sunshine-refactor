-- Create news/announcements table
CREATE TABLE public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read active news" 
ON public.news 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert news" 
ON public.news 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update news" 
ON public.news 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete news" 
ON public.news 
FOR DELETE 
USING (true);