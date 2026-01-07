import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowRight, RefreshCw, Loader2, Send } from "lucide-react";

interface Token {
  id: string;
  token: string;
  balance: number;
}

interface RefundRequest {
  id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const Refund = () => {
  const [tokenInput, setTokenInput] = useState("");
  const [currentToken, setCurrentToken] = useState<Token | null>(null);
  const [reason, setReason] = useState("");
  const [orderId, setOrderId] = useState("");
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem("userToken");
    if (savedToken) {
      verifyToken(savedToken);
    }
  }, []);

  useEffect(() => {
    if (currentToken) {
      fetchRefundRequests();
    }
  }, [currentToken]);

  const verifyToken = async (token: string) => {
    setVerifying(true);
    const { data, error } = await supabase
      .from("tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      toast.error("التوكن غير صحيح");
      setCurrentToken(null);
    } else {
      setCurrentToken(data);
    }
    setVerifying(false);
  };

  const fetchRefundRequests = async () => {
    if (!currentToken) return;

    const { data } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("token_id", currentToken.id)
      .order("created_at", { ascending: false });

    if (data) {
      setRefundRequests(data);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      verifyToken(tokenInput.trim());
    }
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentToken || !reason.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("refund_requests").insert({
      token_id: currentToken.id,
      reason: reason.trim(),
      order_id: orderId.trim() || null,
    });

    if (error) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
    } else {
      toast.success("تم إرسال طلب الاسترداد بنجاح");
      setReason("");
      setOrderId("");
      fetchRefundRequests();
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">قيد المراجعة</Badge>;
      case "approved":
        return <Badge className="bg-primary">مقبول</Badge>;
      case "rejected":
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <RefreshCw className="h-6 w-6" />
              طلب استرداد
            </h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowRight className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!currentToken ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">أدخل التوكن الخاص بك</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="أدخل التوكن هنا..."
                  className="text-center"
                  dir="ltr"
                />
                <Button type="submit" className="w-full" disabled={verifying}>
                  {verifying ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    "تحقق"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تقديم طلب استرداد جديد</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitRefund} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">رقم الطلب (اختياري)</Label>
                    <Input
                      id="orderId"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="أدخل رقم الطلب إن وجد..."
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">سبب الاسترداد *</Label>
                    <Textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="اشرح سبب طلب الاسترداد بالتفصيل..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 ml-2" />
                        إرسال الطلب
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {refundRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>طلبات الاسترداد السابقة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {refundRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 bg-secondary/50 rounded-lg space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleString("ar-SA")}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm">{request.reason}</p>
                      {request.admin_notes && (
                        <div className="mt-2 p-2 bg-background rounded">
                          <p className="text-xs text-muted-foreground">رد الإدارة:</p>
                          <p className="text-sm">{request.admin_notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Refund;
