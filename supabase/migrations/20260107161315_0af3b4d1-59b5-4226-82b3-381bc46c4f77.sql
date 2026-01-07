-- السماح للمستخدمين بإنشاء توكن جديد (بدون auth)
CREATE POLICY "Anyone can create tokens"
ON public.tokens
FOR INSERT
WITH CHECK (true);

-- السماح للمستخدمين بتحديث رصيد التوكن الخاص بهم (للطلبات)
CREATE POLICY "Anyone can update their token balance"
ON public.tokens
FOR UPDATE
USING (true);