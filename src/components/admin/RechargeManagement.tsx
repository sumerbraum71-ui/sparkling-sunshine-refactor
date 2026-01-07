import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { RefreshCw, Loader2, Eye, Check, X } from "lucide-react";

interface RechargeRequest {
  id: string;
  token_id: string;
  amount: number;
  payment_method_id: string | null;
  payment_proof: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  tokens?: { token: string; balance: number };
  payment_methods?: { name: string };
}

const RechargeManagement = () => {
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("admin-recharge")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "recharge_requests",
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("recharge_requests")
      .select(`
        *,
        tokens (token, balance),
        payment_methods (name)
      `)
      .order("created_at", { ascending: false });

    if (data) setRequests(data);
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);

    // Update token balance
    const newBalance = (selectedRequest.tokens?.balance || 0) + selectedRequest.amount;
    
    const { error: tokenError } = await supabase
      .from("tokens")
      .update({ balance: newBalance })
      .eq("id", selectedRequest.token_id);

    if (tokenError) {
      toast.error("حدث خطأ أثناء تحديث الرصيد");
      setProcessing(false);
      return;
    }

    // Update request status
    const { error } = await supabase
      .from("recharge_requests")
      .update({ 
        status: "approved", 
        admin_notes: adminNotes || null 
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } else {
      toast.success("تم قبول طلب الشحن وإضافة الرصيد");
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    setProcessing(true);

    const { error } = await supabase
      .from("recharge_requests")
      .update({ 
        status: "rejected", 
        admin_notes: adminNotes || null 
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast.error("حدث خطأ أثناء التحديث");
    } else {
      toast.success("تم رفض طلب الشحن");
      setSelectedRequest(null);
      setAdminNotes("");
      fetchRequests();
    }
    setProcessing(false);
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

  const filteredRequests = requests.filter(
    (req) => statusFilter === "all" || req.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          إدارة طلبات الشحن
        </h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="approved">مقبول</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التوكن</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {request.tokens?.token?.slice(0, 9)}...
                    </TableCell>
                    <TableCell className="text-primary font-bold">
                      {request.amount} ر.س
                    </TableCell>
                    <TableCell>{request.payment_methods?.name || "-"}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || "");
                        }}
                      >
                        <Eye className="h-3 w-3 ml-1" />
                        عرض
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تفاصيل طلب الشحن</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">التوكن:</span>
                  <p className="font-mono" dir="ltr">{selectedRequest.tokens?.token}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">الرصيد الحالي:</span>
                  <p className="font-bold">{selectedRequest.tokens?.balance} ر.س</p>
                </div>
                <div>
                  <span className="text-muted-foreground">المبلغ المطلوب:</span>
                  <p className="font-bold text-primary">{selectedRequest.amount} ر.س</p>
                </div>
                <div>
                  <span className="text-muted-foreground">طريقة الدفع:</span>
                  <p>{selectedRequest.payment_methods?.name || "-"}</p>
                </div>
              </div>

              {selectedRequest.payment_proof && (
                <div>
                  <span className="text-muted-foreground text-sm">إثبات الدفع:</span>
                  <a
                    href={selectedRequest.payment_proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-1"
                  >
                    <img
                      src={selectedRequest.payment_proof}
                      alt="إثبات الدفع"
                      className="max-w-full h-48 object-contain rounded border"
                    />
                  </a>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">ملاحظات الإدارة:</span>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="ملاحظات اختيارية..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 ml-2" />
                          قبول وإضافة الرصيد
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 ml-2" />
                          رفض
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              {selectedRequest.admin_notes && selectedRequest.status !== "pending" && (
                <div className="p-3 bg-secondary/50 rounded">
                  <span className="text-sm text-muted-foreground">ملاحظات الإدارة:</span>
                  <p>{selectedRequest.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RechargeManagement;
