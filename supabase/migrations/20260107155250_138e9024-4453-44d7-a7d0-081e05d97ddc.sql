-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Create policies for payment proofs bucket
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Anyone can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Admins can delete payment proofs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'payment-proofs' AND has_role(auth.uid(), 'admin'::app_role));

-- Add proof_image_url column to recharge_requests if not exists
ALTER TABLE public.recharge_requests ADD COLUMN IF NOT EXISTS proof_image_url text;