-- تحديث دالة توليد رقم الطلب ليكون أرقام فقط
CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.order_number := LPAD(CAST(FLOOR(RANDOM() * 100000000) AS TEXT), 8, '0');
  RETURN NEW;
END;
$function$;