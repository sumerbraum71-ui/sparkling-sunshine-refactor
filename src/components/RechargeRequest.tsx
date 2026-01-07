import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, CreditCard } from "lucide-react";

interface PaymentMethod {
  id: string;
  name: string;
  account_info: string;
  instructions: string | null;
}

interface RechargeRequestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenId: string;
  onSuccess: (amount: number) => void;
}

const RechargeRequest = ({
  open,
  onOpenChange,
  tokenId,
  onSuccess,
}: RechargeRequestProps) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (data) {
      setPaymentMethods(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMethod || !amount || !paymentProof) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("recharge_requests").insert({
      token_id: tokenId,
      amount: numAmount,
      payment_method_id: selectedMethod,
      payment_proof: paymentProof,
    });

    if (error) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } else {
      toast.success("تم إرسال طلب الشحن بنجاح. سيتم مراجعته قريباً");
      onSuccess(numAmount);
      setAmount("");
      setPaymentProof("");
      setSelectedMethod("");
      onOpenChange(false);
    }

    setLoading(false);
  };

  const selectedPaymentMethod = paymentMethods.find(
    (m) => m.id === selectedMethod
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            شحن الرصيد
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>طريقة الدفع</Label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger>
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPaymentMethod && (
            <div className="p-3 bg-secondary/50 rounded-lg space-y-2">
              <p className="font-medium">معلومات الحساب:</p>
              <p className="text-sm font-mono bg-background p-2 rounded" dir="ltr">
                {selectedPaymentMethod.account_info}
              </p>
              {selectedPaymentMethod.instructions && (
                <p className="text-sm text-muted-foreground">
                  {selectedPaymentMethod.instructions}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ (ر.س)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              step="0.01"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">إثبات الدفع (رابط الصورة)</Label>
            <div className="relative">
              <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="proof"
                value={paymentProof}
                onChange={(e) => setPaymentProof(e.target.value)}
                placeholder="https://..."
                className="pr-10"
                dir="ltr"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              ارفع صورة إثبات الدفع على موقع رفع صور وضع الرابط هنا
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              "إرسال طلب الشحن"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeRequest;
